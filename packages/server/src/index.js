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
import { createLocalBlogSource, createS3BlogSource } from './blogSource.js';
import { createPollingBlogNotifier } from './blogChangeNotifier.js';
import { createAuthService } from './services/authService.js';
import { createChatService } from './services/chatService.js';
import { createConsoleSmsSender, createSnsSmsSender } from './smsSender.js';
import { createAuthContext, createCognitoVerifiers } from './authContext.js';
import { createPushSender } from './pushSender.js';
import { createPushService } from './services/pushService.js';
import { createDeviceActivity } from './deviceActivity.js';
import { createConsoleEmailSender, createSesEmailSender } from './emailSender.js';
import { createTurnstileVerifier } from './turnstile.js';
import { createSubscriptionService } from './services/subscriptionService.js';
import { createPostMailer } from './postMailer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HOST = process.env.GRPC_SERVER_HOST ?? '127.0.0.1';
const PORT = process.env.GRPC_SERVER_PORT ?? '50051';
// Local filesystem in dev. Production (EKS) sets BLOG_S3_BUCKET instead --
// see infra/eks/manifests/widgetgrid-server.yaml and blogSource.js's
// createS3BlogSource. Unset here, not defaulted, since its mere presence
// is the local-vs-S3 switch below.
const BLOG_CONTENT_DIR = process.env.BLOG_CONTENT_DIR ?? path.resolve(__dirname, '../../../content/blog');
const BLOG_S3_BUCKET = process.env.BLOG_S3_BUCKET;
// Public URL prefix a post's own asset subdirectory is served under, e.g.
// "/blog-assets/2026-08-16-electrifying-results/diagram.png" -- something
// actually serves that path (locally: web-app's dev server middleware +
// assemble-static.mjs for the built bundle; in production: the BlogBucket's
// own public URL, see infra/cdk/lib/eks-stack.js). `||`, not `??` --
// confirmed the hard way that an env var explicitly set to an empty string
// (a deploy-tooling mistake, envsubst silently substitutes "" for an unset
// shell variable rather than failing) is a real failure mode worth
// defaulting away from, not just a theoretical one; `??` only catches
// null/undefined, not "".
const BLOG_ASSETS_BASE_URL = process.env.BLOG_ASSETS_BASE_URL || '/blog-assets';
// How often the local "did a new post show up" poll runs (see
// blogChangeNotifier.js) -- irrelevant once a real S3-event-driven
// notifier replaces it, since that's push, not poll.
const BLOG_POLL_INTERVAL_MS = Number(process.env.BLOG_POLL_INTERVAL_MS ?? 20_000);
// Where chatService.js texts offline-message alerts (SMS is behind 10DLC
// registration; see smsSender.js).
const OWNER_PHONE_NUMBER = process.env.OWNER_PHONE_NUMBER ?? '';
// 'console' (default, local dev) logs instead of texting; 'sns' (set in
// infra/eks/manifests/widgetgrid-server.yaml) sends real texts via SNS --
// see smsSender.js.
const SMS_PROVIDER = process.env.SMS_PROVIDER ?? 'console';
// The Identity Center email that becomes role 'owner' on sign-in (chat
// server side, presence). Everyone else who signs in is a 'member'.
const OWNER_EMAIL = process.env.OWNER_EMAIL ?? '';
// Web Push (owner chat alerts) -- see pushSender.js. Unset = push disabled.
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY ?? '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY ?? '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:webmaster@pie-laboratories.com';
// The public origin every absolute link in an email or the RSS feed is
// built on. `||` for the same envsubst-empty-string reason as
// BLOG_ASSETS_BASE_URL above.
const SITE_ORIGIN = process.env.SITE_ORIGIN || 'http://localhost:5173';
// 'console' (default, local dev) logs emails instead of sending; 'ses'
// (infra/eks/manifests/widgetgrid-server.yaml) sends via Amazon SES -- see
// emailSender.js.
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER ?? 'console';
const EMAIL_FROM = process.env.EMAIL_FROM || 'Pie Laboratories <news@pie-laboratories.com>';
const EMAIL_REPLY_TO = process.env.EMAIL_REPLY_TO || 'webmaster@pie-laboratories.com';
// Unset = captcha checks skipped (local dev) -- see turnstile.js.
const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY ?? '';
// How often postMailer.js looks for a post to email subscribers about.
const POST_MAILER_INTERVAL_MS = Number(process.env.POST_MAILER_INTERVAL_MS ?? 60_000);

export function startServer() {
  const pool = getPool();
  const proto = loadProto();
  const blogSource = BLOG_S3_BUCKET
    ? createS3BlogSource({ bucket: BLOG_S3_BUCKET, assetsBaseUrl: BLOG_ASSETS_BASE_URL })
    : createLocalBlogSource({ dir: BLOG_CONTENT_DIR, assetsBaseUrl: BLOG_ASSETS_BASE_URL });
  // Injected, not hardcoded into blogService.js: swapping in a real
  // S3-event-driven notifier later (see that file's header comment) is a
  // one-line change here, same seam as blogSource above.
  const blogChangeNotifier = createPollingBlogNotifier({ blogSource, intervalMs: BLOG_POLL_INTERVAL_MS });
  // ChatService's offline-message alerts -- see smsSender.js.
  const smsSender = SMS_PROVIDER === 'sns' ? createSnsSmsSender() : createConsoleSmsSender();

  const { verifyAccessToken, verifyIdToken } = createCognitoVerifiers();
  const authContext = createAuthContext({ pool, verifyAccessToken });
  const pushSender = createPushSender({ pool, publicKey: VAPID_PUBLIC_KEY, privateKey: VAPID_PRIVATE_KEY, subject: VAPID_SUBJECT });
  const deviceActivity = createDeviceActivity();
  const emailSender = EMAIL_PROVIDER === 'ses'
    ? createSesEmailSender({ from: EMAIL_FROM, replyTo: EMAIL_REPLY_TO })
    : createConsoleEmailSender();
  const captcha = createTurnstileVerifier({ secretKey: TURNSTILE_SECRET_KEY });

  const server = new grpc.Server();
  server.addService(proto.PageService.service, createPageService({ pool, pagesRepo, layoutNodesRepo }));
  server.addService(proto.WidgetService.service, createWidgetService({ pool, widgetsRepo }));
  server.addService(proto.BlogService.service, createBlogService({ blogSource, blogChangeNotifier, siteOrigin: SITE_ORIGIN }));
  server.addService(proto.AuthService.service, createAuthService({ pool, verifyIdToken, ownerEmail: OWNER_EMAIL }));
  server.addService(proto.PushService.service, createPushService({ pool, authContext, pushSender, deviceActivity }));
  server.addService(proto.ChatService.service, createChatService({ pool, authContext, pushSender, deviceActivity, ownerPhoneNumber: OWNER_PHONE_NUMBER, smsSender }));
  server.addService(proto.SubscriptionService.service, createSubscriptionService({ pool, authContext, emailSender, captcha, siteOrigin: SITE_ORIGIN }));

  createPostMailer({ pool, blogSource, emailSender, siteOrigin: SITE_ORIGIN, intervalMs: POST_MAILER_INTERVAL_MS }).start();

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
