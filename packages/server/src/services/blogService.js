import grpc from '@grpc/grpc-js';

export function createBlogService({ blogSource }) {
  return {
    async ListBlogPosts(call, callback) {
      try {
        const posts = await blogSource.listPosts();
        callback(null, { posts });
      } catch (err) {
        callback({ code: grpc.status.INTERNAL, message: err.message });
      }
    },
  };
}
