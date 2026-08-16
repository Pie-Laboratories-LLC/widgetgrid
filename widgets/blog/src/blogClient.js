// Its own gRPC-Web client, not a shared import from packages/web-app: this
// widget fetches its content directly (unlike richtext/table, whose content
// comes from the generic WidgetContent pass-2 batch fetch), and widgets are
// independently built/deployed -- they can't reach into the host app's own
// source. Mirrors packages/web-app/src/grpc/client.js's setup.
import { ListBlogPostsRequest } from '@widgetgrid/proto-gen-web/widgetgrid/v1/blog_pb.js';
import { BlogServicePromiseClient } from '@widgetgrid/proto-gen-web/widgetgrid/v1/blog_grpc_web_pb.js';

// Same-origin by default, correct in production (Envoy is the single
// public origin for both this bundle and the backend). The
// VITE_GRPC_WEB_ORIGIN override needed for local-k8s/ testing comes from
// the repo root .env.local -- see vite-widget-lib's envDir setting, which
// points every widget's build at the same root .env.local packages/web-app
// already documents using.
const GRPC_WEB_ORIGIN = import.meta.env.VITE_GRPC_WEB_ORIGIN ?? '';
const client = new BlogServicePromiseClient(GRPC_WEB_ORIGIN);

export const blogClient = {
  async listBlogPosts() {
    const response = await client.listBlogPosts(new ListBlogPostsRequest(), {});
    // .toObject() suffixes repeated fields with "List" -- see
    // packages/web-app/src/grpc/normalize.js for the fuller explanation.
    return { posts: response.toObject().postsList };
  },
};
