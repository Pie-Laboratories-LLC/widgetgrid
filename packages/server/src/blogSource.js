// createLocalBlogSource is the local-filesystem stand-in; createS3BlogSource
// (below) is what production/EKS uses (see index.js's BLOG_S3_BUCKET
// switch). Same interface either way -- listPosts() -- so blogService.js
// never knows or cares which one it's holding, only parsePost's shared
// parsing logic runs either way.
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { Marked } from 'marked';
import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';

const marked = new Marked();

// YYYY-MM-DD-HH-mm-slug.md -- the date+time prefix is what "newest to
// oldest" sorts on, and (reformatted to real ISO 8601) doubles as
// publishedAt; no frontmatter parsing needed. Time-of-day exists alongside
// the date so two posts published the same day still sort deterministically
// instead of tying on date alone.
const FILENAME_PATTERN = /^(\d{4}-\d{2}-\d{2}-\d{2}-\d{2})-(.+)\.md$/;

// scheme://... or protocol-relative //... or root-relative /... -- anything
// already resolvable as-is, left untouched by rewriteImageHref.
const ABSOLUTE_HREF_PATTERN = /^([a-z][a-z0-9+.-]*:)?\/\//i;

export function createLocalBlogSource({ dir, assetsBaseUrl = '/blog-assets' }) {
  return {
    async listPosts() {
      const entries = await readdir(dir, { withFileTypes: true }).catch((err) => {
        if (err.code === 'ENOENT') return [];
        throw err;
      });

      const files = entries
        .filter((entry) => entry.isFile())
        .map((entry) => ({ name: entry.name, match: FILENAME_PATTERN.exec(entry.name) }))
        .filter((f) => f.match)
        .sort((a, b) => b.match[1].localeCompare(a.match[1])); // date+time desc

      const posts = [];
      for (const { name, match } of files) {
        const [, rawDateTime, slug] = match;
        const publishedAt = toIsoDateTime(rawDateTime);
        const raw = await readFile(path.join(dir, name), 'utf8');
        // Each post's images live in their own subdirectory (locally) / key
        // prefix (S3), named to match the post file itself -- so an
        // image-heavy post doesn't spill files into a shared flat
        // directory, and a post can just say ![x](./diagram.png) without
        // knowing or caring where it's actually hosted.
        const postDir = name.slice(0, -'.md'.length);
        posts.push(parsePost({ raw, slug, publishedAt, assetsBaseUrl, postDir }));
      }
      return posts;
    },
  };
}

// Bucket layout mirrors content/blog/'s own convention exactly: .md files
// sit at the bucket root, each post's images live under a key prefix
// matching its own filename (minus .md) -- e.g.
// "2026-08-16-13-00-humble-beginnings.md" alongside
// "2026-08-16-13-00-humble-beginnings/humble-beginnings.png". That's not
// just a style choice carried over from the local version -- the bucket
// policy (see infra/cdk/lib/eks-stack.js's BlogBucket) relies on it
// structurally: it grants public s3:GetObject only to keys containing a
// "/" (i.e. anything under a postDir prefix -- the images), while root-level
// .md keys stay readable only by widgetgrid-server's own IAM permissions.
// assetsBaseUrl needs to point at wherever those objects are actually
// publicly reachable (the bucket's own public URL, see
// infra/eks/manifests/widgetgrid-server.yaml's BLOG_ASSETS_BASE_URL) --
// this source only rewrites hrefs to be relative to that base, it doesn't
// serve the bytes itself.
export function createS3BlogSource({ bucket, assetsBaseUrl = '/blog-assets' }) {
  const client = new S3Client({});
  return {
    async listPosts() {
      // Delimiter: '/' is what makes this listing return only root-level
      // keys (the .md files) in Contents -- image keys under a postDir/
      // prefix get folded into CommonPrefixes instead, which this ignores
      // (each post's own markdown already knows which images it needs by
      // relative path; there's no reason to enumerate them separately).
      const { Contents = [] } = await client.send(
        new ListObjectsV2Command({ Bucket: bucket, Delimiter: '/' }),
      );

      const files = Contents
        .map((obj) => ({ key: obj.Key, match: FILENAME_PATTERN.exec(obj.Key) }))
        .filter((f) => f.match)
        .sort((a, b) => b.match[1].localeCompare(a.match[1])); // date+time desc

      const posts = [];
      for (const { key, match } of files) {
        const [, rawDateTime, slug] = match;
        const publishedAt = toIsoDateTime(rawDateTime);
        const object = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
        const raw = await object.Body.transformToString('utf8');
        const postDir = key.slice(0, -'.md'.length);
        posts.push(parsePost({ raw, slug, publishedAt, assetsBaseUrl, postDir }));
      }
      return posts;
    },
  };
}

