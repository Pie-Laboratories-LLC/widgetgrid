#!/usr/bin/env node
import { App } from 'aws-cdk-lib';
import { DnsStack } from '../lib/dns-stack.js';
import { SharedStack } from '../lib/shared-stack.js';
import { IdentityStack } from '../lib/identity-stack.js';
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

// Dev (WidgetgridDevGatewayStack/EksStack/RdsStack/DevIdentityStack) is
// stood up only temporarily -- development happens on local kind and
// releases go to prod, checked by infra/eks/smoke-check.sh. Last up
// 2026-10-21..22 to test the website's phase I and II, then destroyed.
// The stack classes stay in lib/: to bring it back, restore the block
// from commit 6243714's bin/app.js, deploy, test, destroy again (see
// infra/cdk/README.md's "Standing dev up temporarily").

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
