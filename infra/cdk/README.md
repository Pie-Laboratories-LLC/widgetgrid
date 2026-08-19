# dev.pie-laboratories.com access gateway + app deployment

Four CDK stacks. `WidgetgridDnsStack` and `WidgetgridDevGatewayStack` put an
identity-gated front door in front of `dev.pie-laboratories.com`; both are
deployed and SSO login via IAM Identity Center is confirmed working (Steps
1-6 below are done). `WidgetgridEksStack` and `WidgetgridRdsStack` run the
actual app (`packages/server`, `packages/static-server`, Postgres, all
mesh-routed through Consul Connect + Envoy -- the same topology
`local-k8s/` proves locally) behind that front door.

## What this does and doesn't cover

**Covered**: a public Route53 hosted zone + ACM cert for
`dev.pie-laboratories.com`; an internet-facing ALB in a VPC (public subnets
for the ALB, private subnets + 1 NAT gateway for the EKS node group and
RDS); a Cognito-backed auth wall on the HTTPS listener, federated via SAML
to IAM Identity Center as the sole login path; an EKS cluster running
Consul Connect + an Envoy edge gateway + `widgetgrid-server` +
`static-server`; a single-AZ RDS Postgres instance. Anyone can reach the
ALB; nobody gets past the listener without authenticating, and nothing
behind the listener is reachable except through it.

**Not covered, deliberately**: `test.pie-laboratories.com` (explicitly not
being provisioned yet -- "probably never used", not worth the standing
cost/complexity until it actually is); a real SMS provider (packages/server's
`smsSender.js` still just console-logs -- see its own header comment);
S3-backed blog content (`blogSource.js` reads `content/blog` baked into the
`widgetgrid-server` image -- its S3 path is "documented but not built");
HA Consul / Multi-AZ RDS / redundant NAT gateways (cost-minimized dev tier
throughout, not production sizing -- see Step 7).

## Why ALB + Cognito, not ALB straight to IAM Identity Center

ALB's built-in auth actions only speak Cognito or generic OIDC, never SAML,
and Identity Center's own OIDC support is built for the AWS CLI's
device-code login flow -- not something a browser-redirect web app can
register against. Cognito bridges the gap: ALB authenticates against
Cognito's Hosted UI natively, and Cognito federates to Identity Center via
SAML. (AWS Verified Access is the fully-turnkey version of this exact
pattern, but runs ~$0.27/hr *per app* -- not worth it here.)

**One thing CDK genuinely can't do**: registering Cognito as a SAML
application inside Identity Center has no CloudFormation resource
(`AWS::SSO::Application` only supports OAuth 2.0 apps). That step, and
enabling Identity Center itself if it isn't already on, are manual
console actions -- see Steps 1 and 4 below.

## Prerequisites

- AWS credentials with permission to create the resources below, available
  via the standard credential chain (env vars or `~/.aws/credentials`).
- Node (this repo's version) + `npm install` from the repo root, or
  `npm install --workspace infra/cdk`.
- `pie-laboratories.com` registered *through Route53 directly* (confirmed --
  this account already has a Route53-Registrar-managed hosted zone for it,
  with live NS delegation). `dns-stack.js` looks that zone up rather than
  creating one; if this is ever pointed at a domain registered elsewhere
  instead, that lookup needs to become a real `new HostedZone(...)` plus a
  manual registrar NS update, same as normal.

## Steps

Not a single `cdk deploy` -- this interleaves CDK deploys with manual
console/script steps, in order:

1. **Done.** IAM Identity Center enabled for this account.
2. **Done.** `WidgetgridDnsStack` deployed.
3. **Done.** `WidgetgridDevGatewayStack` deployed (bootstrap self-signup path).
4. **Done.** Identity Center SAML application created; Cognito federated to it.
5. **Done.** SSO login confirmed end-to-end at `https://dev.pie-laboratories.com`.
6. **Done.** `selfSignUpEnabled: false` -- Identity Center SSO is the only
   login path now.
7. `npm run deploy --workspace infra/cdk -- WidgetgridEksStack`, then
   `npm run deploy --workspace infra/cdk -- WidgetgridRdsStack`. Cost-minimized
   dev tier throughout: single Consul server, 2×t3.medium EKS nodes,
   single-AZ `db.t4g.micro`, 1 NAT gateway -- see `eks-stack.js`/`rds-stack.js`
   for the reasoning. `WidgetgridEksStack` prints `EnvoyTargetGroupArn`,
   needed in step 9.
8. `infra/eks/deploy.sh` -- builds + pushes the `widgetgrid-server` and
   `static-server` images to ECR, installs Consul (Helm), runs migrations
   (a one-off k8s Job against RDS), applies the app manifests. Safe to
   re-run for app updates, same as `local-k8s/setup.sh`. See that script's
   own comments for what each step does and why.
9. `npm run deploy --workspace infra/cdk -- WidgetgridDevGatewayStack -c envoyTargetGroupArn=<value from step 7>`.
   This is **not** a live CDK cross-stack reference on purpose -- see
   `eks-stack.js`'s constructor comment: `WidgetgridEksStack` already
   depends on this stack's `vpc`/`albSecurityGroup`, so having the target
   group flow back the same way would be a circular CloudFormation stack
   dependency. The listener's `defaultAction` swaps from the
   `fixedResponse` placeholder to `forward([targetGroup])` once this
   context value is set; omitting it keeps the placeholder (so this stack
   stays deployable on its own before `WidgetgridEksStack` exists).
10. Verify SSO login now reaches the real app (see "Testing against it").

## Testing against it

```
cdk synth   # from infra/cdk -- validates the app synthesizes; no AWS creds needed
cdk diff    # before each deploy
curl -v https://dev.pie-laboratories.com   # redirects to Cognito Hosted UI, then (post step 10) the real app
kubectl get pods -n widgetgrid             # after infra/eks/deploy.sh
grpcurl -plaintext ... # see local-k8s/README.md's example, adapted to hit the real host through the mesh from inside the cluster
```

## Cost note

The recurring bill for `WidgetgridEksStack` + `WidgetgridRdsStack`: EKS's
flat ~$0.10/hr control plane, 2×t3.medium, 1 NAT gateway, `db.t4g.micro`,
plus the existing ALB. `infra/eks/teardown.sh` drops the workloads (cheap to
redo via `infra/eks/deploy.sh`) without touching the cluster/RDS/ECR
themselves; `cdk destroy WidgetgridEksStack WidgetgridRdsStack` is the actual
cost-saving teardown when this environment isn't needed for a while --
`WidgetgridDnsStack`/`WidgetgridDevGatewayStack` can stay up independently
since neither depends on the other two.
