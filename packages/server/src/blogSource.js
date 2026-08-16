// Local-filesystem stand-in for the real content source. In production this
// reads an S3 bucket instead (same interface -- listPosts() -- so the
// service/caller code doesn't change; only which createXBlogSource() gets
// wired up in index.js would). Not built yet: there's no way to test an S3
// client against real AWS credentials from here, so this only implements
// the local half for now.
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { Marked } from 'marked';

const marked = new Marked();

// YYYY-MM-DD-slug.md -- the date prefix is what "newest to oldest" sorts
// on, and doubles as publishedAt; no frontmatter parsing needed.
const FILENAME_PATTERN = /^(\d{4}-\d{2}-\d{2})-(.+)\.md$/;

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
        .sort((a, b) => b.match[1].localeCompare(a.match[1])); // date desc

      const posts = [];
      for (const { name, match } of files) {
        const [, publishedAt, slug] = match;
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

// [see also](./2026-08-01-welcome-to-the-lab.md) -> #post-welcome-to-the-lab
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
