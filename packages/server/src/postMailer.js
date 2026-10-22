import * as defaultRepo from '@widgetgrid/db/src/emailSubscriptionsRepo.js';
import { newPostEmail } from './subscriptionEmails.js';
import { CONFIRM_TTL_MS } from './services/subscriptionService.js';

// Emails every active subscriber about a blog post -- when the owner says
// so (AuthorService.EmailSubscribers), never automatically: a post can be
// published, checked, and fixed before anyone is told about it.
//
// "Once" is the database's job: send() first claims the post in
// blog_post_mailings, and only the caller that claimed it sends -- a
// double click, or a second replica, gets AlreadySent instead.
//
// start() runs the one remaining periodic job: clearing subscriptions
// whose confirmation link was never used.

export class AlreadySent extends Error {}

export function createPostMailer({
  pool, emailSender, siteOrigin, repo = defaultRepo, now = () => Date.now(), cleanupIntervalMs = 60 * 60 * 1000,
}) {
  let timer = null;

  async function cleanup() {
    try {
      await repo.deleteExpiredPending(pool, { sentBefore: new Date(now() - CONFIRM_TTL_MS) });
    } catch (err) {
      console.error('[postMailer] cleanup failed:', err); // transient; next interval
    }
  }

  return {
    // post: as blogSource.listPosts() returns it. Resolves to how many
    // subscribers it reached; one failed delivery doesn't stop the rest.
    async send(post) {
      if (!(await repo.claimSend(pool, post.slug))) throw new AlreadySent(`"${post.slug}" was already emailed.`);
      const subscribers = await repo.listActive(pool);
      let delivered = 0;
      for (const { email, unsubscribe_token: unsubscribeToken } of subscribers) {
        try {
          await emailSender.send(newPostEmail({ siteOrigin, to: email, unsubscribeToken, post }));
          delivered += 1;
        } catch (err) {
          console.error(`[postMailer] sending "${post.slug}" to ${email} failed:`, err);
        }
      }
      console.log(`[postMailer] "${post.slug}" emailed to ${delivered}/${subscribers.length} subscriber(s)`);
      return delivered;
    },
    cleanup,
    // The first run waits a little: in the mesh, this pod's outbound
    // connections (Postgres included) go through its Consul sidecar, which
    // isn't accepting yet the moment the server starts.
    start({ firstDelayMs = 15_000 } = {}) {
      timer = setTimeout(function run() {
        cleanup();
        timer = setTimeout(run, cleanupIntervalMs);
        timer.unref?.();
      }, firstDelayMs);
      timer.unref?.();
    },
    stop() {
      clearTimeout(timer);
    },
  };
}
