import { Stack, CfnOutput } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';

// Single Postgres instance, cost-minimized dev tier (no Multi-AZ, smallest
// Graviton burstable class) -- matches every other sizing choice made for
// this environment. See infra/cdk/README.md.
export class RdsStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);
    const { vpc, nodeSecurityGroup } = props;

    const dbSecurityGroup = new ec2.SecurityGroup(this, 'DbSecurityGroup', {
      vpc,
      description: 'widgetgrid-dev RDS instance',
      allowAllOutbound: false,
    });
    dbSecurityGroup.addIngressRule(
      nodeSecurityGroup,
      ec2.Port.tcp(5432),
      'EKS node group to Postgres',
    );

    // Credentials generated into Secrets Manager rather than a fixed
    // literal -- infra/eks/deploy.sh reads this secret at apply time and
    // materializes it as a plain k8s Secret (same idiom
    // local-k8s/setup.sh already uses for its own DATABASE_URL ConfigMap,
    // just sourced from Secrets Manager instead of `docker network inspect`).
    this.instance = new rds.DatabaseInstance(this, 'Instance', {
      engine: rds.DatabaseInstanceEngine.postgres({ version: rds.PostgresEngineVersion.VER_17_9 }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T4G, ec2.InstanceSize.MICRO),
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      securityGroups: [dbSecurityGroup],
      credentials: rds.Credentials.fromGeneratedSecret('widgetgrid'),
      databaseName: 'widgetgrid',
      multiAz: false,
      allocatedStorage: 20,
      storageEncrypted: true,
      deleteAutomatedBackups: true,
    });

    this.secret = this.instance.secret;

    // Read by infra/eks/deploy.sh to build the k8s Secret it materializes
    // DATABASE_URL from -- the secret JSON gains host/port/dbname/engine
    // fields once attached to the instance (SecretTargetAttachment, created
    // automatically by fromGeneratedSecret), on top of the
    // username/password it starts with.
    new CfnOutput(this, 'DbSecretArn', { value: this.secret.secretArn });
  }
}
