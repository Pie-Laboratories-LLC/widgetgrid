import { Stack, RemovalPolicy, CfnOutput } from 'aws-cdk-lib';
import * as ecr from 'aws-cdk-lib/aws-ecr';

// Resources both environments use, so neither env's stack can take them
// down with it. The ECR repos originally lived in WidgetgridEksStack (dev),
// which meant `cdk destroy WidgetgridEksStack` would have deleted prod's
// images too; they were moved here 2026-10-11 by retaining them out of
// that stack and `cdk import`-ing them into this one. RETAIN on purpose:
// these hold the only copy of every deployed image.
export class SharedStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // Two dedicated repos (server, static), not one shared repo -- separate
    // images with separate lifecycles/tags, matching packages/server/Dockerfile
    // and packages/static-server/Dockerfile being two different builds.
    this.serverRepository = new ecr.Repository(this, 'ServerRepository', {
      repositoryName: 'widgetgrid-server',
      imageScanOnPush: true,
      removalPolicy: RemovalPolicy.RETAIN,
    });
    this.staticRepository = new ecr.Repository(this, 'StaticRepository', {
      repositoryName: 'widgetgrid-static',
      imageScanOnPush: true,
      removalPolicy: RemovalPolicy.RETAIN,
    });
    // Embuscade (~/GIT/embuscade): its own image, own repo -- same
    // reasoning as splitting server/static above. Built straight from that
    // repo's own Dockerfile (see infra/eks/deploy.sh), not from anything in
    // this repo's build context, unlike the widget bundle it also ships
    // (baked into StaticRepository's image via widgets/embuscade's vendor
    // step -- see packages/static-server/Dockerfile's EMBUSCADE_REPO_DIR).
    this.embuscadeRepository = new ecr.Repository(this, 'EmbuscadeRepository', {
      repositoryName: 'embuscade-server',
      imageScanOnPush: true,
      removalPolicy: RemovalPolicy.RETAIN,
    });

    // l'horaire's gRPC server (packages/lhoraire-server).
    this.lhoraireRepository = new ecr.Repository(this, 'LhoraireRepository', {
      repositoryName: 'lhoraire-server',
      imageScanOnPush: true,
      removalPolicy: RemovalPolicy.RETAIN,
    });

    // The Last Naming's creature service (~/GIT/c-libraries,
    // docs/service.md): built from that repo's own
    // Dockerfile.service-creatures (see infra/eks/deploy.sh).
    this.creaturesRepository = new ecr.Repository(this, 'CreaturesRepository', {
      repositoryName: 'service-creatures',
      imageScanOnPush: true,
      removalPolicy: RemovalPolicy.RETAIN,
    });

    new CfnOutput(this, 'ServerRepositoryUri', { value: this.serverRepository.repositoryUri });
    new CfnOutput(this, 'StaticRepositoryUri', { value: this.staticRepository.repositoryUri });
    new CfnOutput(this, 'EmbuscadeRepositoryUri', { value: this.embuscadeRepository.repositoryUri });
    new CfnOutput(this, 'LhoraireRepositoryUri', { value: this.lhoraireRepository.repositoryUri });
    new CfnOutput(this, 'CreaturesRepositoryUri', { value: this.creaturesRepository.repositoryUri });
  }
}
