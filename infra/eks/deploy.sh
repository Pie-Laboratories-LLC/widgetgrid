#!/usr/bin/env bash
# Brings up the real widgetgrid app on the EKS cluster WidgetgridEksStack
# provisions -- the AWS-side sibling of local-k8s/setup.sh, same Consul
# Connect + Envoy edge gateway topology, same idempotent-to-re-run design,
# now with real ECR images and a real RDS-backed DATABASE_URL instead of a
# kind-loaded local image and a docker-compose Postgres. See
# infra/cdk/README.md for the full sequencing this script fits into
# (WidgetgridEksStack and WidgetgridRdsStack must already be deployed before
# running this).
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/../.."  # repo root

# Defaults to dev so a bare `./deploy.sh` keeps behaving exactly as it
# always has -- `./deploy.sh prod` is the only new invocation this adds.
ENV="${1:-dev}"
case "$ENV" in
  dev) EKS_STACK=WidgetgridEksStack; RDS_STACK=WidgetgridRdsStack; GATEWAY_STACK=WidgetgridDevGatewayStack; TARGET_GROUP_CONTEXT_KEY=envoyTargetGroupArn; SITE_HOST=dev.pie-laboratories.com ;;
  prod) EKS_STACK=WidgetgridProdEksStack; RDS_STACK=WidgetgridProdRdsStack; GATEWAY_STACK=WidgetgridProdGatewayStack; TARGET_GROUP_CONTEXT_KEY=prodEnvoyTargetGroupArn; SITE_HOST=www.pie-laboratories.com ;;
  *) echo "Unknown environment '$ENV' -- expected 'dev' or 'prod'" >&2; exit 1 ;;
esac

REGION=us-east-1
CONSUL_CHART_VERSION=2.0.3

require() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required tool: $1" >&2
    echo "  $2" >&2
    exit 1
  fi
}

require docker    "https://docs.docker.com/desktop/"
require kubectl   "https://kubernetes.io/docs/tasks/tools/#kubectl"
require helm      "https://helm.sh/docs/intro/install/"
require aws       "https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
require jq        "https://jqlang.org/download/"
require envsubst  "part of gettext -- 'apt install gettext-base' / 'brew install gettext'"

echo "== reading ${EKS_STACK} / ${RDS_STACK} outputs =="
eks_outputs=$(aws cloudformation describe-stacks --region "$REGION" --stack-name "$EKS_STACK" --query 'Stacks[0].Outputs' --output json)
CLUSTER_NAME=$(echo "$eks_outputs" | jq -r '.[] | select(.OutputKey=="ClusterName") | .OutputValue')
TARGET_GROUP_ARN=$(echo "$eks_outputs" | jq -r '.[] | select(.OutputKey=="EnvoyTargetGroupArn") | .OutputValue')
BLOG_S3_BUCKET=$(echo "$eks_outputs" | jq -r '.[] | select(.OutputKey=="BlogBucketName") | .OutputValue')
BLOG_ASSETS_BASE_URL=$(echo "$eks_outputs" | jq -r '.[] | select(.OutputKey=="BlogBucketPublicUrl") | .OutputValue')
# ServerRepositoryUri/StaticRepositoryUri are only output by the dev stack
# (WidgetgridEksStack) -- prod imports the same two repos by fixed name
# instead of owning its own (see prod-eks-stack.js's header comment), so
# both environments push to these same URIs regardless of $ENV.
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
SERVER_REPO="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/widgetgrid-server"
STATIC_REPO="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/widgetgrid-static"

rds_outputs=$(aws cloudformation describe-stacks --region "$REGION" --stack-name "$RDS_STACK" --query 'Stacks[0].Outputs' --output json)
DB_SECRET_ARN=$(echo "$rds_outputs" | jq -r '.[] | select(.OutputKey=="DbSecretArn") | .OutputValue')

# envsubst silently substitutes an empty string for any unset/empty
# variable rather than failing -- confirmed the hard way that a manually
# reproduced deploy step missing one of these produced a deployed manifest
# with a blank BLOG_ASSETS_BASE_URL and broken image links, no error
# anywhere in the chain. Failing loudly here, before that template ever
# gets rendered, is cheap insurance against the same mistake recurring.
for var in CLUSTER_NAME SERVER_REPO STATIC_REPO TARGET_GROUP_ARN BLOG_S3_BUCKET BLOG_ASSETS_BASE_URL DB_SECRET_ARN; do
  if [ -z "${!var}" ]; then
    echo "Missing/empty required value: $var (check WidgetgridEksStack/WidgetgridRdsStack outputs)" >&2
    exit 1
  fi
done

echo
echo "== kubeconfig =="
aws eks update-kubeconfig --region "$REGION" --name "$CLUSTER_NAME"
kubectl get nodes

echo
echo "== StorageClass (gp3 -- EKS ships none by default, see consul-values.yaml) =="
kubectl apply -f infra/eks/manifests/storageclass.yaml

