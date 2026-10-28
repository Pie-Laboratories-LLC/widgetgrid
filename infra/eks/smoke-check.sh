#!/usr/bin/env bash
# Post-deploy smoke check -- what the dev environment used to be for: a
# quick "does what worked on kind also work in AWS" pass, now run against
# the real thing right after deploy.sh. Read-only: every call below is a
# GET or a read RPC, safe to run against prod at any time.
#
#   infra/eks/smoke-check.sh          # prod (default)
#   infra/eks/smoke-check.sh dev      # only if dev has been stood back up
#
# Exits non-zero if any check fails; the summary lists which.
set -uo pipefail  # no -e: every check runs, failures are tallied

ENV="${1:-prod}"
case "$ENV" in
  dev) EKS_STACK=WidgetgridEksStack; SITE_HOST=dev.pie-laboratories.com ;;
  prod) EKS_STACK=WidgetgridProdEksStack; SITE_HOST=www.pie-laboratories.com ;;
  *) echo "Unknown environment '$ENV' -- expected 'dev' or 'prod'" >&2; exit 1 ;;
esac
REGION=us-east-1
BASE="https://${SITE_HOST}"

WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT

failures=()
pass() { echo "  ok    $1"; }
fail() { echo "  FAIL  $1${2:+ -- $2}"; failures+=("$1"); }

# One unary gRPC-web call through the ALB and Envoy's grpc_web filter.
# $2 is the framed request as printf escapes: a 0x00 flag byte, a 4-byte
# big-endian length, then the protobuf message. Prints the grpc-status:
# trailers-only responses (errors) carry it as a header, successful ones in
# the trailer frame at the end of the body.
grpc_web() {
  printf "$2" | curl -s --max-time 15 -X POST \
    -H 'content-type: application/grpc-web+proto' -H 'x-grpc-web: 1' \
    -D "$WORK/h" -o "$WORK/b" --data-binary @- "${BASE}/$1" || { echo "curl-error"; return; }
  local status
  status=$(grep -i '^grpc-status:' "$WORK/h" | tr -dc '0-9')
  [ -z "$status" ] && status=$(grep -ao 'grpc-status:[0-9]*' "$WORK/b" | tr -dc '0-9')
  echo "${status:-none}"
}

body_size() { wc -c < "$WORK/b" | tr -d ' '; }

echo "== edge ($BASE) =="
code=$(curl -s -o "$WORK/index" -w '%{http_code}' --max-time 15 "$BASE/")
if [ "$code" = 200 ] && grep -qi '<html' "$WORK/index"; then pass "site loads"; else fail "site loads" "HTTP $code"; fi

# 101 means Envoy routed the upgrade to embuscade-server. curl then sits on
# the open socket until --max-time, hence the || true.
code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 --http1.1 \
  -H 'Connection: Upgrade' -H 'Upgrade: websocket' -H 'Sec-WebSocket-Version: 13' \
  -H 'Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==' "$BASE/embuscade-ws" || true)
if [ "$code" = 101 ]; then pass "embuscade websocket upgrade"; else fail "embuscade websocket upgrade" "HTTP $code"; fi

# The creature service, through Envoy's /creatures/ route and its mesh hop.
body=$(curl -s --max-time 15 "$BASE/creatures/health" || true)
if [ "$body" = ok ]; then pass "creature service health"; else fail "creature service health" "got '${body:0:60}'"; fi

echo "== gRPC-web =="
# GetPageLayout { slug: "home" }
s=$(grpc_web widgetgrid.v1.PageService/GetPageLayout '\x00\x00\x00\x00\x06\x0a\x04home')
if [ "$s" = 0 ] && [ "$(body_size)" -gt 50 ]; then pass "PageService/GetPageLayout home"; else fail "PageService/GetPageLayout home" "grpc-status $s, $(body_size) bytes"; fi

# Reads the S3 bucket via Pod Identity, so this also covers IAM.
s=$(grpc_web widgetgrid.v1.BlogService/ListBlogPosts '\x00\x00\x00\x00\x00')
if [ "$s" = 0 ] && [ "$(body_size)" -gt 100 ]; then pass "BlogService/ListBlogPosts"; else fail "BlogService/ListBlogPosts" "grpc-status $s, $(body_size) bytes"; fi

