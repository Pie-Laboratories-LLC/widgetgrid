import path from 'node:path';
import { fileURLToPath } from 'node:url';
import grpc from '@grpc/grpc-js';
import { getPool } from '@widgetgrid/db/src/pool.js';
import * as pagesRepo from '@widgetgrid/db/src/pagesRepo.js';
import * as widgetsRepo from '@widgetgrid/db/src/widgetsRepo.js';
import * as layoutNodesRepo from '@widgetgrid/db/src/layoutNodesRepo.js';
import { loadProto } from './loadProto.js';
import { createPageService } from './services/pageService.js';
import { createWidgetService } from './services/widgetService.js';
import { createBlogService } from './services/blogService.js';
import { createLocalBlogSource } from './blogSource.js';
import { createPollingBlogNotifier } from './blogChangeNotifier.js';
import { createAuthService } from './services/authService.js';
import { createChatService } from './services/chatService.js';
import { createConsoleOtpSender } from './otpSender.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HOST = process.env.GRPC_SERVER_HOST ?? '127.0.0.1';
const PORT = process.env.GRPC_SERVER_PORT ?? '50051';
// Local filesystem in dev; production points this at an S3 bucket instead
// (see blogSource.js's header comment -- not implemented yet).
const BLOG_CONTENT_DIR = process.env.BLOG_CONTENT_DIR ?? path.resolve(__dirname, '../../../content/blog');
// Public URL prefix a post's own asset subdirectory is served under, e.g.
// "/blog-assets/2026-08-16-electrifying-results/diagram.png" -- something
// actually serves that path (locally: web-app's dev server middleware +
// assemble-static.mjs for the built bundle; in production: wherever the S3
// bucket/CDN publicly serves the same postDir prefix from).
const BLOG_ASSETS_BASE_URL = process.env.BLOG_ASSETS_BASE_URL ?? '/blog-assets';
// How often the local "did a new post show up" poll runs (see
// blogChangeNotifier.js) -- irrelevant once a real S3-event-driven
// notifier replaces it, since that's push, not poll.
const BLOG_POLL_INTERVAL_MS = Number(process.env.BLOG_POLL_INTERVAL_MS ?? 20_000);
// The one phone number a login code ever goes to -- there's no signup,
// this is a single-owner login, not a general accounts system.
const OWNER_PHONE_NUMBER = process.env.OWNER_PHONE_NUMBER ?? '';

export function startServer() {
  const pool = getPool();
  const proto = loadProto();
  const blogSource = createLocalBlogSource({ dir: BLOG_CONTENT_DIR, assetsBaseUrl: BLOG_ASSETS_BASE_URL });
  // Injected, not hardcoded into blogService.js: swapping in a real
  // S3-event-driven notifier later (see that file's header comment) is a
  // one-line change here, same seam as blogSource above.
  const blogChangeNotifier = createPollingBlogNotifier({ blogSource, intervalMs: BLOG_POLL_INTERVAL_MS });
  // Logs the code instead of texting it -- see otpSender.js's header
  // comment for why a real SMS provider isn't wired up here, same
  // reasoning as blogSource's unbuilt S3 half.
  const otpSender = createConsoleOtpSender();

  const server = new grpc.Server();
  server.addService(proto.PageService.service, createPageService({ pool, pagesRepo, layoutNodesRepo }));
  server.addService(proto.WidgetService.service, createWidgetService({ pool, widgetsRepo }));
  server.addService(proto.BlogService.service, createBlogService({ blogSource, blogChangeNotifier }));
  server.addService(proto.AuthService.service, createAuthService({ pool, ownerPhoneNumber: OWNER_PHONE_NUMBER, otpSender }));
  server.addService(proto.ChatService.service, createChatService({ pool }));

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