echo
echo "== Consul (Helm) =="
helm repo add hashicorp https://helm.releases.hashicorp.com >/dev/null
helm repo update hashicorp >/dev/null
helm upgrade --install consul hashicorp/consul \
  --namespace consul --create-namespace \
  --values infra/eks/consul-values.yaml \
  --version "$CONSUL_CHART_VERSION" \
  --wait --timeout 5m

echo
echo "== building + pushing images =="
IMAGE_TAG="${ENV}-$(git rev-parse --short HEAD)-$(date +%s)"
SERVER_IMAGE="${SERVER_REPO}:${IMAGE_TAG}"
STATIC_IMAGE="${STATIC_REPO}:${IMAGE_TAG}"
MIGRATE_IMAGE="${SERVER_REPO}:migrate-${IMAGE_TAG}"  # shares the server repo -- one-off, not worth its own ECR repo

aws ecr get-login-password --region "$REGION" | \
  docker login --username AWS --password-stdin "${SERVER_REPO%%/*}"

docker build -f packages/server/Dockerfile -t "$SERVER_IMAGE" .
docker push "$SERVER_IMAGE"

# packages/static-server/Dockerfile needs widgets/solitaire's build, which
# needs the sibling ~/GIT/solitaire repo's own `npm run build` output --
# Docker can't COPY across the build-context boundary, so it's staged
# inside the widgetgrid tree first (gitignored, dockerignore-excepted --
# see packages/static-server/Dockerfile's ENV SOLITAIRE_REPO_DIR comment).
SOLITAIRE_SRC_DIR="${SOLITAIRE_REPO_DIR:-../solitaire}"
if [ ! -d "${SOLITAIRE_SRC_DIR}/dist" ]; then
  echo "Missing ${SOLITAIRE_SRC_DIR}/dist -- run 'npm run build' in ${SOLITAIRE_SRC_DIR} first (or set SOLITAIRE_REPO_DIR)." >&2
  exit 1
fi
rm -rf widgets/solitaire/.vendor-src
mkdir -p widgets/solitaire/.vendor-src
cp -r "${SOLITAIRE_SRC_DIR}/dist" widgets/solitaire/.vendor-src/dist
cp "${SOLITAIRE_SRC_DIR}/solitaire.css" widgets/solitaire/.vendor-src/solitaire.css

docker build -f packages/static-server/Dockerfile -t "$STATIC_IMAGE" .
docker push "$STATIC_IMAGE"
rm -rf widgets/solitaire/.vendor-src
docker build -f infra/eks/migrate.Dockerfile -t "$MIGRATE_IMAGE" .
docker push "$MIGRATE_IMAGE"

echo
echo "== applying cluster-scoped manifests =="
kubectl apply -f infra/eks/manifests/namespace.yaml
kubectl apply -f infra/eks/manifests/service-account.yaml
# See these files' own header comments for why both are needed (one fixes
# each half of the mesh hop's route timeout) and the "only reaches Consul's
# catalog on first apply, not on update" caveat.
kubectl apply -f infra/eks/manifests/service-defaults.yaml
kubectl apply -f infra/eks/manifests/service-router.yaml
kubectl apply -f infra/eks/manifests/service-defaults-static.yaml
kubectl create configmap envoy-gateway-config \
  --from-file=envoy.yaml=infra/eks/envoy/envoy-eks.yaml \
  --namespace widgetgrid \
  --dry-run=client -o yaml | kubectl apply -f -

echo
echo "== widgetgrid-server secret (DATABASE_URL from Secrets Manager, OWNER_PHONE_NUMBER from .env) =="
# .env, not a literal in this script -- same gitignored local file
# packages/db/packages/server already read for local dev (see .env.example).
# Sourced BEFORE computing DATABASE_URL below, deliberately: .env's own
# DATABASE_URL is the LOCAL Postgres placeholder
# (postgres://widgetgrid:widgetgrid@localhost:5432/widgetgrid) -- sourcing
# it after would silently clobber the real RDS connection string with that
# placeholder (confirmed the hard way: the migrate Job tried to connect to
# 127.0.0.1:5432 in the cluster and got ECONNREFUSED, because that's
# exactly what happened on an earlier run of this script before this
# comment existed). OWNER_PHONE_NUMBER is only ever logged right now (no
# real SMS provider wired up, see packages/server/src/smsSender.js), so
# it's harmless to leave unset if .env doesn't have it.
[ -f .env ] && set -a && source .env && set +a
db_secret_json=$(aws secretsmanager get-secret-value --region "$REGION" --secret-id "$DB_SECRET_ARN" --query SecretString --output text)
# sslmode=require, not left off the way local Postgres is: this RDS
# instance's default parameter group forces SSL (rds.force_ssl) --
# confirmed the hard way (the migrate Job connected fine over the network
# but got rejected at auth with "no pg_hba.conf entry ... no encryption").
# `require` (with uselibpqcompat=true) encrypts without verifying the
# server cert against a CA bundle (verify-full -- what plain sslmode=require
# actually means in current pg/pg-connection-string versions, a recent
# security-hardening change -- would need Amazon's RDS CA bundle baked into
# every image that connects) -- a reasonable tradeoff for this
# cost-minimized dev tier, not appropriate to relax further for anything
# handling real user data. Confirmed the hard way: plain sslmode=require
# alone failed with SELF_SIGNED_CERT_IN_CHAIN (it was silently attempting
# full verification); pg's own warning output pointed at uselibpqcompat=true
# as the way back to true libpq "encrypt, don't verify" semantics. `pg`'s
# connection-string parser reads both params directly, so this needs no
# packages/db/src/pool.js change -- local dev's plain DATABASE_URL (neither
# param set) is completely unaffected.
DATABASE_URL=$(echo "$db_secret_json" | jq -r '"postgres://\(.username):\(.password)@\(.host):\(.port)/\(.dbname)?sslmode=require&uselibpqcompat=true"')
kubectl create secret generic widgetgrid-server-secret \
  --from-literal=DATABASE_URL="$DATABASE_URL" \
  --from-literal=OWNER_PHONE_NUMBER="${OWNER_PHONE_NUMBER:-}" \
  --namespace widgetgrid \
  --dry-run=client -o yaml | kubectl apply -f -

