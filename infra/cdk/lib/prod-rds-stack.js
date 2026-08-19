import { Stack, CfnOutput } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';

// Prod's own Postgres instance -- see prod-gateway-stack.js's header
// comment for why this is a new file rather than a parameterized
// RdsStack. Same cost-minimized dev tier sizing as the existing instance
// (no Multi-AZ, smallest Graviton burstable class); revisit only if prod
// actually demands more. Genuinely separate physical instance/data from
// dev's, per the deploy plan's isolation decision -- real chat/blog data
// belongs here, not dev's test content.
export class ProdRdsStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);
    const { vpc, nodeSecurityGroup } = props;

    const dbSecurityGroup = new ec2.SecurityGroup(this, 'DbSecurityGroup', {
      vpc,
      description: 'widgetgrid-prod RDS instance',
      allowAllOutbound: false,
    });
    dbSecurityGroup.addIngressRule(
      nodeSecurityGroup,
      ec2.Port.tcp(5432),
      'EKS node group to Postgres',
    );

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

    new CfnOutput(this, 'DbSecretArn', { value: this.secret.secretArn });
  }
}
