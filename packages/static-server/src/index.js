import { createServer } from 'node:http';
import path from 'node:path';
import sirv from 'sirv';

const PORT = process.env.STATIC_SERVER_PORT ?? '8081';
const DIR = path.resolve(import.meta.dirname, process.env.STATIC_DIR ?? '../../../dist-static');

// single: true falls back to index.html for any request that doesn't match
// a real file on disk -- so client-side routes (e.g. /some-page-slug) work,
// while real files like /widgets/table.js or /vendor/vue.esm-browser.prod.js
// are served directly and never fall through to index.html.
//
// maxAge: 0 (-> Cache-Control: max-age=0,must-revalidate) is deliberate,
// not an oversight -- without it sirv sends no Cache-Control header at
// all, and widget bundles (/widgets/login.js, /widgets/chat.js, etc.) have
// STABLE filenames, not content-hashed like the main app bundle
// (assets/index-[hash].js) -- they're referenced by fixed dynamic
// import('/widgets/login.js') paths, so there's no cache-busting URL to
// force a fresh fetch when the content changes. With no Cache-Control at
// all, browsers fall back to heuristic freshness (roughly 10% of the
// Last-Modified age) and can keep serving a stale bundle across page
// reloads for a real, non-trivial window -- confirmed the hard way: a
// deployed proto/client fix didn't take effect in a real browser across
// multiple reloads, entirely because of this. max-age=0 forces a
// conditional GET (If-None-Match) on every load instead -- etag: true
// below is what makes that a cheap 304 instead of a full re-download when
// content hasn't actually changed.
const serve = sirv(DIR, { single: true, etag: true, maxAge: 0 });

createServer((req, res) => serve(req, res)).listen(PORT, () => {
  console.log(`static server serving ${DIR} on http://127.0.0.1:${PORT}`);
});
