#!/usr/bin/env node
import { App } from 'aws-cdk-lib';
import { DnsStack } from '../lib/dns-stack.js';
import { SharedStack } from '../lib/shared-stack.js';
import { IdentityStack, AUTH_HOST } from '../lib/identity-stack.js';
import { DevIdentityStack } from '../lib/dev-identity-stack.js';
import { DevGatewayStack } from '../lib/dev-gateway-stack.js';
import { EksStack } from '../lib/eks-stack.js';
import { RdsStack } from '../lib/rds-stack.js';
import { ProdGatewayStack } from '../lib/prod-gateway-stack.js';
import { ProdEksStack } from '../lib/prod-eks-stack.js';
import { ProdRdsStack } from '../lib/prod-rds-stack.js';

// Region pinned explicitly rather than left to AWS_REGION/AWS_DEFAULT_REGION
// -- account comes from whatever credentials are active, region doesn't (no
// region was specified when this was set up; us-east-1 was the default
// picked, flagged for the user to redirect before first deploy if they
// wanted somewhere else).
const env = { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'us-east-1' };

const app = new App();
const dns = new DnsStack(app, 'WidgetgridDnsStack', { env });
// ECR repos used by both environments -- see shared-stack.js.
new SharedStack(app, 'WidgetgridSharedStack', { env });
// Cognito + Identity Center sign-in for both environments -- see identity-stack.js.
new IdentityStack(app, 'WidgetgridIdentityStack', { env, hostedZone: dns.hostedZone });

// Dev: stood up temporarily (2026-10-21) to test the website's phase 1 --
// registration, SES, the message boards -- before it goes to prod. It was
// torn down 2026-10-14 (development happens on local kind) and comes down
// again with `cdk destroy` once that's done; the stack classes stay in lib/
// either way.
//
// The ALB's sign-in gate uses the shared pool's DevAlbClient by id (see
// dev-gateway-stack.js for why not a construct reference); the app's own
// sign-in is dev's own short-lived pool.
new DevIdentityStack(app, 'WidgetgridDevIdentityStack', { env });
const devGateway = new DevGatewayStack(app, 'WidgetgridDevGatewayStack', {
  env,
  hostedZone: dns.hostedZone,
  certificate: dns.certificate,
  userPoolId: 'us-east-1_DC0Ukf8jA',
  devAlbClientId: '7cipfmua47oqo3n8frno51ifa5',
  authHost: AUTH_HOST,
});
// One-directional: both take vpc from DevGatewayStack (see
// dev-gateway-stack.js's comment on why it isn't the other way around).
const eks = new EksStack(app, 'WidgetgridEksStack', {
  env,
  vpc: devGateway.vpc,
  albSecurityGroup: devGateway.albSecurityGroup,
});
new RdsStack(app, 'WidgetgridRdsStack', {
  env,
  vpc: devGateway.vpc,
  nodeSecurityGroup: eks.nodeSecurityGroup,
});

// Prod: fully separate VPC/cluster/RDS from dev's, no shared props between
// the two environments anywhere here -- see infra/cdk/lib/prod-gateway-stack.js's
// header comment. Same one-directional wiring pattern dev's stacks used.
const prodGateway = new ProdGatewayStack(app, 'WidgetgridProdGatewayStack', {
  env,
  hostedZone: dns.hostedZone,
});
const prodEks = new ProdEksStack(app, 'WidgetgridProdEksStack', {
  env,
  vpc: prodGateway.vpc,
  albSecurityGroup: prodGateway.albSecurityGroup,
});
new ProdRdsStack(app, 'WidgetgridProdRdsStack', {
  env,
  vpc: prodGateway.vpc,
  nodeSecurityGroup: prodEks.nodeSecurityGroup,
});
