import { Stack, CfnOutput } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53Targets from 'aws-cdk-lib/aws-route53-targets';
import { Certificate, CertificateValidation } from 'aws-cdk-lib/aws-certificatemanager';
import { ENVOY_GATEWAY_NODE_PORT } from './eks-stack.js';

const PROD_HOST = 'www.pie-laboratories.com';
const APEX_HOST = 'pie-laboratories.com';

// The public sibling of DevGatewayStack -- same VPC/ALB/NodePort-egress
// shape, but no Cognito/SAML wall at all: this is the environment meant to
// be reachable by anyone, not gated behind SSO the way dev deliberately
// is. A new file rather than a parameterized DevGatewayStack, same
// reasoning as prod-eks-stack.js/prod-rds-stack.js -- that stack is live,
// working, and not worth risking for a structurally different (no-auth)
// listener.
//
// Owns its own Certificate (rather than DnsStack growing a second one) so
// DnsStack -- and dev's already-issued cert -- stays completely untouched
// by this work.
export class ProdGatewayStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);
    const { hostedZone } = props;

    // Own VPC, not shared with dev -- see the deploy plan's isolation
    // decision. Same cost-minimized tier as dev's (2 AZ, 1 NAT gateway).
    const vpc = new ec2.Vpc(this, 'Vpc', {
      maxAzs: 2,
      natGateways: 1,
      subnetConfiguration: [
        { name: 'public', subnetType: ec2.SubnetType.PUBLIC, cidrMask: 24 },
        { name: 'private', subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS, cidrMask: 24 },
      ],
    });
    this.vpc = vpc;

    const alb = new elbv2.ApplicationLoadBalancer(this, 'Alb', {
      vpc,
      internetFacing: true,
    });
    this.albSecurityGroup = alb.connections.securityGroups[0];

    // Same egress-rule gap as DevGatewayStack's identical comment explains
    // -- a target group referenced by ARN (not a local construct) doesn't
    // get its matching egress side added automatically.
    this.albSecurityGroup.addEgressRule(
      ec2.Peer.ipv4(vpc.vpcCidrBlock),
      ec2.Port.tcp(ENVOY_GATEWAY_NODE_PORT),
      'ALB to envoy-gateway NodePort on any node in the VPC',
    );

    alb.addRedirect({
      sourceProtocol: elbv2.ApplicationProtocol.HTTP,
      sourcePort: 80,
      targetProtocol: elbv2.ApplicationProtocol.HTTPS,
      targetPort: 443,
    });

    new route53.ARecord(this, 'ProdAliasRecord', {
      zone: hostedZone,
      recordName: 'www',
      target: route53.RecordTarget.fromAlias(new route53Targets.LoadBalancerTarget(alb)),
    });

    // Apex (pie-laboratories.com, no subdomain) aliases the same ALB --
    // it never reaches the app itself, only exists so the redirect rule
    // below has something to answer on. recordName omitted, not 'www' or
    // '', to alias the zone's own root.
    new route53.ARecord(this, 'ApexAliasRecord', {
      zone: hostedZone,
      target: route53.RecordTarget.fromAlias(new route53Targets.LoadBalancerTarget(alb)),
    });

    // APEX_HOST as a SAN, not a second Certificate -- one cert covers both
    // names this ALB terminates TLS for.
    const certificate = new Certificate(this, 'ProdCertificate', {
      domainName: PROD_HOST,
      subjectAlternativeNames: [APEX_HOST],
      validation: CertificateValidation.fromDns(hostedZone),
    });

    // Set via `-c prodEnvoyTargetGroupArn=<arn>` on this stack's next
    // deploy, AFTER WidgetgridProdEksStack has deployed and printed its
    // EnvoyTargetGroupArn output -- same one-directional hand-off as dev's
    // `envoyTargetGroupArn` context key (see dev-gateway-stack.js's
    // identical comment), under its own key so the two environments' CDK
    // context values can never collide.
    const envoyTargetGroupArn = this.node.tryGetContext('prodEnvoyTargetGroupArn');
    const next = envoyTargetGroupArn
      ? elbv2.ListenerAction.forward([
          elbv2.ApplicationTargetGroup.fromTargetGroupAttributes(this, 'EnvoyTargetGroup', {
            targetGroupArn: envoyTargetGroupArn,
          }),
        ])
      : elbv2.ListenerAction.fixedResponse(200, {
          contentType: 'text/plain',
          messageBody: 'widgetgrid prod -- nothing deployed here yet',
        });

    // No AuthenticateCognitoAction wrapper -- this is the whole point of
    // this stack existing separately from DevGatewayStack: public,
    // unauthenticated at the gateway. The app's own owner-login flow
    // (SMS code, see packages/server/src/services/authService.js) is
    // still the only gate on any administrative action, same as it always
    // was underneath dev's SSO wall.
    const httpsListener = alb.addListener('HttpsListener', {
      port: 443,
      certificates: [certificate],
      defaultAction: next,
    });

    // Apex requests never reach the target group -- a real ALB-level 301
    // to the www host, no compute involved, evaluated before the listener's
    // default (forward) action since it's a listener rule rather than that
    // default action itself.
    httpsListener.addAction('ApexRedirect', {
      priority: 1,
      conditions: [elbv2.ListenerCondition.hostHeaders([APEX_HOST])],
      action: elbv2.ListenerAction.redirect({
        host: PROD_HOST,
        permanent: true,
      }),
    });

    new CfnOutput(this, 'ProdUrl', { value: `https://${PROD_HOST}` });
  }
}
