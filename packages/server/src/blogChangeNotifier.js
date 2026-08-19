// DI seam for "a new post appeared in the content source" -- swapped for a
// real implementation in production (S3 Event Notifications -> SQS,
// consumed here) without touching blogService.js at all, which only
// depends on the watch(onNewPost) shape. Not built: no way to test an S3
// event pipeline without real AWS infra (same reasoning as
// blogSource.js's local-vs-S3 split). This local version just polls
// blogSource.listPosts() on an interval and diffs the newest post's slug
// against the last poll -- good enough for local dev, and for the "I
// really don't care how this works locally" the local-only half of this
// was explicitly given.
export function createPollingBlogNotifier({ blogSource, intervalMs = 20_000 }) {
  return {
    // Returns an unwatch function. Multiple concurrent watchers (multiple
    // browser tabs subscribed at once) each get their own interval --
    // simple, and at this poll frequency/scale not worth sharing one poll
    // loop across subscribers.
    //
    // lastKnownSlug (from the client's own memory of what it's already
    // seen, see blogSubscriptionClient.js) seeds the baseline instead of
    // always starting fresh from "whatever's newest right now" -- without
    // this, a subscriber that reconnects (any dropped stream does, e.g.
    // the ALB's 60s idle timeout) silently absorbs anything published
    // during the gap into its new baseline instead of ever reporting it.
    // Doing an immediate poll() before the first interval tick (rather
    // than waiting intervalMs) is what makes that catch-up happen right
    // on reconnect instead of up to intervalMs later.
    watch(onNewPost, { lastKnownSlug = '' } = {}) {
      let lastSlug = lastKnownSlug || undefined;
      let hasBaseline = !!lastKnownSlug;

      async function poll() {
        let posts;
        try {
          posts = await blogSource.listPosts();
        } catch {
          return; // transient read errors shouldn't kill the poll loop
        }
        const newest = posts[0];
        if (!newest || newest.slug === lastSlug) return;
        const shouldNotify = hasBaseline;
        lastSlug = newest.slug;
        hasBaseline = true;
        if (shouldNotify) onNewPost(newest); // no lastKnownSlug given: first poll only establishes the baseline, doesn't notify
      }

      poll();
      const timer = setInterval(poll, intervalMs);
      return () => clearInterval(timer);
    },
  };
}
