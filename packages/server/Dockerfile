# Build context MUST be the repo root, not packages/server/ itself -- npm
# workspaces needs every workspace's package.json present for `npm ci` to
# trust package-lock.json (it was generated against the full workspace set,
# not just this package):
#
#   docker build -f packages/server/Dockerfile -t widgetgrid-server:local .
#
# Only packages/server + packages/db actually run in the final image (see
# --workspace flags below); the other workspaces' package.json files below
# exist purely so npm's lockfile-consistency check has the full picture,
# without pulling their dependencies into this image.

FROM node:24-alpine AS deps
WORKDIR /app

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

# --ignore-scripts: nothing packages/server or packages/db depend on needs
# install-time scripts (that requirement -- grpc-tools' protoc binary,
# protoc-gen-grpc-web -- is a proto-codegen-time concern for the *client*
# side, see docs/LOCAL_DEV_PREREQUISITES.md; this image never runs codegen).
RUN npm ci --omit=dev --ignore-scripts --workspace packages/server --workspace packages/db --include-workspace-root


FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --from=deps --chown=node:node /app/package.json ./package.json
COPY --chown=node:node packages/db/package.json packages/db/package.json
COPY --chown=node:node packages/db/src packages/db/src
COPY --chown=node:node packages/server/package.json packages/server/package.json
COPY --chown=node:node packages/server/src packages/server/src
COPY --chown=node:node proto proto
# Local stand-in for the S3 bucket the blog reads from in production (see
# blogSource.js) -- content/blog's default resolution path assumes it's
# here, relative to this image's WORKDIR.
COPY --chown=node:node content/blog content/blog

# Migrations are NOT run from this image -- run `npm run db:migrate` from
# your host against the same Postgres (see local-k8s/README.md). This image
# is the long-running server process only.

USER node
EXPOSE 50051

# Binds 127.0.0.1 by default (see packages/server/src/index.js) -- correct
# for the Consul Connect sidecar pattern this is designed around: in a k8s
# pod, the injected Envoy sidecar shares the pod's network namespace, so
# 127.0.0.1 is reachable *between* the app container and its sidecar, both
# for incoming mesh traffic (sidecar -> this process) and outgoing upstream
# calls (this process -> sidecar -> other mesh services). No env override
# needed here; local-k8s's manifests don't set GRPC_SERVER_HOST.
CMD ["node", "packages/server/src/index.js"]
