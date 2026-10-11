import path from 'node:path';
import { fileURLToPath } from 'node:url';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import { getPool } from '@widgetgrid/db/src/pool.js';
import { createAuthContext, createCognitoVerifiers } from '@widgetgrid/auth-node';
import { createHandlers } from './grpc.js';
import { createProjectHandlers } from './services/projectService.js';
import { createIssueTypeHandlers } from './services/issueTypeService.js';
import { createIssueHandlers } from './services/issueService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HOST = process.env.GRPC_SERVER_HOST ?? '127.0.0.1';
const PORT = process.env.GRPC_SERVER_PORT ?? '50061';
const PROTO_ROOT = path.resolve(__dirname, '../../../proto');

export function loadProto() {
  const definition = protoLoader.loadSync([path.join(PROTO_ROOT, 'lhoraire/v1/lhoraire.proto')], {
    keepCase: false,
    longs: Number,
    enums: String,
    defaults: true,
    oneofs: true,
    includeDirs: [PROTO_ROOT],
  });
  return grpc.loadPackageDefinition(definition).lhoraire.v1;
}

// Registers every l'horaire service on a gRPC server. Exported for tests,
// which pass their own pool and auth context.
export function addServices(server, { pool, authContext }) {
  const proto = loadProto();
  server.addService(proto.ProjectService.service, createHandlers(authContext, createProjectHandlers({ pool })));
  server.addService(proto.IssueTypeService.service, createHandlers(authContext, createIssueTypeHandlers({ pool })));
  server.addService(proto.IssueService.service, createHandlers(authContext, createIssueHandlers({ pool })));
  return server;
}

export function startServer() {
  const pool = getPool();
  const { verifyAccessToken } = createCognitoVerifiers();
  const authContext = createAuthContext({ pool, verifyAccessToken });
  const server = addServices(new grpc.Server(), { pool, authContext });
  return new Promise((resolve, reject) => {
    server.bindAsync(`${HOST}:${PORT}`, grpc.ServerCredentials.createInsecure(), (err, boundPort) => {
      if (err) {
        reject(err);
        return;
      }
      // Same as widgetgrid-server: plaintext on localhost, the Consul
      // Connect sidecar handles mTLS and discovery.
      console.log(`lhoraire server listening on ${HOST}:${boundPort}`);
      resolve(server);
    });
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  startServer().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
