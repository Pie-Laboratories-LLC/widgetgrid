#!/usr/bin/env bash
# Removes the app/Consul objects infra/eks/deploy.sh applied, WITHOUT
# touching the EKS cluster, RDS instance, or ECR repos themselves -- those
# are CDK-managed (WidgetgridEksStack/WidgetgridRdsStack) and torn down with
# `cdk destroy`, not this script. Useful for re-running deploy.sh from a
# clean slate, or for a cost-saving pause that keeps the cluster/DB up but
# drops the workloads running on them.
set -euo pipefail

if ! kubectl get namespace widgetgrid >/dev/null 2>&1; then
  echo "no 'widgetgrid' namespace found, nothing to tear down"
  exit 0
fi

kubectl delete namespace widgetgrid --wait=true
helm uninstall consul --namespace consul || true
kubectl delete namespace consul --wait=true || true

echo "k8s-side teardown complete. Cluster/RDS/ECR are untouched -- use 'cdk destroy' for those."