// A post is "# SYNOPSIS" (a short summary section), then a "# <title>"
// heading, then the rest of the post. The title heading is content, not
// structure like SYNOPSIS -- its text is the post's title (used for both
// the synopsis view and the full view, so they never show two different
// titles), and the full-content render starts after it: neither the
// SYNOPSIS section nor the title heading itself appear in the body twice.
function parsePost({ raw, slug, publishedAt, assetsBaseUrl, postDir }) {
  const tokens = marked.lexer(raw);
  marked.walkTokens(tokens, (token) => {
    rewriteImageHref(token, assetsBaseUrl, postDir);
    rewriteCrossPostLink(token);
  });
  const synopsisIndex = findHeadingIndex(tokens, 0, (text) => text.toUpperCase() === 'SYNOPSIS');
  const titleIndex = synopsisIndex === -1 ? -1 : findHeadingIndex(tokens, synopsisIndex + 1);

  return {
    slug,
    title: titleIndex === -1 ? humanizeSlug(slug) : tokens[titleIndex].text.trim(),
    publishedAt,
    synopsisHtml: marked.parser(sliceSection(tokens, synopsisIndex)),
    // Every post's full content is sent, not just the newest: which post is
    // "open" is a client-side toggle now (BlogWidget.vue), not something
    // fixed at fetch time, so any of them may need to render in full
    // without a round-trip. Trivial bandwidth cost at demo scale.
    contentHtml: titleIndex === -1 ? '' : marked.parser(tokens.slice(titleIndex + 1)),
  };
}

function rewriteImageHref(token, assetsBaseUrl, postDir) {
  if (token.type !== 'image' || ABSOLUTE_HREF_PATTERN.test(token.href)) return;
  token.href = `${assetsBaseUrl}/${postDir}/${token.href.replace(/^\.\//, '')}`;
}

// [see also](./2026-08-01-00-00-welcome-to-the-lab.md) -> #post-welcome-to-the-lab
// -- there's no per-post page/route to link to yet (BlogWidget.vue renders
// every post into one scrolling feed), so this only reaches a post that
// happens to also be rendered in the current feed, by matching the id
// BlogWidget.vue gives each <article> (post-<slug>). A link to a post
// that's fallen out of the feed just won't scroll anywhere -- acceptable
// for now, revisit if/when real per-post routing exists.
function rewriteCrossPostLink(token) {
  if (token.type !== 'link' || ABSOLUTE_HREF_PATTERN.test(token.href)) return;
  const match = FILENAME_PATTERN.exec(token.href.replace(/^\.\//, ''));
  if (!match) return;
  const [, , referencedSlug] = match;
  token.href = `#post-${referencedSlug}`;
}

// "2026-08-16-14-30" -> "2026-08-16T14:30" -- the hyphen-delimited filename
// format reformatted as real ISO 8601, so publishedAt is directly usable by
// `new Date()` and as an HTML <time datetime> value on the client.
function toIsoDateTime(rawDateTime) {
  const [year, month, day, hour, minute] = rawDateTime.split('-');
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

function humanizeSlug(slug) {
  return slug.split('-').map((word) => word[0].toUpperCase() + word.slice(1)).join(' ');
}

// First level-1 heading at or after fromIndex matching `test` (defaults to
// "any heading" -- used to find the title heading, whatever it says), or
// -1 if none exists.
function findHeadingIndex(tokens, fromIndex, test = () => true) {
  for (let i = fromIndex; i < tokens.length; i++) {
    if (tokens[i].type === 'heading' && tokens[i].depth === 1 && test(tokens[i].text.trim())) return i;
  }
  return -1;
}

// Tokens between the heading at startIndex and the next heading of any
// level, or [] if startIndex is -1 (no such section).
function sliceSection(tokens, startIndex) {
  if (startIndex === -1) return [];
  const section = [];
  for (let i = startIndex + 1; i < tokens.length; i++) {
    if (tokens[i].type === 'heading') break;
    section.push(tokens[i]);
  }
  return section;
}
