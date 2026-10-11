#!/usr/bin/env bash
# infra/eks/roll-node.sh <kube-context> <node-name> <target-group-arn>
# Drain one node, terminate its instance (the ASG replaces it in the same AZ
# from the current launch template), then wait for the replacement to be
# Ready, all pods healthy, and both ALB targets healthy. See
# infra/cdk/README.md "Kubernetes version upgrades".
set -euo pipefail
CTX=$1 NODE=$2 TG=$3
K="kubectl --context $CTX"
IID=$($K get node "$NODE" -o jsonpath='{.spec.providerID}' | awk -F/ '{print $NF}')
BEFORE=$($K get nodes -o name | sort)
HAD_CONSUL_SERVER=no
[ "$($K -n consul get pod consul-server-0 -o jsonpath='{.spec.nodeName}')" = "$NODE" ] && HAD_CONSUL_SERVER=yes
echo "== draining $NODE ($IID)"
$K cordon "$NODE"
$K drain "$NODE" --ignore-daemonsets --delete-emptydir-data --timeout=300s
echo "== terminating $IID"
aws autoscaling terminate-instance-in-auto-scaling-group --region us-east-1 \
  --instance-id "$IID" --no-should-decrement-desired-capacity --query 'Activity.Description' --output text
echo "== waiting for replacement node"
for i in $(seq 1 60); do
  NEW=$(comm -13 <(echo "$BEFORE") <($K get nodes -o name | sort) | head -1)
  [ -n "$NEW" ] && break; sleep 10
done
[ -n "$NEW" ] || { echo "no new node after 10 min"; exit 1; }
$K wait --for=condition=Ready "$NEW" --timeout=600s
$K get "$NEW" -o custom-columns=NAME:.metadata.name,ZONE:.metadata.labels.topology\\.kubernetes\\.io/zone,VER:.status.nodeInfo.kubeletVersion,OS:.status.nodeInfo.osImage
$K wait --for=delete node/"$NODE" --timeout=600s || true
if [ "$HAD_CONSUL_SERVER" = yes ]; then
  # Consul was down while its EBS volume moved. connect-injector can come
  # back with a nil server address and then rejects every new pod, and
  # connect-inject-init containers cache the old server IP forever. Found
  # on dev 2026-10-11; restart both once the server is Ready again.
  echo "== consul-server moved: waiting for it, then restarting injector + app deployments"
  $K -n consul wait --for=condition=Ready pod/consul-server-0 --timeout=600s
  $K -n consul rollout restart deploy/consul-connect-injector
  $K -n consul rollout status deploy/consul-connect-injector --timeout=300s
  $K -n widgetgrid rollout restart deploy
  for d in $($K -n widgetgrid get deploy -o name); do $K -n widgetgrid rollout status "$d" --timeout=300s; done
fi
echo "== waiting for pods"
for i in $(seq 1 60); do
  BAD=$($K get pods -A --no-headers | awk '$4!="Running" && $4!="Completed"' || true)
  NOTREADY=$($K get pods -A --no-headers | awk '$4=="Running" {split($3,a,"/"); if (a[1]!=a[2]) print}' || true)
  [ -z "$BAD$NOTREADY" ] && break; sleep 10
done
[ -z "$BAD$NOTREADY" ] || { echo "pods not healthy:"; echo "$BAD$NOTREADY"; exit 1; }
echo "== waiting for ALB target health"
for i in $(seq 1 40); do
  H=$(aws elbv2 describe-target-health --region us-east-1 --target-group-arn "$TG" --query 'TargetHealthDescriptions[].TargetHealth.State' --output text)
  echo "  $H"; [ "$H" = "healthy	healthy" ] && break; sleep 15
done
echo "== done: $NODE replaced"
