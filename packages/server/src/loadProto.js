import path from 'node:path';
import { fileURLToPath } from 'node:url';
import protoLoader from '@grpc/proto-loader';
import grpc from '@grpc/grpc-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROTO_ROOT = path.resolve(__dirname, '../../../proto');

export function loadProto() {
  const packageDefinition = protoLoader.loadSync(
    [
      path.join(PROTO_ROOT, 'widgetgrid/v1/page.proto'),
      path.join(PROTO_ROOT, 'widgetgrid/v1/widget.proto'),
    ],
    {
      keepCase: false,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
      includeDirs: [PROTO_ROOT],
    },
  );
  return grpc.loadPackageDefinition(packageDefinition).widgetgrid.v1;
}
