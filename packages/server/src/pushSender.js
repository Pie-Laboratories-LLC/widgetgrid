import webpush from 'web-push';
import * as defaultRepo from '@widgetgrid/db/src/pushSubscriptionsRepo.js';

// Web Push to the owner's subscribed browsers (iPhone Home Screen app,
// desktop Chrome, ...). VAPID keys identify this server to the browser
// push services; generate once with `npx web-push generate-vapid-keys` and
// set VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY (see .env.example). Without
// them push is disabled and sends are no-ops, so local dev works unset.
export function createPushSender({ pool, publicKey, privateKey, subject, repo = defaultRepo, send = webpush.sendNotification }) {
  const enabled = !!(publicKey && privateKey);
  const options = enabled
    ? { vapidDetails: { subject, publicKey, privateKey }, TTL: 60 * 60, urgency: 'high' }
    : null;

  return {
    enabled,
    publicKey: enabled ? publicKey : '',

    // payload: { title, body, tag, url } -- read by packages/web-app/public/sw.js.
    // Returns how many browsers accepted it. Subscriptions the push
    // service reports gone (404/410: uninstalled, permission revoked) are
    // deleted; other failures are logged and skipped.
    async sendToOwner(payload) {
      if (!enabled) {
        console.log(`[push disabled] would notify owner: ${payload.title}`);
        return 0;
      }
      const subscriptions = await repo.listForOwner(pool);
      const results = await Promise.all(subscriptions.map(async (s) => {
        try {
          await send({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify(payload), options);
          await repo.markSuccess(pool, s.endpoint);
          return 1;
        } catch (err) {
          if (err.statusCode === 404 || err.statusCode === 410) {
            await repo.removeByEndpoint(pool, s.endpoint);
          } else {
            console.error('push failed:', err.statusCode ?? '', err.body ?? err.message);
          }
          return 0;
        }
      }));
      return results.reduce((a, b) => a + b, 0);
    },
  };
}
