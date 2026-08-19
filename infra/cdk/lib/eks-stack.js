import { Stack, RemovalPolicy, CfnOutput } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as eks from 'aws-cdk-lib/aws-eks';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as iam from 'aws-cdk-lib/aws-iam';

// The IAM identity that runs `cdk deploy`/`kubectl`/`helm` for this stack --
// see infra/eks/deploy.sh. With authenticationMode: API there is no
// aws-auth ConfigMap to hand-edit if this is ever wrong; the human has to
// have their own AccessEntry (below) before any kubectl command works at
// all, so this can't be discovered/fixed after the fact the way an
// aws-auth-ConfigMap-based cluster would allow.
const DEPLOYING_USER_ARN = 'arn:aws:iam::913318903667:user/mlemay';

// Fixed rather than auto-assigned, same reasoning as
// local-k8s/manifests/envoy-gateway.yaml's nodePort: 30080 -- the ALB
// target group (below) needs a known, stable port to point at, and
// infra/eks/manifests/envoy-gateway.yaml's Service must request this exact
// nodePort.
export const ENVOY_GATEWAY_NODE_PORT = 30080;

// Everything here is expected to change a lot less often than
// DevGatewayStack's own listener wiring, but a lot more than DnsStack's --
// cluster/node/ECR lifecycle is its own concern, split out so e.g.
// `cdk destroy WidgetgridEksStack` (a cost-saving teardown) doesn't touch
// the DNS/cert/Cognito stack at all. See infra/cdk/README.md.
export class EksStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);
    // vpc/albSecurityGroup come from WidgetgridDevGatewayStack, which
    // already owns and has deployed the VPC/ALB -- a one-directional
    // reference (this stack depends on that one). The target group this
    // stack produces flows back the OTHER way (into DevGatewayStack's
    // listener), which deliberately does NOT go through a live CDK
    // cross-stack construct reference -- doing so in both directions would
    // be a circular CloudFormation stack dependency. See this stack's
    // CfnOutput below and infra/cdk/README.md for how that hand-off
    // actually works (a `-c envoyTargetGroupArn=...` CDK context value on
    // DevGatewayStack's next deploy, not an automatic wire-up).
    const { vpc, albSecurityGroup } = props;

    // Nothing here reaches Consul's catalog or applies any K8s object --
    // that's infra/eks/deploy.sh's job (helm/kubectl, run by a human or
    // CI, not CDK). This cluster never calls addManifest/addHelmChart/
    // addServiceAccount itself; `cdk diff` shows the eks.Cluster L2
    // construct provisions its KubectlProvider Lambda regardless (confirmed
    // -- it's created even with none of those methods called), so that
    // machinery isn't avoided entirely, just never exercised by this code.
    const cluster = new eks.Cluster(this, 'Cluster', {
      clusterName: 'widgetgrid-dev',
      // V1_32, not the newer versions aws-cdk-lib@2.265.0 knows the enum
      // values for -- confirmed directly against this account
      // (`aws ssm get-parameters --names /aws/service/eks/optimized-ami/<v>/amazon-linux-2/recommended/image_id`):
      // 1.32 is the newest version with an actual published EKS-optimized
      // AMI here, which is what addAutoScalingGroupCapacity's self-managed
      // ASG needs to resolve at deploy time. 1.33/1.34 return no parameter
      // at all and fail the CloudFormation changeset with "Unable to fetch
      // parameters ... for this account" -- not a permissions issue, the
      // AMI just doesn't exist yet for those versions in this account/region.
      version: eks.KubernetesVersion.V1_32,
      vpc,
      vpcSubnets: [{ subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS }],
      // API, not the default CONFIG_MAP: access is granted via AccessEntry
      // resources (this file) instead of an aws-auth ConfigMap that nothing
      // here would ever kubectl-apply/patch.
      authenticationMode: eks.AuthenticationMode.API,
      // The deploying role becomes a cluster admin access entry
      // automatically -- covers `cdk deploy` itself; DEPLOYING_USER_ARN's
      // own AccessEntry (below) is what covers the human's own
      // kubectl/helm afterward, since those are different principals.
      bootstrapClusterCreatorAdminPermissions: true,
      // No default managed node group -- addAutoScalingGroupCapacity below
      // is what actually adds capacity, specifically because its ASG (and
      // only its ASG) can be attached to the ALB target group.
      defaultCapacity: 0,
    });

    // Human access entry: with authenticationMode: API there's no aws-auth
    // ConfigMap fallback to hand-edit if this is ever missing/wrong -- every
    // kubectl/helm command from infra/eks/deploy.sh 403s at the API server
    // until this exists.
    new eks.AccessEntry(this, 'DeployingUserAccessEntry', {
      cluster,
      principal: DEPLOYING_USER_ARN,
      accessPolicies: [
        new eks.AccessPolicy({
          policy: eks.AccessPolicyArn.AMAZON_EKS_CLUSTER_ADMIN_POLICY,
          accessScope: { type: eks.AccessScopeType.CLUSTER },
        }),
      ],
    });

    // Created explicitly (rather than letting addAutoScalingGroupCapacity
    // make its own) so RdsStack and DevGatewayStack can both reference the
    // exact same security group without reaching into the ASG's connections
    // after the fact.
    const nodeSecurityGroup = new ec2.SecurityGroup(this, 'NodeSecurityGroup', {
      vpc,
      description: 'widgetgrid-dev EKS node group',
      allowAllOutbound: true,
    });
    nodeSecurityGroup.addIngressRule(
      albSecurityGroup,
      ec2.Port.tcp(ENVOY_GATEWAY_NODE_PORT),
      'ALB to envoy-gateway NodePort',
    );

    // Self-managed (autoscaling.AutoScalingGroup), NOT eks.Nodegroup: a
    // managed nodegroup's underlying ASG isn't exposed to CDK, so it can't
    // be attached to an ALB target group the way this stack's target group
    // needs (see infra/cdk/README.md's "Once the real app exists" plan).
    // mapRole: false since this cluster has no aws-auth ConfigMap to patch
    // under authenticationMode: API -- the EC2_LINUX AccessEntry below is
    // what actually authenticates the node role instead.
    const nodeGroup = cluster.addAutoScalingGroupCapacity('NodeGroup', {
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MEDIUM),
      minCapacity: 2,
      maxCapacity: 2,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      securityGroup: nodeSecurityGroup,
      mapRole: false,
    });

    new eks.AccessEntry(this, 'NodeAccessEntry', {
      cluster,
      accessEntryType: eks.AccessEntryType.EC2_LINUX,
      principal: nodeGroup.role.roleArn,
      // EC2_LINUX entries authenticate the node itself, not a user/role
      // that needs RBAC permissions of its own -- no accessPolicies apply.
      accessPolicies: [],
    });

    // aws-ebs-csi-driver: EKS ships no default StorageClass/CSI driver the
    // way kind does (see infra/eks/consul-values.yaml's header comment) --
    // without this, Consul server's PVC sits Pending forever. Needs its own
    // IAM permissions via Pod Identity, which itself needs the
    // eks-pod-identity-agent addon installed first (explicit dependency
    // below, since addon ordering isn't otherwise inferred from
    // configuration).
    const podIdentityAgent = new eks.Addon(this, 'PodIdentityAgentAddon', {
      cluster,
      addonName: 'eks-pod-identity-agent',
    });

    const ebsCsiRole = new iam.Role(this, 'EbsCsiDriverRole', {
      // .withSessionTags(), not a plain ServicePrincipal -- EKS Pod
      // Identity's own trust policy requires sts:TagSession alongside
      // sts:AssumeRole (it session-tags the assumed role with cluster/
      // namespace/service-account info, see CfnPodIdentityAssociation's
      // disableSessionTags doc comment). A plain ServicePrincipal only
      // grants sts:AssumeRole, which CloudFormation rejects outright
      // ("Trust policy of the role provided is invalid") when creating the
      // PodIdentityAssociation below -- confirmed by hand against this
      // account.
      assumedBy: new iam.ServicePrincipal('pods.eks.amazonaws.com').withSessionTags(),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonEBSCSIDriverPolicy'),
      ],
    });

    const ebsCsiPodIdentity = new eks.CfnPodIdentityAssociation(this, 'EbsCsiPodIdentity', {
      clusterName: cluster.clusterName,
      namespace: 'kube-system',
      serviceAccount: 'ebs-csi-controller-sa',
      roleArn: ebsCsiRole.roleArn,
    });
    ebsCsiPodIdentity.node.addDependency(podIdentityAgent);

    const ebsCsiAddon = new eks.Addon(this, 'EbsCsiDriverAddon', {
      cluster,
      addonName: 'aws-ebs-csi-driver',
    });
    ebsCsiAddon.node.addDependency(ebsCsiPodIdentity);

    // Blog content in production (see packages/server/src/blogSource.js's
    // createS3BlogSource) -- .md files at the bucket root, each post's
    // images under a key prefix matching its own filename (minus .md),
    // exactly mirroring content/blog/'s own local layout. The bucket
    // policy below relies on that structurally: it's what lets "public
    // images, private markdown" be expressed as one prefix-based rule
    // instead of tagging/moving objects around.
    this.blogBucket = new s3.Bucket(this, 'BlogBucket', {
      // Public read is scoped by key pattern, not a blanket bucket policy
      // -- these settings just allow a bucket policy to grant it at all
      // (the account/bucket-level "block public access" defaults would
      // reject the policy below outright otherwise).
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicAcls: true,
        ignorePublicAcls: true,
        blockPublicPolicy: false,
        restrictPublicBuckets: false,
      }),
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });
    // "*/*" -- any key containing at least one "/" -- matches exactly the
    // postDir-prefixed image keys (e.g. "2026-08-16-.../diagram.png") and
    // nothing else; root-level "*.md" keys (no "/") are never matched, so
    // post markdown stays readable only via widgetgrid-server's own IAM
    // permissions below, never directly by the public.
    this.blogBucket.addToResourcePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      principals: [new iam.AnyPrincipal()],
      actions: ['s3:GetObject'],
      resources: [this.blogBucket.arnForObjects('*/*')],
    }));

    // Grants widgetgrid-server's OWN dedicated k8s ServiceAccount (not the
    // node's own instance role, which every pod on the node could then
    // also assume -- see infra/eks/manifests/widgetgrid-server.yaml's
    // serviceAccountName) permission to publish real SMS via SNS (see
    // packages/server/src/smsSender.js's createSnsSmsSender) and read blog
    // content from BlogBucket. Same Pod Identity pattern as the EBS CSI
    // driver above. sns:Publish has no resource-level ARN to scope to for
    // phone-number-targeted sends (unlike topic-based publish), so that
    // half is Resource: '*' by necessity, same as any SNS-direct-to-phone-
    // number setup; the S3 half is scoped to just this bucket.
    const serverRole = new iam.Role(this, 'WidgetgridServerRole', {
      assumedBy: new iam.ServicePrincipal('pods.eks.amazonaws.com').withSessionTags(),
    });
    serverRole.addToPolicy(new iam.PolicyStatement({
      actions: ['sns:Publish'],
      resources: ['*'],
    }));
    this.blogBucket.grantRead(serverRole);

    const serverPodIdentity = new eks.CfnPodIdentityAssociation(this, 'WidgetgridServerPodIdentity', {
      clusterName: cluster.clusterName,
      namespace: 'widgetgrid',
      serviceAccount: 'widgetgrid-server',
      roleArn: serverRole.roleArn,
    });
    serverPodIdentity.node.addDependency(podIdentityAgent);

    // Two dedicated repos (server, static), not one shared repo -- separate
    // images with separate lifecycles/tags, matching packages/server/Dockerfile
    // and packages/static-server/Dockerfile being two different builds.
    this.serverRepository = new ecr.Repository(this, 'ServerRepository', {
      repositoryName: 'widgetgrid-server',
      imageScanOnPush: true,
      emptyOnDelete: true,
      removalPolicy: RemovalPolicy.DESTROY,
    });
    this.staticRepository = new ecr.Repository(this, 'StaticRepository', {
      repositoryName: 'widgetgrid-static',
      imageScanOnPush: true,
      emptyOnDelete: true,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // NodePort + ASG-attach, not the AWS Load Balancer Controller: avoids
    // installing/maintaining an extra controller (its own IAM policy,
    // webhook, failure mode) for a dev environment. Health check hits
    // Envoy's static-file default route (a real 200, no app-level health
    // endpoint needed -- see infra/eks/envoy/envoy-eks.yaml).
    this.targetGroup = new elbv2.ApplicationTargetGroup(this, 'EnvoyTargetGroup', {
      vpc,
      port: ENVOY_GATEWAY_NODE_PORT,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targetType: elbv2.TargetType.INSTANCE,
      healthCheck: { path: '/' },
    });
    this.targetGroup.addTarget(nodeGroup);

    // Copy this into WidgetgridDevGatewayStack's next deploy as
    // `-c envoyTargetGroupArn=<value>` -- see the constructor's opening
    // comment for why this isn't wired up automatically.
    new CfnOutput(this, 'EnvoyTargetGroupArn', { value: this.targetGroup.targetGroupArn });
    new CfnOutput(this, 'ClusterName', { value: cluster.clusterName });
    new CfnOutput(this, 'ServerRepositoryUri', { value: this.serverRepository.repositoryUri });
    new CfnOutput(this, 'StaticRepositoryUri', { value: this.staticRepository.repositoryUri });
    new CfnOutput(this, 'BlogBucketName', { value: this.blogBucket.bucketName });
    // Feed into BLOG_ASSETS_BASE_URL (infra/eks/manifests/widgetgrid-server.yaml)
    // -- the bucket's own public REST endpoint, not a website-hosting URL
    // (static website hosting was never enabled; plain object GETs are all
    // this needs, per the bucket policy above).
    new CfnOutput(this, 'BlogBucketPublicUrl', { value: `https://${this.blogBucket.bucketRegionalDomainName}` });

    this.nodeSecurityGroup = nodeSecurityGroup;
    this.cluster = cluster;
  }
}
