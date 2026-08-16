// Its own small gRPC-Web client, same reasoning as
// widgets/blog/src/blogClient.js: this widget is independently built/
// deployed and can't reach into packages/web-app's own client setup.
// Only wraps the one streaming call this widget actually needs -- the
// unary ListBlogPosts call belongs to widgets/blog, not here.
import { SubscribeNewPostsRequest } from '@widgetgrid/proto-gen-web/widgetgrid/v1/blog_pb.js';
import { BlogServicePromiseClient } from '@widgetgrid/proto-gen-web/widgetgrid/v1/blog_grpc_web_pb.js';

// Same-origin by default; VITE_GRPC_WEB_ORIGIN override for local-k8s/
// testing -- see widgets/blog/src/blogClient.js's comment, same mechanism.
const GRPC_WEB_ORIGIN = import.meta.env.VITE_GRPC_WEB_ORIGIN ?? '';
const client = new BlogServicePromiseClient(GRPC_WEB_ORIGIN);

// Returns an unsubscribe function. onNewPost receives a plain
// { slug, title, publishedAt } object per event.
export function subscribeNewPosts(onNewPost) {
  const stream = client.subscribeNewPosts(new SubscribeNewPostsRequest(), {});
  stream.on('data', (event) => onNewPost(event.toObject()));
  // Deliberately no 'error' handling beyond letting the stream end -- a
  // dropped subscription just means the badge stops updating until the
  // page reloads, not worth a reconnect/backoff loop for this feature.
  // local-k8s/'s two Consul-injected mesh hops (browser -> envoy-gateway's
  // sidecar -> widgetgrid-server's sidecar) both used to cut any long-lived
  // stream at Envoy's built-in 15s route timeout, with no explicit
  // "timeout" key set on either hop's route -- see local-k8s/manifests/
  // service-defaults.yaml and service-router.yaml, which fix the two
  // halves of that respectively. Also worth knowing if this ever seems
  // broken again after editing either of those two files on an
  // already-running cluster: both routes turned out to be baked into their
  // sidecar's *static* bootstrap config, not pushed live via xDS, so a
  // Consul-side change needs `kubectl rollout restart` on the relevant
  // deployment(s) before it actually takes effect (a fresh
  // local-k8s/setup.sh run doesn't hit this, since that's a create, not an
  // update).
  //
  // Separately: grpc-web's client codegen mode matters just as much as the
  // above for anything server-streaming -- see proto/scripts/gen-web.mjs's
  // comment on why it's mode=grpcwebtext, not mode=grpcweb (binary/
  // arraybuffer XHR responses never deliver incrementally in a browser, no
  // matter how long the mesh lets the stream stay open).
  return () => stream.cancel();
}
