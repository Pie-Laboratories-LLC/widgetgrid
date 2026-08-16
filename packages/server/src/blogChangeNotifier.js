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
    watch(onNewPost) {
      let lastSlug;
      let hasBaseline = false;
      const timer = setInterval(async () => {
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
        if (shouldNotify) onNewPost(newest); // first poll only establishes the baseline, doesn't notify
      }, intervalMs);
      return () => clearInterval(timer);
    },
  };
}
