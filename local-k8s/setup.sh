#!/usr/bin/env bash
# Brings up a local kind cluster with Consul Connect + widgetgrid-server +
# an Envoy edge gateway, so you can exercise the actual gRPC-Web/Consul
# Connect/Envoy sidecar wiring locally before it ever touches EKS. See
# local-k8s/README.md for what this proves and what it deliberately doesn't
# (static assets, HA Consul sizing, TLS to the outside world).
#
# Safe to re-run: creation steps are skipped if already done, and
# manifest/config apply is idempotent throughout.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."  # repo root

CLUSTER_NAME=widgetgrid
CONSUL_CHART_VERSION=2.0.3

require() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required tool: $1" >&2
    echo "  $2" >&2
    exit 1
  fi
}

require docker  "https://docs.docker.com/desktop/ -- and if you're on WSL2, enable this distro under Docker Desktop's Settings > Resources > WSL Integration"
require kind    "https://kind.sigs.k8s.io/docs/user/quick-start/#installation"
require kubectl "https://kubernetes.io/docs/tasks/tools/#kubectl"
require helm    "https://helm.sh/docs/intro/install/"
require jq      "https://jqlang.org/download/"

if ! docker info >/dev/null 2>&1; then
  echo "docker CLI found but the daemon isn't reachable -- is Docker Desktop running, and (on WSL2) is this distro's integration enabled?" >&2
  exit 1
fi

echo "== kind cluster =="
if kind get clusters 2>/dev/null | grep -qx "$CLUSTER_NAME"; then
  echo "cluster '$CLUSTER_NAME' already exists, skipping creation"
else
  kind create cluster --config local-k8s/kind-config.yaml --retain
fi
kubectl config use-context "kind-$CLUSTER_NAME"

echo
echo "== Consul (Helm) =="
helm repo add hashicorp https://helm.releases.hashicorp.com >/dev/null
helm repo update hashicorp >/dev/null
helm upgrade --install consul hashicorp/consul \
  --namespace consul --create-namespace \
  --values local-k8s/consul-values.yaml \
  --version "$CONSUL_CHART_VERSION" \
  --wait --timeout 5m

echo
echo "== widgetgrid-server image =="
docker build -f packages/server/Dockerfile -t widgetgrid-server:local .
kind load docker-image widgetgrid-server:local --name "$CLUSTER_NAME"

echo
echo "== applying manifests =="
kubectl apply -f local-k8s/manifests/namespace.yaml
# Tells Consul's connect-inject webhook widgetgrid-server speaks gRPC, and
# (via localRequestTimeoutMs) disables the INBOUND route timeout on
# widgetgrid-server's own sidecar -- see the file's own header comment.
kubectl apply -f local-k8s/manifests/service-defaults.yaml
# Companion to the above: disables the timeout on the OTHER half of the
# mesh hop, envoy-gateway's own OUTBOUND route to widgetgrid-server -- see
# this file's header comment for why both are needed.
kubectl apply -f local-k8s/manifests/service-router.yaml
# Generated from the file rather than duplicated inline -- see
# local-k8s/manifests/envoy-gateway.yaml's header comment for why.
kubectl create configmap envoy-gateway-config \
  --from-file=envoy.yaml=local-k8s/envoy/envoy-local.yaml \
  --namespace widgetgrid \
  --dry-run=client -o yaml | kubectl apply -f -

# host.docker.internal is NOT used here despite being the commonly-cited
# way to reach the host from a container: on Docker Desktop/WSL2, it
# resolves and completes a TCP handshake fine, but connections through it
# reset ~5s into any real protocol exchange -- confirmed by hand (a raw pg
# query over host.docker.internal reset after ~5s from both a kind node
# and a plain non-kind container; the same query over the kind Docker
# network's own bridge gateway succeeded in single-digit ms). That gateway
# IP is what actually reaches the host's published ports without going
# through Docker Desktop's vpnkit hairpin path -- computed fresh here
# since it depends on which subnet Docker assigns the "kind" network,
# which is not guaranteed stable across `kind create cluster` runs.
KIND_GATEWAY=$(docker network inspect kind | jq -r '.[0].IPAM.Config[] | select(.Subnet | contains(":") | not) | .Gateway')
kubectl create configmap widgetgrid-server-config \
  --from-literal=DATABASE_URL="postgres://widgetgrid:widgetgrid@${KIND_GATEWAY}:5432/widgetgrid" \
  --namespace widgetgrid \
  --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -f local-k8s/manifests/widgetgrid-server.yaml
kubectl apply -f local-k8s/manifests/envoy-gateway.yaml

echo
echo "== waiting for pods to be ready (includes their injected Consul sidecars) =="
kubectl wait --for=condition=ready pod -l app=widgetgrid-server -n widgetgrid --timeout=180s
kubectl wait --for=condition=ready pod -l app=envoy-gateway -n widgetgrid --timeout=180s

cat <<'EOF'

Ready. The Envoy gateway is reachable at http://localhost:8080.

Try it (needs grpcurl: https://github.com/fullstorydev/grpcurl):
  grpcurl -plaintext -import-path proto -proto proto/widgetgrid/v1/page.proto \
    -d '{"slug":"home"}' localhost:8080 widgetgrid.v1.PageService/GetPageLayout

(That'll come back NOT_FOUND unless you've also run `npm run db:migrate` +
`npm run db:seed` against the Postgres this pod is configured to reach --
see local-k8s/README.md.)

Useful commands:
  kubectl get pods -n widgetgrid
  kubectl logs -n widgetgrid deploy/widgetgrid-server -c widgetgrid-server
  kubectl logs -n widgetgrid deploy/envoy-gateway -c envoy
  kubectl logs -n widgetgrid deploy/envoy-gateway -c consul-dataplane   # the injected sidecar (name per Consul K8s 1.x/2.x's dataplane model --
                                                                        # if that container name doesn't exist, `kubectl describe pod -n widgetgrid -l app=envoy-gateway` lists the real ones)
  kubectl port-forward -n consul svc/consul-ui 8500:80   # then http://localhost:8500

Tear down: local-k8s/teardown.sh
EOF
