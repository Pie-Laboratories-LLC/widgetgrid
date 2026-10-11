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
import { createActivityHandlers } from './services/activityService.js';
import { createChangeHandlers, pruneChanges } from './services/changeService.js';
import { createChangeHub } from './changeHub.js';
import pg from 'pg';

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
export function addServices(server, { pool, authContext, hub }) {
  const proto = loadProto();
  server.addService(proto.ProjectService.service, createHandlers(authContext, createProjectHandlers({ pool })));
  server.addService(proto.IssueTypeService.service, createHandlers(authContext, createIssueTypeHandlers({ pool })));
  server.addService(proto.IssueService.service, createHandlers(authContext, { ...createIssueHandlers({ pool }), ...createActivityHandlers({ pool }) }));
  server.addService(proto.ChangeService.service, createHandlers(authContext, createChangeHandlers({ pool, hub })));
  return server;
}

export function startServer() {
  const pool = getPool();
  const { verifyAccessToken } = createCognitoVerifiers();
  const authContext = createAuthContext({ pool, verifyAccessToken });
  const hub = createChangeHub({ connect: () => new pg.Client({ connectionString: pool.options.connectionString }) });
  hub.start();
  // Replay window for reconnecting clients: a week of changes.
  setInterval(() => pruneChanges(pool).catch((err) => console.error('pruning changes failed:', err)), 60 * 60 * 1000).unref();
  const server = addServices(new grpc.Server(), { pool, authContext, hub });
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