# A blank VAPID key means deploy.sh ran without .env, which silently
# breaks every push subscription.
s=$(grpc_web widgetgrid.v1.PushService/GetPushConfig '\x00\x00\x00\x00\x00')
if [ "$s" = 0 ] && [ "$(body_size)" -gt 60 ]; then pass "PushService/GetPushConfig (VAPID key set)"; else fail "PushService/GetPushConfig (VAPID key set)" "grpc-status $s, $(body_size) bytes"; fi

# No token, so 16 (UNAUTHENTICATED) is the healthy answer: the route,
# Consul upstream and lhoraire-server all answered.
s=$(grpc_web lhoraire.v1.ProjectService/ListProjects '\x00\x00\x00\x00\x00')
if [ "$s" = 16 ]; then pass "l'horaire reachable (UNAUTHENTICATED as expected)"; else fail "l'horaire reachable" "grpc-status $s, expected 16"; fi

echo "== cluster =="
CLUSTER_NAME=$(aws cloudformation describe-stacks --region "$REGION" --stack-name "$EKS_STACK" \
  --query "Stacks[0].Outputs[?OutputKey=='ClusterName'].OutputValue" --output text 2>/dev/null)
TARGET_GROUP_ARN=$(aws cloudformation describe-stacks --region "$REGION" --stack-name "$EKS_STACK" \
  --query "Stacks[0].Outputs[?OutputKey=='EnvoyTargetGroupArn'].OutputValue" --output text 2>/dev/null)
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
# Explicit --context, never the current one: kubeconfig here holds kind,
# dev and prod side by side.
KCTX="arn:aws:eks:${REGION}:${ACCOUNT_ID}:cluster/${CLUSTER_NAME}"

if [ -z "$CLUSTER_NAME" ]; then
  fail "read ${EKS_STACK} outputs"
else
  if pods=$(kubectl --context "$KCTX" get pods -n widgetgrid --no-headers 2>&1); then
    # Columns: NAME READY STATUS RESTARTS AGE. Completed migrate/seed Job
    # pods are expected, and so are Terminating ones -- the previous
    # release's pods are still shutting down when deploy.sh runs this.
    # Anything else must be Running with all containers ready.
    bad=$(echo "$pods" | awk '$3 != "Completed" && $3 != "Terminating" { split($2, r, "/"); if ($3 != "Running" || r[1] != r[2]) print $1" "$2" "$3 }')
    if [ -z "$bad" ]; then pass "widgetgrid pods running and ready"; else fail "widgetgrid pods running and ready" "$(echo $bad)"; fi
    # Restarts on pods younger than this deploy point at a crash loop that
    # happened to be up when the readiness wait passed.
    restarted=$(echo "$pods" | awk '$3 == "Running" && $4 + 0 > 0 { print $1"("$4")" }')
    if [ -z "$restarted" ]; then pass "no container restarts"; else fail "no container restarts" "$(echo $restarted)"; fi
  else
    fail "kubectl get pods" "$pods"
  fi

  health=$(aws elbv2 describe-target-health --region "$REGION" --target-group-arn "$TARGET_GROUP_ARN" \
    --query 'TargetHealthDescriptions[].TargetHealth.State' --output text 2>&1)
  # -x: "unhealthy" contains "healthy".
  if [ -n "$health" ] && ! echo "$health" | tr -s '\t ' '\n\n' | grep -qvx healthy; then pass "ALB targets healthy ($(echo $health | wc -w))"; else fail "ALB targets healthy" "$health"; fi
fi

echo
if [ ${#failures[@]} -eq 0 ]; then
  echo "Smoke check passed ($ENV)."
else
  echo "Smoke check FAILED ($ENV): ${#failures[@]} check(s):"
  printf '  - %s\n' "${failures[@]}"
  echo "Roll back with: kubectl --context $KCTX rollout undo deployment/<name> -n widgetgrid"
  exit 1
fi
