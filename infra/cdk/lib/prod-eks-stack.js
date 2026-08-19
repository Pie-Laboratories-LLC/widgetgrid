import { Stack, RemovalPolicy, CfnOutput } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as eks from 'aws-cdk-lib/aws-eks';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as iam from 'aws-cdk-lib/aws-iam';
import { ENVOY_GATEWAY_NODE_PORT } from './eks-stack.js';

// Same person deploys both environments -- see eks-stack.js's identical
// constant for the full reasoning (authenticationMode: API means this
// AccessEntry is the only way kubectl/helm from infra/eks/deploy.sh work
// at all, no aws-auth ConfigMap fallback).
const DEPLOYING_USER_ARN = 'arn:aws:iam::913318903667:user/mlemay';

// Prod's public-facing sibling of EksStack (dev) -- see
// infra/cdk/lib/prod-gateway-stack.js's header comment for why this is a
// new file rather than a parameterized EksStack: that stack is live and
// proven, and duplicating avoids any risk of an accidental replacement on
// infrastructure that already works. Everything here is genuinely a
// separate physical cluster/ASG/bucket from dev's -- see this repo's
// deploy plan for the isolation rationale -- with ONE deliberate
// exception: ECR repos are imported by fixed name below, not recreated,
// since a registry isn't runtime state and has no blast-radius overlap
// with the dev/prod isolation this stack otherwise maintains.
export class ProdEksStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);
    // vpc/albSecurityGroup come from WidgetgridProdGatewayStack, same
    // one-directional-reference reasoning as EksStack/DevGatewayStack (see
    // that pair's own comments) -- this stack's target group flows back
    // via a `-c prodEnvoyTargetGroupArn=...` CDK context value on
    // ProdGatewayStack's next deploy instead, not a live construct
    // reference, to avoid a circular CloudFormation stack dependency.
    const { vpc, albSecurityGroup } = props;

    const cluster = new eks.Cluster(this, 'Cluster', {
      clusterName: 'widgetgrid-prod',
      // Same AMI-availability constraint as dev's cluster -- see
      // eks-stack.js's identical comment; V1_32 is the newest version with
      // a published EKS-optimized AMI in this account/region as of when
      // that was confirmed.
      version: eks.KubernetesVersion.V1_32,
      vpc,
      vpcSubnets: [{ subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS }],
      authenticationMode: eks.AuthenticationMode.API,
      bootstrapClusterCreatorAdminPermissions: true,
      defaultCapacity: 0,
    });

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

    const nodeSecurityGroup = new ec2.SecurityGroup(this, 'NodeSecurityGroup', {
      vpc,
      description: 'widgetgrid-prod EKS node group',
      allowAllOutbound: true,
    });
    nodeSecurityGroup.addIngressRule(
      albSecurityGroup,
      ec2.Port.tcp(ENVOY_GATEWAY_NODE_PORT),
      'ALB to envoy-gateway NodePort',
    );

    // Self-managed, not eks.Nodegroup -- same ALB-target-group-attachment
    // reason as dev's cluster (see eks-stack.js's identical comment).
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
      accessPolicies: [],
    });

    const podIdentityAgent = new eks.Addon(this, 'PodIdentityAgentAddon', {
      cluster,
      addonName: 'eks-pod-identity-agent',
    });

    const ebsCsiRole = new iam.Role(this, 'EbsCsiDriverRole', {
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

    // Own bucket -- genuinely fresh, no content copied from dev's (see the
    // deploy plan's "Post-deploy manual steps"). Same public-images/
    // private-markdown policy shape as dev's, see eks-stack.js's identical
    // comment for why the "*/*" pattern works for that split.
    this.blogBucket = new s3.Bucket(this, 'BlogBucket', {
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicAcls: true,
        ignorePublicAcls: true,
        blockPublicPolicy: false,
        restrictPublicBuckets: false,
      }),
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });
    this.blogBucket.addToResourcePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      principals: [new iam.AnyPrincipal()],
      actions: ['s3:GetObject'],
      resources: [this.blogBucket.arnForObjects('*/*')],
    }));

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

    // Imported by fixed name, not created -- see this file's header
    // comment. Same two repos WidgetgridEksStack (dev) already owns;
    // infra/eks/deploy.sh's prod path pushes here too, just with a
    // `prod-`-prefixed tag.
    this.serverRepository = ecr.Repository.fromRepositoryName(this, 'ServerRepository', 'widgetgrid-server');
    this.staticRepository = ecr.Repository.fromRepositoryName(this, 'StaticRepository', 'widgetgrid-static');

    this.targetGroup = new elbv2.ApplicationTargetGroup(this, 'EnvoyTargetGroup', {
      vpc,
      port: ENVOY_GATEWAY_NODE_PORT,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targetType: elbv2.TargetType.INSTANCE,
      healthCheck: { path: '/' },
    });
    this.targetGroup.addTarget(nodeGroup);

    // Copy into WidgetgridProdGatewayStack's next deploy as
    // `-c prodEnvoyTargetGroupArn=<value>` -- deliberately a different
    // context key than dev's `envoyTargetGroupArn` so a dev redeploy and a
    // prod redeploy can never accidentally read each other's value.
    new CfnOutput(this, 'EnvoyTargetGroupArn', { value: this.targetGroup.targetGroupArn });
    new CfnOutput(this, 'ClusterName', { value: cluster.clusterName });
    new CfnOutput(this, 'BlogBucketName', { value: this.blogBucket.bucketName });
    new CfnOutput(this, 'BlogBucketPublicUrl', { value: `https://${this.blogBucket.bucketRegionalDomainName}` });

    this.nodeSecurityGroup = nodeSecurityGroup;
    this.cluster = cluster;
  }
}
