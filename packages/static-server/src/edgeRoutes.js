import path from 'node:path';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';

const PROTO_ROOT = path.resolve(import.meta.dirname, '../../../proto');

// The few plain-HTTP URLs that need widgetgrid-server but can't use
// gRPC-Web, because what calls them isn't the SPA:
//
//   GET  /rss.xml            -- feed readers (BlogService.GetFeed)
//   POST /email/unsubscribe  -- mail providers' RFC 8058 one-click
//                               unsubscribe (SubscriptionService.Unsubscribe)
//   GET  /email/unsubscribe  -- a person following that URL by hand:
//                               redirected to the page that asks first,
//                               since link scanners GET every URL in an
//                               email and must not unsubscribe anyone.
//
// They live here because this server already answers every non-gRPC path
// (Envoy's catch-all route), and widgetgrid-server's mesh service is
// gRPC-only. grpcAddr is widgetgrid-server through this pod's Consul
// upstream (see infra/eks/manifests/static-server.yaml). Shaped as
// connect-style middleware so packages/web-app's Vite dev server can
// mount the same routes.
export function createEdgeRoutes({ grpcAddr }) {
  const definition = protoLoader.loadSync(
    [path.join(PROTO_ROOT, 'widgetgrid/v1/blog.proto'), path.join(PROTO_ROOT, 'widgetgrid/v1/subscription.proto')],
    { keepCase: false, defaults: true, includeDirs: [PROTO_ROOT] },
  );
  const { widgetgrid: { v1 } } = grpc.loadPackageDefinition(definition);
  const credentials = grpc.credentials.createInsecure();
  const blog = new v1.BlogService(grpcAddr, credentials);
  const subscriptions = new v1.SubscriptionService(grpcAddr, credentials);

  const unary = (client, method, request) => new Promise((resolve, reject) => {
    client[method](request, { deadline: Date.now() + 10_000 }, (err, res) => (err ? reject(err) : resolve(res)));
  });

  return async function edgeRoutes(req, res, next) {
    const url = new URL(req.url, 'http://localhost');
    try {
      if (url.pathname === '/rss.xml' && (req.method === 'GET' || req.method === 'HEAD')) {
        const { rssXml } = await unary(blog, 'getFeed', {});
        res.writeHead(200, {
          'Content-Type': 'application/rss+xml; charset=utf-8',
          'Cache-Control': 'public, max-age=300',
        });
        res.end(req.method === 'HEAD' ? undefined : rssXml);
        return;
      }
      if (url.pathname === '/email/unsubscribe') {
        const token = url.searchParams.get('token') ?? '';
        if (req.method === 'POST') {
          await unary(subscriptions, 'unsubscribe', { token });
          res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end("You're unsubscribed.\n");
          return;
        }
        if (req.method === 'GET') {
          res.writeHead(302, { Location: `/site/subscribe?unsubscribe=${encodeURIComponent(token)}` });
          res.end();
          return;
        }
      }
    } catch (err) {
      console.error(`[edgeRoutes] ${req.method} ${url.pathname} failed:`, err.message);
      res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Temporarily unavailable.\n');
      return;
    }
    next();
  };
}
