import * as eks from 'aws-cdk-lib/aws-eks';

// EKS-managed addon versions per Kubernetes minor, shared by EksStack and
// ProdEksStack so both clusters step through upgrades identically. Values
// are each addon's AWS-flagged default for that minor, captured 2026-10-11
// with:
//   aws eks describe-addon-versions --kubernetes-version <v> --addon-name <a> \
//     --query 'addons[0].addonVersions[?compatibilities[0].defaultVersion==`true`].addonVersion | [0]'
// EKS only upgrades the control plane one minor at a time, and kube-proxy/
// coredns must track it, so a version upgrade is one `cdk deploy` per minor
// with the stack's K8S_VERSION bumped each time -- every intermediate minor
// needs an entry here, not just the destination.
export const ADDON_VERSIONS = {
  '1.33': { 'vpc-cni': 'v1.22.4-eksbuild.3', 'kube-proxy': 'v1.33.10-eksbuild.29', 'coredns': 'v1.12.4-eksbuild.57', 'aws-ebs-csi-driver': 'v1.66.0-eksbuild.1', 'eks-pod-identity-agent': 'v1.3.10-eksbuild.3' },
  '1.34': { 'vpc-cni': 'v1.22.4-eksbuild.3', 'kube-proxy': 'v1.34.6-eksbuild.29', 'coredns': 'v1.12.4-eksbuild.57', 'aws-ebs-csi-driver': 'v1.66.0-eksbuild.1', 'eks-pod-identity-agent': 'v1.3.10-eksbuild.3' },
  '1.35': { 'vpc-cni': 'v1.22.4-eksbuild.3', 'kube-proxy': 'v1.35.3-eksbuild.29', 'coredns': 'v1.13.2-eksbuild.50', 'aws-ebs-csi-driver': 'v1.66.0-eksbuild.1', 'eks-pod-identity-agent': 'v1.3.10-eksbuild.3' },
  '1.36': { 'vpc-cni': 'v1.22.4-eksbuild.3', 'kube-proxy': 'v1.36.0-eksbuild.25', 'coredns': 'v1.14.7-eksbuild.10', 'aws-ebs-csi-driver': 'v1.66.0-eksbuild.1', 'eks-pod-identity-agent': 'v1.3.10-eksbuild.3' },
};

export function addonVersion(k8sVersion, addonName) {
  const versions = ADDON_VERSIONS[k8sVersion];
  if (!versions) throw new Error(`no ADDON_VERSIONS entry for Kubernetes ${k8sVersion}`);
  return versions[addonName];
}

// vpc-cni/kube-proxy/coredns are installed self-managed by EKS itself at
// cluster creation (eks.Cluster doesn't declare them), which means nothing
// ever upgraded them -- they'd stay at the creation-time minor forever.
// Declaring them as EKS-managed addons pins them to the cluster's version.
// ResolveConflicts OVERWRITE is what lets the first deploy adopt the
// already-running self-managed copies instead of failing on "already
// exists"; none of the three carry custom config here, so overwriting with
// addon defaults changes nothing in practice.
export function addCoreAddons(scope, cluster, k8sVersion) {
  for (const [id, addonName] of [['VpcCniAddon', 'vpc-cni'], ['KubeProxyAddon', 'kube-proxy'], ['CoreDnsAddon', 'coredns']]) {
    const addon = new eks.Addon(scope, id, {
      cluster,
      addonName,
      addonVersion: addonVersion(k8sVersion, addonName),
    });
    addon.node.defaultChild.addPropertyOverride('ResolveConflicts', 'OVERWRITE');
  }
}
