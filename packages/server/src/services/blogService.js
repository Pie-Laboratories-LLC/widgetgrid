import grpc from '@grpc/grpc-js';

export function createBlogService({ blogSource, blogChangeNotifier }) {
  return {
    async ListBlogPosts(call, callback) {
      try {
        const posts = await blogSource.listPosts();
        callback(null, { posts });
      } catch (err) {
        callback({ code: grpc.status.INTERNAL, message: err.message });
      }
    },

    // Stays open for the life of the client's subscription -- unwatch()
    // (see blogChangeNotifier.js) runs when the client disconnects
    // (navigates away, closes the tab) so polling doesn't leak per tab.
    SubscribeNewPosts(call) {
      const unwatch = blogChangeNotifier.watch((post) => {
        call.write({ slug: post.slug, title: post.title, publishedAt: post.publishedAt });
      }, { lastKnownSlug: call.request.lastKnownSlug });
      call.on('cancelled', unwatch);
    },
  };
}
