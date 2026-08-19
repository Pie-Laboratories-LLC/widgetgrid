# One-off image for running packages/db's migrations AND seed script
# against RDS from inside the cluster (see infra/eks/deploy.sh), NOT
# packages/server's runtime image: that Dockerfile deliberately
# `npm ci --omit=dev`s (excludes node-pg-migrate, a devDependency) and never
# COPYs packages/db/migrations/ or packages/db/seeds/.
#
#   docker build -f infra/eks/migrate.Dockerfile -t widgetgrid-migrate:local .
#
# Build context is the repo root, same npm-workspaces reasoning as
# packages/server/Dockerfile.
FROM node:24-alpine
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

# No --omit=dev, unlike packages/server/Dockerfile -- node-pg-migrate is a
# devDependency of packages/db and is the whole point of this image.
RUN npm ci --ignore-scripts --workspace packages/db --include-workspace-root

COPY --chown=node:node packages/db/src packages/db/src
COPY --chown=node:node packages/db/migrations packages/db/migrations
COPY --chown=node:node packages/db/seeds packages/db/seeds

USER node
WORKDIR /app/packages/db

# No --envPath here (unlike the `migrate`/`migrate:up` npm scripts, which
# point at a repo-root .env for local dev) -- DATABASE_URL is provided as a
# real environment variable by the k8s Job (see infra/eks/deploy.sh), not a
# .env file that doesn't exist in this image. `npx` (not a hardcoded
# node_modules/.bin path) since npm workspaces hoists bin shims to the root
# node_modules/.bin, not necessarily replicated under packages/db/ itself --
# npx walks up from cwd and finds it either way. Default CMD runs
# migrations; the seed script (idempotent, see its own header comment) is
# run by overriding the Job's command/args to `node seeds/seed.mjs`
# instead, not baked in as the default -- migrations are needed on every
# schema change, seeding only once (or deliberately, to reset "home").
CMD ["npx", "--no-install", "node-pg-migrate", "up"]
