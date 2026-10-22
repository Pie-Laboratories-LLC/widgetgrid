import path from 'node:path';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';

const PROTO_ROOT = path.resolve(import.meta.dirname, '../../../proto');
// imagePipeline.js's limit, plus room for the request's own framing.
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024 + 64 * 1024;
const MAX_MESSAGE_BYTES = 12 * 1024 * 1024;

// gRPC status -> what the browser gets.
const HTTP_STATUS = {
  [grpc.status.INVALID_ARGUMENT]: 400,
  [grpc.status.UNAUTHENTICATED]: 401,
  [grpc.status.PERMISSION_DENIED]: 403,
  [grpc.status.NOT_FOUND]: 404,
  [grpc.status.FAILED_PRECONDITION]: 409,
  [grpc.status.RESOURCE_EXHAUSTED]: 429,
  [grpc.status.UNAVAILABLE]: 503,
};

class TooLarge extends Error {}

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new TooLarge());
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}

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
//   POST /media/upload       -- an image from the board's composer or the
//                               blog editor (MediaService.UploadImage):
//                               too big for gRPC-Web's text encoding, so
//                               the browser sends the raw file here with
//                               its authorization header, which is passed
//                               along.
//   GET  /media/<path>       -- an uploaded image (MediaService.GetImage),
//                               served only while it may be shown.
//
// They live here because this server already answers every non-gRPC path
// (Envoy's catch-all route), and widgetgrid-server's mesh service is
// gRPC-only. grpcAddr is widgetgrid-server through this pod's Consul
// upstream (see infra/eks/manifests/static-server.yaml). Shaped as
// connect-style middleware so packages/web-app's Vite dev server can
// mount the same routes.
export function createEdgeRoutes({ grpcAddr }) {
  const definition = protoLoader.loadSync(
    [
      path.join(PROTO_ROOT, 'widgetgrid/v1/blog.proto'),
      path.join(PROTO_ROOT, 'widgetgrid/v1/subscription.proto'),
      path.join(PROTO_ROOT, 'widgetgrid/v1/media.proto'),
    ],
    { keepCase: false, defaults: true, includeDirs: [PROTO_ROOT] },
  );
  const { widgetgrid: { v1 } } = grpc.loadPackageDefinition(definition);
  const credentials = grpc.credentials.createInsecure();
  const blog = new v1.BlogService(grpcAddr, credentials);
  const subscriptions = new v1.SubscriptionService(grpcAddr, credentials);
  const media = new v1.MediaService(grpcAddr, credentials, {
    'grpc.max_send_message_length': MAX_MESSAGE_BYTES,
    'grpc.max_receive_message_length': MAX_MESSAGE_BYTES,
  });

  const unary = (client, method, request, metadata = new grpc.Metadata(), timeoutMs = 10_000) => new Promise((resolve, reject) => {
    client[method](request, metadata, { deadline: Date.now() + timeoutMs }, (err, res) => (err ? reject(err) : resolve(res)));
  });

  async function upload(req, res, url) {
    const metadata = new grpc.Metadata();
    if (req.headers.authorization) metadata.set('authorization', req.headers.authorization);
    let data;
    try {
      data = await readBody(req, MAX_UPLOAD_BYTES);
    } catch (err) {
      if (err instanceof TooLarge) {
        sendJson(res, 413, { message: 'Images can be up to 10 MB.' });
        return;
      }
      throw err;
    }
    try {
      // The scan can take a few seconds on a big image.
      const result = await unary(media, 'uploadImage', {
        data, purpose: url.searchParams.get('purpose') ?? '', draftId: url.searchParams.get('draft') ?? '',
      }, metadata, 60_000);
      sendJson(res, 200, { url: result.url, markdown: result.markdown, status: result.status });
    } catch (err) {
      const status = HTTP_STATUS[err.code];
      if (!status) throw err;
      sendJson(res, status, { message: err.details || err.message });
    }
  }

  async function serveImage(req, res, url) {
    const imagePath = url.pathname.slice('/media/'.length);
    try {
      const { data, contentType } = await unary(media, 'getImage', { path: imagePath });
      res.writeHead(200, {
        'Content-Type': contentType,
        // Short: hiding a post or refusing an image should stop it being
        // seen soon, not whenever a cache gets round to it. Drafts never.
        'Cache-Control': imagePath.startsWith('drafts/') ? 'no-store' : 'public, max-age=600',
        'X-Content-Type-Options': 'nosniff',
      });
      res.end(req.method === 'HEAD' ? undefined : data);
    } catch (err) {
      if (err.code !== grpc.status.NOT_FOUND) throw err;
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end('Not found.\n');
    }
  }

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
      if (url.pathname === '/media/upload' && req.method === 'POST') {
        await upload(req, res, url);
        return;
      }
      if (url.pathname.startsWith('/media/') && (req.method === 'GET' || req.method === 'HEAD')) {
        await serveImage(req, res, url);
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
