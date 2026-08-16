# WidgetGrid

A database-driven, multi-page Vue SPA framework. Every page's layout and
content comes from Postgres, loaded in two passes:

1. **Layout pass** -- fetch a page's Bootstrap row/col tree. Renders
   instantly as empty/loading widget slots.
2. **Content pass** -- batch-fetch the content for every widget the layout
   revealed.

Widgets are independently-built, independently-deployable JS modules --
adding a new widget type needs no rebuild of the main app, just a new bundle
dropped alongside the others plus a database row. All API traffic (both
passes, and future server-push) goes through one set of gRPC services.

See `/home/kazaak/.claude/plans/iridescent-splashing-falcon.md` for the full
design rationale; this README is the quickstart.

## Quickstart

```
npm install
cp .env.example .env               # adjust DATABASE_URL etc. if needed
docker-compose up -d postgres      # or point .env at your own Postgres
npm run db:migrate
npm run db:seed                    # seeds a demo "home" page

npm run proto:fetch-plugin         # one-time: see docs/LOCAL_DEV_PREREQUISITES.md
npm run proto:gen-web

npm run build:widgets
npm run dev:web                    # http://localhost:5173, proxying nothing --
                                    # see below for talking to a real backend
npm run dev:server                 # separately: the grpc-js backend on :50051
```

`dev:web`'s dev server alone won't reach the backend -- gRPC-Web needs
something to terminate it (Envoy in production; see
`docs/LOCAL_DEV_PREREQUISITES.md` for the full picture, including why
Postgres is the only thing this repo's `docker-compose.yml` provides). For
that, either run `packages/server` directly with something speaking
gRPC-Web in front of it, or see `local-k8s/README.md` for a full local
Consul Connect + Envoy + Kubernetes rig that mirrors the real EKS target.

For a full production-shaped build:

```
npm run build:web
npm run build:widgets
npm run assemble-static            # -> dist-static/
npm run serve:static               # sirv, http://localhost:8081
```

## Structure

```
proto/           .proto service definitions + codegen scripts
packages/db/      Postgres migrations, repos, seed script
packages/server/  grpc-js backend
packages/web-app/ the Vue SPA shell
packages/vite-widget-lib/  shared Vite config for building widget bundles
packages/static-server/    prod static file server (sirv)
widgets/          independently-built widget packages (richtext, table, ...)
infra/            Envoy/Consul reference config (see docs/LOCAL_DEV_PREREQUISITES.md)
local-k8s/        local kind cluster running the real Consul Connect + Envoy wiring (see local-k8s/README.md)
```

## Status

Runtime engine only -- no admin/authoring UI yet. Pages/widgets are managed
via `packages/db/seeds/seed.mjs` or direct SQL for now.
