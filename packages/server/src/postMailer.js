import * as defaultRepo from '@widgetgrid/db/src/emailSubscriptionsRepo.js';
import { newPostEmail } from './subscriptionEmails.js';
import { CONFIRM_TTL_MS } from './services/subscriptionService.js';

// Emails every active subscriber once per new blog post. Its own poll of
// blogSource, not blogChangeNotifier.js's: that one exists per browser
// subscription and runs only while someone has the site open; this runs
// for the server's whole life, whether anyone's looking or not.
//
// "Once" is the database's job, not this process's memory: each post is
// claimed with an insert into blog_post_mailings, and only the claimant
// sends -- so a restart, or a second replica polling the same bucket,
// never sends a post twice. The very first run (no mailings recorded at
// all) claims every existing post as already handled without sending, so
// turning this on doesn't email the whole back catalogue.
export function createPostMailer({
  pool, blogSource, emailSender, siteOrigin, intervalMs = 60_000, repo = defaultRepo, now = () => Date.now(),
}) {
  let timer = null;
  let firstTimer = null;

  async function tick() {
    const posts = await blogSource.listPosts(); // newest first
    const mailed = new Set(await repo.listMailingSlugs(pool));
    if (mailed.size === 0) {
      for (const post of posts) await repo.claimMailing(pool, { slug: post.slug, sent: false });
      return;
    }
    // Oldest first, so two posts landing together go out in order.
    for (const post of [...posts].reverse()) {
      if (mailed.has(post.slug)) continue;
      if (!(await repo.claimMailing(pool, { slug: post.slug, sent: true }))) continue;
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
    }
    await repo.deleteExpiredPending(pool, { sentBefore: new Date(now() - CONFIRM_TTL_MS) });
  }

  async function safeTick() {
    try {
      await tick();
    } catch (err) {
      console.error('[postMailer] poll failed:', err); // transient; try again next interval
    }
  }

  return {
    tick,
    // The first check waits a little: in the mesh, this pod's outbound
    // connections (Postgres included) go through its Consul sidecar, which
    // isn't accepting yet the moment the server starts -- an immediate
    // check failed with ECONNREFUSED on every pod start.
    start({ firstDelayMs = 15_000 } = {}) {
      firstTimer = setTimeout(safeTick, firstDelayMs);
      timer = setInterval(safeTick, intervalMs);
      firstTimer.unref?.();
      timer.unref?.();
    },
    stop() {
      clearTimeout(firstTimer);
      clearInterval(timer);
    },
  };
}
