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

// Fixed, not exponential-backoff -- same reasoning as
// chatSubscriptionClient.js's identical constant.
const RECONNECT_DELAY_MS = 2000;

// Returns an unsubscribe function. onNewPost receives a plain
// { slug, title, publishedAt } object per event.
//
// Used to have no 'error'/reconnect handling at all -- the reasoning was
// "a dropped subscription just means the badge stops updating until the
// page reloads, not worth a reconnect/backoff loop for this feature", with
// the known failure mode assumed to be local-k8s's two Consul-injected mesh
// hops (browser -> envoy-gateway's sidecar -> widgetgrid-server's sidecar)
// cutting any long-lived stream at Envoy's built-in 15s route timeout (see
// local-k8s/manifests/service-defaults.yaml/service-router.yaml, which fix
// that). Confirmed against the real deployed environment that this isn't
// mesh-timeout-only: WidgetgridDevGatewayStack's ALB has a 60s idle
// timeout (AWS default, unmodified), and this stream carries no traffic at
// all between posts -- past that idle window the ALB silently closes the
// connection, and "reload to see it" is a worse tradeoff in production
// than a small reconnect loop.
//
// Separately, still relevant: grpc-web's client codegen mode matters just
// as much as any of the above for anything server-streaming -- see
// proto/scripts/gen-web.mjs's comment on why it's mode=grpcwebtext, not
// mode=grpcweb (binary/arraybuffer XHR responses never deliver
// incrementally in a browser, no matter how long the connection stays open).
export function subscribeNewPosts(onNewPost) {
  let cancelled = false;
  let stream = null;
  let reconnectTimer = null;
  // Shared across reconnects within this subscription's lifetime, not
  // reset per-connect -- this is what lets the server (see
  // blogChangeNotifier.js's watch()) notice a post published during a
  // disconnected gap and report it immediately on reconnect, instead of
  // silently folding it into a fresh baseline the way a truly-unseeded
  // reconnect would. Empty string on this subscription's genuine first
  // connect is the correct "I don't know of anything yet" signal.
  let lastKnownSlug = '';

  function scheduleReconnect() {
    // Guards against grpc-web firing both 'error' and 'end' for the same
    // disconnect and scheduling two reconnects -- same reasoning as
    // chatSubscriptionClient.js's identical guard.
    if (cancelled || reconnectTimer) return;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      connect();
    }, RECONNECT_DELAY_MS);
  }

  function connect() {
    const request = new SubscribeNewPostsRequest();
    request.setLastKnownSlug(lastKnownSlug);
    // Never read server-side -- see auth.proto's identical field on
    // RequestLoginCodeRequest for why (a request with only an empty
    // last_known_slug would otherwise serialize to zero bytes on this
    // subscription's first-ever connect).
    request.setRequestedAtMs(Date.now());
    stream = client.subscribeNewPosts(request, {});
    stream.on('data', (event) => {
      const post = event.toObject();
      lastKnownSlug = post.slug;
      onNewPost(post);
    });
    stream.on('error', scheduleReconnect);
    stream.on('end', scheduleReconnect);
  }

  connect();
  return () => {
    cancelled = true;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    stream.cancel();
  };
}
