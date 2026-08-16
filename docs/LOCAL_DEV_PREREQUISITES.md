# Local dev prerequisites

## Always needed

- **Node.js** (developed against v24.18/npm 11.16) and npm workspaces --
  `npm install` at the repo root installs everything.
- **PostgreSQL** -- `docker-compose up postgres` if you have Docker, or point
  `DATABASE_URL` (see `.env.example`) at your own instance. Then:
  ```
  npm run db:migrate
  npm run db:seed
  ```

## Needed for browser proto codegen (`npm run proto:gen-web`)

- Nothing beyond `npm install` for the protoc binary itself -- `grpc-tools`
  ships a bundled `grpc_tools_node_protoc`, no system `protoc` required.
- `protoc-gen-grpc-web`, the plugin that actually generates the browser
  client stubs, is **not** installed via its npm package. That package
  (`protoc-gen-grpc-web` on npm, an unofficial third-party wrapper -- not
  published by the grpc-web project) pulls in `download` -> `decompress` ->
  `got` -> `http-cache-semantics`, and `decompress` has a critical-severity,
  no-fix-available Zip Slip vulnerability (GHSA-mp2f-45pm-3cg9) purely to
  unpack this one binary at install time. Instead:
  ```
  npm run proto:fetch-plugin
  ```
  downloads the official binary directly from
  https://github.com/grpc/grpc-web/releases over HTTPS (no archive
  extraction, no vulnerable dependency chain) to `.tools/protoc-gen-grpc-web`
  (gitignored -- re-run this after a clean clone). Supports linux-x64,
  darwin-x64/arm64, win32-x64; see
  `proto/scripts/fetch-protoc-gen-grpc-web.mjs` if you're on something else.
- Then: `npm run proto:gen-web` (regenerates `packages/proto-gen-web/`,
  also gitignored -- re-run after changing any `.proto` file).

## Needed for the full stack (Envoy + Consul Connect)

**For local testing specifically, see `local-k8s/README.md` instead of the
rest of this section** -- it's a self-contained kind + Helm + kubectl setup
that stands up real Consul Connect + Envoy on your machine, with its own
prerequisite list and setup script. The rest of this section is about the
*production* topology (EKS), which `local-k8s/` mirrors but doesn't require.

Not installable via this repo's `docker-compose.yml` (Postgres only) --
your Envoy/Consul config is specific to your actual mesh setup, not
something a one-size-fits-all compose file could provide:

- **Envoy**, configured per `infra/envoy/envoy.yaml` (a reference sketch,
  not runnable as-is -- see the comments in that file and
  `infra/consul/CONNECT_NOTES.md`).
- **Consul**, with Connect enabled, registering `packages/server` as a
  service with a sidecar proxy. See `infra/consul/CONNECT_NOTES.md`.

Without these, `packages/server` is still fully runnable and testable on
its own (`npm run dev:server`, `npm run test --workspace packages/server`,
`npm run test:e2e --workspace packages/server`) -- you just can't reach it
from a browser via gRPC-Web without something terminating that protocol in
front of it.

## What's actually been verified without any of the above

Everything except a live Postgres/Envoy/Consul and a real browser round
trip has been built and verified end-to-end in this repo already:
proto-loader resolving the `.proto` files, the full gRPC server<->client
wire path (a real `@grpc/grpc-js` server + client, bypassing Envoy), every
package's unit tests, every widget/app `vite build` (confirming Vue is
externalized rather than duplicated across bundles), the assembled
`dist-static/` tree, and `packages/static-server` actually serving it
(SPA-fallback routing, real files served directly). The remaining gap is
specifically: Postgres actually running, Envoy's `grpc_web` filter actually
translating a real browser call, and Consul Connect's service
discovery/mTLS -- all of which need your own machine.
