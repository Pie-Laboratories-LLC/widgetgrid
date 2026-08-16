# Local Kubernetes test rig

Runs the actual Consul Connect + Envoy sidecar wiring this project's
production target (EKS) depends on, on your own machine via
[kind](https://kind.sigs.k8s.io/). The point isn't to model EKS exactly --
it's to prove the *topology* works (sidecar injection, mesh routing,
gRPC-Web termination at the edge) against real Kubernetes/Consul/Envoy
before any of it touches a cloud bill, using the exact same Helm chart,
container image, and connect-inject annotations you'd use there.

## What this does and doesn't cover

**Covered**: `widgetgrid-server` gets a Consul-injected Envoy sidecar and
registers in Consul's catalog; a separate Envoy "edge gateway" (also
sidecar-injected, with an explicit upstream dependency on
`widgetgrid-server`) terminates gRPC-Web from outside the cluster and
routes it, mTLS'd, through the mesh to the real backend.

**Not covered, deliberately**: static asset serving (S3/CloudFront in
production, or `npm run dev:web`/`serve:static` locally -- unrelated to
what's being tested here), HA Consul server sizing (this runs one server
replica), and TLS from the outside world into the cluster (kind exposes
plain HTTP on localhost -- fine for a local test, not how you'd expose
this publicly).

## Prerequisites

- Docker Desktop, with WSL integration enabled for whichever distro you run
  this from (Settings > Resources > WSL Integration) -- `docker info` needs
  to succeed.
- [`kind`](https://kind.sigs.k8s.io/docs/user/quick-start/#installation),
  [`kubectl`](https://kubernetes.io/docs/tasks/tools/#kubectl),
  [`helm`](https://helm.sh/docs/intro/install/).
- [`grpcurl`](https://github.com/fullstorydev/grpcurl) if you want to test
  from the command line rather than the SPA dev server.
- Postgres running and migrated/seeded on your host, same as normal local
  dev:
  ```
  docker-compose up -d postgres
  npm run db:migrate
  npm run db:seed
  ```

`setup.sh` checks for all of the above (except Postgres) and tells you
what's missing rather than failing partway through with an unclear error.

## Run it

```
local-k8s/setup.sh
```

Idempotent -- re-running it skips cluster creation if one already exists
and re-applies everything else. Tear down with `local-k8s/teardown.sh`
(deletes the whole kind cluster).

## Testing against it

Command line:
```
grpcurl -plaintext -import-path proto -proto proto/widgetgrid/v1/page.proto \
  -d '{"slug":"home"}' localhost:8080 widgetgrid.v1.PageService/GetPageLayout
```

From the actual SPA:
```
echo "VITE_GRPC_WEB_ORIGIN=http://localhost:8080" > packages/web-app/.env.local
npm run dev:web
```
(`client.js` defaults to same-origin, which assumes the production
Envoy-serves-everything topology -- not true here, where the SPA dev server
and this gateway are genuinely different origins, which is exactly why
`local-k8s/envoy/envoy-local.yaml` has a permissive CORS policy that the
production config doesn't.) Then load a page for real. This is the
strongest test available short of an actual EKS deployment -- real gRPC-Web
framing, real mesh mTLS, real sidecar injection, browser and all.

## Verified end-to-end

This has now actually been run, on Docker Desktop/WSL2 -- the `grpcurl`
command above returns a real page layout through the full path (Envoy edge
gateway, grpc-web translation, Consul Connect mTLS, sidecar-injected
`widgetgrid-server`, Postgres on the host). Two real bugs turned up in the
process, both fixed:

- `local-k8s/envoy/envoy-local.yaml` had `cors` as a sibling of `match`/
  `route` on the `Route` object. CORS policy is a field of `RouteAction`
  (nested under `route:`), not of `Route` itself -- Envoy rejected the
  config outright (`no such field: 'cors'`) and `envoy-gateway` crash-looped
  on every boot. Fixed by nesting it correctly.
- `envoy-gateway`'s pod had transparent proxy enabled, Consul's
  cluster-wide default (`connectInject` in `local-k8s/consul-values.yaml`
  doesn't override it). That intercepts *inbound* traffic to the pod too,
  and expects mesh mTLS -- fine for `widgetgrid-server` (only ever called
  from inside the mesh) but wrong for this pod specifically, since it's the
  public edge and host/NodePort traffic on `:8080` arrives as plain HTTP.
  Connections were accepted at the TCP level and then silently reset before
  any HTTP was parsed. Fixed with
  `consul.hashicorp.com/transparent-proxy: "false"` on the deployment --
  safe since its outbound upstream is already explicit (the
  `connect-service-upstreams` annotation), not transparent-proxy-routed.

One environment quirk also turned up, not a bug in this repo: `DATABASE_URL`
originally used `host.docker.internal`, which resolves and completes a TCP
handshake fine from inside a container on this Docker Desktop/WSL2 setup,
but connections through it reset partway into any real protocol exchange
(confirmed directly -- a raw Postgres query over `host.docker.internal`
reset after ~5s, reproduced from both a kind node and a plain non-kind
container; the same query over the `kind` Docker network's own bridge
gateway IP succeeded in single-digit ms). `setup.sh` now computes that
gateway IP with `docker network inspect kind` at apply time (the subnet
Docker assigns isn't guaranteed stable across `kind create cluster` runs,
so it can't be hardcoded) and uses it for `DATABASE_URL` instead. If you
hit `ECONNRESET` from `widgetgrid-server` again on some other Docker setup
where this *isn't* the problem, that's the first thing to rule back out:

```
kubectl exec -n widgetgrid deploy/widgetgrid-server -- sh -c \
  "node -e \"require('node:dns').lookup('host.docker.internal',(e,a)=>console.log(e||a))\""
```

The escape hatch mentioned in earlier revisions of this doc -- running
Postgres as its own pod inside the kind cluster instead of reusing the
host's `docker-compose` one -- turned out not to be necessary; the gateway-IP
fix above resolved it without adding that extra moving part.
