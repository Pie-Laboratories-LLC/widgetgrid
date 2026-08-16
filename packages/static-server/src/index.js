import { createServer } from 'node:http';
import path from 'node:path';
import sirv from 'sirv';

const PORT = process.env.STATIC_SERVER_PORT ?? '8081';
const DIR = path.resolve(import.meta.dirname, process.env.STATIC_DIR ?? '../../../dist-static');

// single: true falls back to index.html for any request that doesn't match
// a real file on disk -- so client-side routes (e.g. /some-page-slug) work,
// while real files like /widgets/table.js or /vendor/vue.esm-browser.prod.js
// are served directly and never fall through to index.html.
const serve = sirv(DIR, { single: true, etag: true });

createServer((req, res) => serve(req, res)).listen(PORT, () => {
  console.log(`static server serving ${DIR} on http://127.0.0.1:${PORT}`);
});
