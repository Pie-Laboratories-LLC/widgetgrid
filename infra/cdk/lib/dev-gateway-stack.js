import { Stack, CfnOutput } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as elbv2Actions from 'aws-cdk-lib/aws-elasticloadbalancingv2-actions';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53Targets from 'aws-cdk-lib/aws-route53-targets';
import { ENVOY_GATEWAY_NODE_PORT } from './eks-stack.js';

const DEV_HOST = 'dev.pie-laboratories.com';

export class DevGatewayStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);
    // The gate signs in through WidgetgridIdentityStack's pool (shared with
    // prod) and its dev-ALB client, imported by id rather than passed as
    // constructs: a construct reference would make this stack depend on
    // WidgetgridIdentityStack, and `cdk deploy` of dev would then deploy
    // the shared pool -- prod's login -- along with it. The app's own
    // sign-in on dev is a separate pool (dev-identity-stack.js).
    const { hostedZone, certificate, userPoolId, devAlbClientId, authHost } = props;
    const userPool = cognito.UserPool.fromUserPoolId(this, 'GateUserPool', userPoolId);
    const devAlbClient = cognito.UserPoolClient.fromUserPoolClientId(this, 'GateClient', devAlbClientId);
    const userPoolDomain = cognito.UserPoolDomain.fromDomainName(this, 'GateDomain', authHost);

    // Private subnets + 1 NAT gateway (up from 0): the EKS node group and
    // RDS instance (WidgetgridEksStack/WidgetgridRdsStack) now need
    // somewhere to live. 1 NAT, not one per AZ -- cost-minimized dev tier,
    // same posture as everything else in this stack; see
    // infra/cdk/README.md.
    const vpc = new ec2.Vpc(this, 'Vpc', {
      maxAzs: 2,
      natGateways: 1,
      subnetConfiguration: [
        { name: 'public', subnetType: ec2.SubnetType.PUBLIC, cidrMask: 24 },
        { name: 'private', subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS, cidrMask: 24 },
      ],
    });
    // Exposed for WidgetgridEksStack/WidgetgridRdsStack (one-directional --
    // both depend on this stack's vpc, not the other way; see
    // eks-stack.js's constructor comment for why the target group can't
    // flow back the same way).
    this.vpc = vpc;

    const alb = new elbv2.ApplicationLoadBalancer(this, 'Alb', {
      vpc,
      internetFacing: true,
    });
    // Exposed for WidgetgridEksStack (a one-directional reference -- that
    // stack depends on this one, not the other way around, see
    // eks-stack.js's constructor comment) to open its node group's NodePort
    // up to ALB traffic.
    this.albSecurityGroup = alb.connections.securityGroups[0];

    // The OTHER half of that same rule: EksStack adds the INGRESS side (node
    // SG allowing FROM this ALB SG), but this stack has no live reference to
    // that node SG to add the matching EGRESS side the normal CDK way (same
    // circular-dependency reasoning as the target group ARN, see
    // eks-stack.js's constructor comment) -- CDK's own
    // albTargetGroupCannotRegisterListener warning is exactly this gap
    // ("security groups might need to be updated manually" whenever a
    // target group is referenced by ARN instead of a local construct).
    // Missing this meant the ALB's security group only had the
    // Cognito-IdP-reaching 443 egress rule CDK adds automatically for
    // AuthenticateCognitoAction -- confirmed the hard way (targets stuck
    // `unhealthy`/Target.Timeout despite the NodePort responding instantly
    // to a plain curl from inside the VPC). Scoped to the VPC's own CIDR
    // rather than a specific security group, since crossing that boundary
    // would reintroduce the same circular-dependency problem.
    this.albSecurityGroup.addEgressRule(
      ec2.Peer.ipv4(vpc.vpcCidrBlock),
      ec2.Port.tcp(ENVOY_GATEWAY_NODE_PORT),
      'ALB to envoy-gateway NodePort on any node in the VPC',
    );
    // Plain HTTP just redirects -- the auth wall only exists on 443.
    alb.addRedirect({
      sourceProtocol: elbv2.ApplicationProtocol.HTTP,
      sourcePort: 80,
      targetProtocol: elbv2.ApplicationProtocol.HTTPS,
      targetPort: 443,
    });

    new route53.ARecord(this, 'DevAliasRecord', {
      zone: hostedZone,
      recordName: 'dev',
      target: route53.RecordTarget.fromAlias(new route53Targets.LoadBalancerTarget(alb)),
    });

    // Set via `-c envoyTargetGroupArn=<arn>` on this stack's next deploy,
    // AFTER WidgetgridEksStack has deployed and printed its
    // EnvoyTargetGroupArn output -- not a live CDK cross-stack construct
    // reference (see eks-stack.js's constructor comment for why: this
    // stack's vpc/albSecurityGroup already flow INTO EksStack, so having
    // EksStack's target group flow back via a real construct reference
    // would be a circular CloudFormation stack dependency). Falls back to
    // the fixedResponse placeholder when absent, so this stack stays
    // deployable on its own before EksStack exists.
    const envoyTargetGroupArn = this.node.tryGetContext('envoyTargetGroupArn');
    const next = envoyTargetGroupArn
      ? elbv2.ListenerAction.forward([
          elbv2.ApplicationTargetGroup.fromTargetGroupAttributes(this, 'EnvoyTargetGroup', {
            targetGroupArn: envoyTargetGroupArn,
          }),
        ])
      : elbv2.ListenerAction.fixedResponse(200, {
          contentType: 'text/plain',
          messageBody: 'widgetgrid dev -- nothing deployed here yet',
        });

    alb.addListener('HttpsListener', {
      port: 443,
      certificates: [certificate],
      // No `conditions`/`priority` -- this is the listener's default (only)
      // rule for now.
      defaultAction: new elbv2Actions.AuthenticateCognitoAction({
        userPool,
        userPoolClient: devAlbClient,
        userPoolDomain,
        next,
      }),
    });

    new CfnOutput(this, 'DevUrl', { value: `https://${DEV_HOST}` });
  }
}
