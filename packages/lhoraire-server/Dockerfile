# l'horaire's gRPC server (packages/lhoraire-server). Same shape as
# packages/server/Dockerfile: build context MUST be the repo root, and every
# workspace's package.json is copied so `npm ci` trusts package-lock.json,
# while only lhoraire-server + its two workspace dependencies end up
# installed in the image.
#
#   docker build -f packages/lhoraire-server/Dockerfile -t lhoraire-server:local .

FROM node:24-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/db/package.json packages/db/package.json
COPY packages/lhoraire-server/package.json packages/lhoraire-server/package.json
COPY packages/server/package.json packages/server/package.json
COPY packages/auth-node/package.json packages/auth-node/package.json
COPY packages/auth-web/package.json packages/auth-web/package.json
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
COPY widgets/chat/package.json widgets/chat/package.json
COPY widgets/login/package.json widgets/login/package.json
COPY widgets/main/package.json widgets/main/package.json
COPY widgets/solitaire/package.json widgets/solitaire/package.json
COPY widgets/embuscade/package.json widgets/embuscade/package.json
COPY widgets/lastnaming/package.json widgets/lastnaming/package.json
COPY widgets/lhoraire/package.json widgets/lhoraire/package.json
COPY infra/cdk/package.json infra/cdk/package.json

# --ignore-scripts: nothing packages/server or packages/db depend on needs
# install-time scripts (that requirement -- grpc-tools' protoc binary,
# protoc-gen-grpc-web -- is a proto-codegen-time concern for the *client*
# side, see docs/LOCAL_DEV_PREREQUISITES.md; this image never runs codegen).
RUN npm ci --omit=dev --ignore-scripts --workspace packages/lhoraire-server --workspace packages/db --workspace packages/auth-node --include-workspace-root


FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --from=deps --chown=node:node /app/package.json ./package.json
COPY --chown=node:node packages/db/package.json packages/db/package.json
COPY --chown=node:node packages/db/src packages/db/src
COPY --chown=node:node packages/auth-node/package.json packages/auth-node/package.json
COPY --chown=node:node packages/auth-node/src packages/auth-node/src
COPY --chown=node:node packages/lhoraire-server/package.json packages/lhoraire-server/package.json
COPY --chown=node:node packages/lhoraire-server/src packages/lhoraire-server/src
COPY --chown=node:node proto proto

USER node
EXPOSE 50061

CMD ["node", "packages/lhoraire-server/src/index.js"]