echo
echo "== running migrations =="
MIGRATE_JOB_NAME="migrate-${IMAGE_TAG}"
export MIGRATE_JOB_NAME MIGRATE_IMAGE
envsubst < infra/eks/migrate-job.yaml | kubectl apply -f -
kubectl wait --for=condition=complete "job/${MIGRATE_JOB_NAME}" -n widgetgrid --timeout=180s
# Old completed migrate-* Jobs aren't useful to keep around indefinitely --
# each run gets a fresh name (Jobs aren't mutable in place), so this is
# just housekeeping, not required for correctness. `|| true`: on a
# first-ever run there are zero OTHER jobs, so the `grep -v` above matches
# nothing and exits 1 -- under this script's `set -e` that silently killed
# the entire deploy right here (confirmed the hard way on prod's first
# run: it stopped dead after migrations with no error printed). Finding
# nothing to clean up is a normal outcome, not a real failure.
kubectl get jobs -n widgetgrid -o name | grep '^job.batch/migrate-' | grep -v "$MIGRATE_JOB_NAME" | xargs -r kubectl delete -n widgetgrid || true

echo
echo "== seeding demo data =="
# Every run, not just first-time bootstrap -- see infra/eks/seed-job.yaml's
# header comment for why (packages/db/seeds/seed.mjs resets "home" on
# every run by design, no authoring UI exists yet).
SEED_JOB_NAME="seed-${IMAGE_TAG}"
export SEED_JOB_NAME
envsubst < infra/eks/seed-job.yaml | kubectl apply -f -
kubectl wait --for=condition=complete "job/${SEED_JOB_NAME}" -n widgetgrid --timeout=60s
kubectl get jobs -n widgetgrid -o name | grep '^job.batch/seed-' | grep -v "$SEED_JOB_NAME" | xargs -r kubectl delete -n widgetgrid || true

echo
echo "== applying app manifests =="
export SERVER_IMAGE STATIC_IMAGE BLOG_S3_BUCKET BLOG_ASSETS_BASE_URL
envsubst < infra/eks/manifests/widgetgrid-server.yaml | kubectl apply -f -
envsubst < infra/eks/manifests/static-server.yaml | kubectl apply -f -
kubectl apply -f infra/eks/manifests/envoy-gateway.yaml

echo
echo "== waiting for pods to be ready (includes their injected Consul sidecars) =="
kubectl wait --for=condition=ready pod -l app=widgetgrid-server -n widgetgrid --timeout=180s
kubectl wait --for=condition=ready pod -l app=static-server -n widgetgrid --timeout=180s
kubectl wait --for=condition=ready pod -l app=envoy-gateway -n widgetgrid --timeout=180s

echo
echo "== target group health =="
aws elbv2 describe-target-health --region "$REGION" --target-group-arn "$TARGET_GROUP_ARN" \
  --query 'TargetHealthDescriptions[].TargetHealth.State' --output text

cat <<EOF

Ready. If ${GATEWAY_STACK} hasn't been redeployed with this target
group wired in yet, do that now:

  npm run deploy --workspace infra/cdk -- ${GATEWAY_STACK} -c ${TARGET_GROUP_CONTEXT_KEY}=${TARGET_GROUP_ARN}

Then verify: curl -v https://${SITE_HOST}

Useful commands:
  kubectl get pods -n widgetgrid
  kubectl logs -n widgetgrid deploy/widgetgrid-server -c widgetgrid-server
  kubectl logs -n widgetgrid deploy/envoy-gateway -c envoy
  kubectl port-forward -n consul svc/consul-ui 8500:80   # then http://localhost:8500

Tear down (k8s side only -- cluster/RDS teardown is 'cdk destroy'):
  infra/eks/teardown.sh
EOF
