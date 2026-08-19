#!/usr/bin/env node
import { App } from 'aws-cdk-lib';
import { DnsStack } from '../lib/dns-stack.js';
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
const devGateway = new DevGatewayStack(app, 'WidgetgridDevGatewayStack', {
  env,
  hostedZone: dns.hostedZone,
  certificate: dns.certificate,
});
// One-directional: both take vpc from DevGatewayStack (already deployed --
// see dev-gateway-stack.js's comment on why it isn't the other way around).
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
// header comment. Same one-directional wiring pattern as dev's trio above.
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
