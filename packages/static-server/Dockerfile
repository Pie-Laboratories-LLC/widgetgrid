# Build context MUST be the repo root, same reason as packages/server/Dockerfile:
# npm workspaces needs every workspace's package.json present for `npm ci` to
# trust package-lock.json.
#
#   docker build -f packages/static-server/Dockerfile -t widgetgrid-static:local .
#
# Unlike packages/server/Dockerfile, the build stage here needs the FULL repo
# (every widget, web-app, proto codegen) since its job is producing
# dist-static/ (see scripts/assemble-static.mjs), not just running a Node
# process -- so this doesn't bother with the per-package.json COPY trick that
# file uses for layer-cache/lockfile-consistency purposes; it needs
# everything anyway.
#
# Build stage is `node:24` (glibc/Debian), NOT `node:24-alpine`: proto codegen
# depends on two natively-compiled third-party binaries -- grpc-tools'
# bundled `grpc_tools_node_protoc` and proto/scripts/fetch-protoc-gen-grpc-web.mjs's
# downloaded `protoc-gen-grpc-web` (see docs/LOCAL_DEV_PREREQUISITES.md) --
# built against glibc, not musl. They won't run on Alpine without extra
# compatibility packages, so the build stage stays glibc-based; only the
# runtime stage (which needs none of this) uses alpine, same as
# packages/server/Dockerfile.

FROM node:24 AS build
WORKDIR /app

# widgets/solitaire's build depends on a SEPARATE sibling repo
# (~/GIT/solitaire, not a widgetgrid workspace -- see
# widgets/solitaire/scripts/vendor-solitaire.mjs), which Docker's build
# context can never reach directly (it's outside the context root, and
# COPY can't cross that boundary regardless of path). infra/eks/deploy.sh
# stages that repo's build output into widgets/solitaire/.vendor-src/
# (gitignored, dockerignore-excepted) BEFORE `docker build` runs, precisely
# so it ends up inside this COPY -- this ENV just points the vendoring
# script at that staged copy instead of its default `../../../solitaire`
# guess, which wouldn't exist inside this container regardless.
ENV SOLITAIRE_REPO_DIR=/app/widgets/solitaire/.vendor-src

COPY . .
# No --ignore-scripts here (unlike packages/server/Dockerfile): grpc-tools'
# postinstall is what makes grpc_tools_node_protoc available, and root
# package.json's allowScripts explicitly allowlists it + protobufjs for
# exactly this reason.
RUN npm ci

# Fetches .tools/protoc-gen-grpc-web (see proto/scripts/fetch-protoc-gen-grpc-web.mjs)
# then generates packages/proto-gen-web/ (gitignored, same as local dev).
RUN npm run proto:fetch-plugin && npm run proto:gen-web

# Widgets before web-app: packages/web-app's own `prebuild` script
# (vendor-vue.mjs + copy-widgets.mjs) copies each widget's dist/*.js into
# web-app's public/ before `vite build` runs, so it needs to find them
# already built.
RUN npm run build:widgets
RUN npm run build:web
RUN npm run assemble-static


FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production

# Same lockfile-consistency reasoning as packages/server/Dockerfile: every
# workspace's package.json needs to be present for `npm ci` to trust
# package-lock.json, even though only static-server's own dependency (sirv)
# actually gets installed here.
COPY package.json package-lock.json ./
COPY packages/db/package.json packages/db/package.json
COPY packages/server/package.json packages/server/package.json
COPY packages/proto-gen-web/package.json packages/proto-gen-web/package.json
COPY packages/static-server/package.json packages/static-server/package.json
COPY packages/vite-widget-lib/package.json packages/vite-widget-lib/package.json
COPY packages/web-app/package.json packages/web-app/package.json
COPY widgets/richtext/package.json widgets/richtext/package.json
COPY widgets/table/package.json widgets/table/package.json
COPY widgets/splash/package.json widgets/splash/package.json
COPY widgets/topbar/package.json widgets/topbar/package.json
COPY widgets/rightrail/package.json widgets/rightrail/package.json
COPY widgets/blog/package.json widgets/blog/package.json
RUN npm ci --omit=dev --ignore-scripts --workspace packages/static-server --include-workspace-root

COPY --chown=node:node packages/static-server/src packages/static-server/src
COPY --from=build --chown=node:node /app/dist-static ./dist-static

USER node
EXPOSE 8081

# STATIC_DIR is left unset -- src/index.js's default (`../../../dist-static`
# relative to this file) resolves to /app/dist-static, exactly where the
# line above puts it. Same "no env override needed" story as
# packages/server/Dockerfile's GRPC_SERVER_HOST.
CMD ["node", "packages/static-server/src/index.js"]
