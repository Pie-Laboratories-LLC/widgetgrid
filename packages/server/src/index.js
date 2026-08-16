import grpc from '@grpc/grpc-js';
import { getPool } from '@widgetgrid/db/src/pool.js';
import * as pagesRepo from '@widgetgrid/db/src/pagesRepo.js';
import * as widgetsRepo from '@widgetgrid/db/src/widgetsRepo.js';
import * as layoutNodesRepo from '@widgetgrid/db/src/layoutNodesRepo.js';
import { loadProto } from './loadProto.js';
import { createPageService } from './services/pageService.js';
import { createWidgetService } from './services/widgetService.js';

const HOST = process.env.GRPC_SERVER_HOST ?? '127.0.0.1';
const PORT = process.env.GRPC_SERVER_PORT ?? '50051';

export function startServer() {
  const pool = getPool();
  const proto = loadProto();

  const server = new grpc.Server();
  server.addService(proto.PageService.service, createPageService({ pool, pagesRepo, layoutNodesRepo }));
  server.addService(proto.WidgetService.service, createWidgetService({ pool, widgetsRepo }));

  return new Promise((resolve, reject) => {
    server.bindAsync(`${HOST}:${PORT}`, grpc.ServerCredentials.createInsecure(), (err, boundPort) => {
      if (err) {
        reject(err);
        return;
      }
      // mTLS/discovery is the Consul Connect sidecar's job, not this
      // process's -- plaintext-on-localhost is the standard Connect pattern
      // (the app only ever talks to its local sidecar).
      console.log(`widgetgrid server listening on ${HOST}:${boundPort} (plaintext, expects a Connect sidecar in front for anything beyond localhost)`);
      resolve(server);
    });
  });
}

// Only auto-start when run directly (`node src/index.js`), not when
// imported by tests/the e2e client test, which want to control lifecycle
// themselves.
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}
