#!/usr/bin/env bash
set -euo pipefail

CLUSTER_NAME=widgetgrid

if command -v kind >/dev/null 2>&1 && kind get clusters 2>/dev/null | grep -qx "$CLUSTER_NAME"; then
  kind delete cluster --name "$CLUSTER_NAME"
else
  echo "no '$CLUSTER_NAME' kind cluster found, nothing to tear down"
fi
