import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Stack, CfnOutput } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as elbv2Actions from 'aws-cdk-lib/aws-elasticloadbalancingv2-actions';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53Targets from 'aws-cdk-lib/aws-route53-targets';
import { ENVOY_GATEWAY_NODE_PORT } from './eks-stack.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEV_HOST = 'dev.pie-laboratories.com';
// Downloaded from the "customer managed SAML 2.0 application" set up by
// hand in the IAM Identity Center console (see infra/cdk/README.md step 4
// -- no CloudFormation resource exists for creating that application
// itself). Not sensitive -- SAML IdP metadata is meant to be shared with
// service providers, same as an OIDC issuer's JWKS endpoint.
//
// Read eagerly (not lazily inside the stack) and passed as content, not a
// path: UserPoolIdentityProviderSamlMetadata.file() takes the actual XML
// string despite the "file" name (confirmed by reading aws-cdk-lib's own
// source -- the parameter is literally called `fileContent`) -- passing a
// path string through directly, which is what this looked like it wanted,
// makes Cognito reject it outright ("Input XML is invalid") since it tries
// to parse the path itself as XML.
const SAML_METADATA_XML = readFileSync(path.join(__dirname, '../identity-center-saml-metadata.xml'), 'utf8');

// Everything here is expected to change a lot once the real app (currently
// only proven locally via local-k8s/) gets deployed on top of it -- kept
// separate from DnsStack for exactly that reason.
export class DevGatewayStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);
    const { hostedZone, certificate } = props;

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

    // selfSignUpEnabled: false -- SSO via Identity Center is confirmed
    // working (plan step 6), so the bootstrap fallback path is retired.
    const userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: 'widgetgrid-dev',
      selfSignUpEnabled: false,
      signInAliases: { email: true },
    });

    // Domain prefix must be globally unique across all of Cognito in this
    // partition, not just this account -- "widgetgrid-dev" is a guess at
    // something unclaimed; if `cdk deploy` fails on this specifically,
    // that's why, and a different prefix is the fix (not a code bug).
    const userPoolDomain = userPool.addDomain('UserPoolDomain', {
      cognitoDomain: { domainPrefix: 'widgetgrid-dev' },
    });

    // Identity Center is the IdP, Cognito is the SAML service provider --
    // the ACS URL/audience entered on Identity Center's side
    // (https://<UserPoolDomainUrl>/saml2/idpresponse and
    // urn:amazon:cognito:sp:<userPoolId>, see the README) are what makes
    // this the other half of that trust relationship.
    const identityCenterProvider = new cognito.UserPoolIdentityProviderSaml(this, 'IdentityCenterSaml', {
      userPool,
      name: 'IdentityCenter',
      metadata: cognito.UserPoolIdentityProviderSamlMetadata.file(SAML_METADATA_XML),
      // Identity Center's Subject is mapped to email (format emailAddress)
      // for the NameID/federated-user-identity itself, but Cognito still
      // needs a real attribute statement to populate the user's email --
      // that's the separate "email" attribute row added on the Identity
      // Center application's attribute mapping page.
      attributeMapping: {
        email: cognito.ProviderAttribute.other('email'),
      },
    });

    const userPoolClient = userPool.addClient('UserPoolClient', {
      generateSecret: true, // required for ALB's Cognito auth action
      oAuth: {
        flows: { authorizationCodeGrant: true },
        scopes: [cognito.OAuthScope.OPENID, cognito.OAuthScope.EMAIL],
        // Fixed path ALB's Cognito auth action expects the OAuth callback
        // on -- not configurable on the ALB side, so this has to match
        // exactly.
        callbackUrls: [`https://${DEV_HOST}/oauth2/idpresponse`],
      },
      // COGNITO dropped (plan step 6) -- Identity Center SSO is confirmed
      // working, so it's the only supported IdP now.
      supportedIdentityProviders: [
        cognito.UserPoolClientIdentityProvider.custom(identityCenterProvider.providerName),
      ],
    });
    userPoolClient.node.addDependency(identityCenterProvider);

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
        userPoolClient,
        userPoolDomain,
        next,
      }),
    });

    new CfnOutput(this, 'DevUrl', { value: `https://${DEV_HOST}` });
    new CfnOutput(this, 'UserPoolId', { value: userPool.userPoolId });
    new CfnOutput(this, 'UserPoolDomainUrl', { value: userPoolDomain.baseUrl() });
  }
}
