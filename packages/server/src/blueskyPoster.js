import * as defaultRepo from '@widgetgrid/db/src/blueskyPostsRepo.js';
import { htmlToText } from './subscriptionEmails.js';

// Announces a blog post on the site's Bluesky account -- when the owner
// says so (AuthorService.PostToBluesky), once per post, never
// automatically. The post is the owner's text (links and #tags in it made
// clickable) with a link card for the blog post: its title, synopsis, and
// first image.
//
// Signs in with an app password (Bluesky settings -> Privacy and security
// -> App passwords), not OAuth: it's always the one account, the site's
// own. Without one (local dev), createConsoleBlueskyPoster() logs the post
// instead of sending it.
//
// "Once" is the database's, as in postMailer.js: the post is claimed
// first, and the claim released if Bluesky refuses it.

export const MAX_GRAPHEMES = 300; // Bluesky's limit on a post's text
const MAX_DESCRIPTION = 300;
const MAX_THUMB_BYTES = 1_000_000; // Bluesky's limit on a card image

export class AlreadyPosted extends Error {}

const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
export const graphemes = (text) => [...segmenter.segment(text)].length;

function clip(text, max) {
  const parts = [...segmenter.segment(text)].map((s) => s.segment);
  if (parts.length <= max) return text;
  return `${parts.slice(0, max - 1).join('').trimEnd()}…`;
}

// What the owner is offered to post: the synopsis as plain text, cut to fit.
export function suggestedText(post) {
  return clip(htmlToText(post.synopsisHtml ?? '').replace(/\n+/g, ' '), MAX_GRAPHEMES);
}

// Links and hashtags in the text, as Bluesky facets -- without them they
// show as plain text. Offsets are UTF-8 bytes.
export function facetsFor(text) {
  const encoder = new TextEncoder();
  const byteAt = (i) => encoder.encode(text.slice(0, i)).length;
  const facets = [];
  for (const m of text.matchAll(/https?:\/\/[^\s]+[^\s.,;:!?)"']/g)) {
    facets.push({
      index: { byteStart: byteAt(m.index), byteEnd: byteAt(m.index + m[0].length) },
      features: [{ $type: 'app.bsky.richtext.facet#link', uri: m[0] }],
    });
  }
  for (const m of text.matchAll(/(^|\s)#([\p{L}\p{N}_]*\p{L}[\p{L}\p{N}_]*)/gu)) {
    const start = m.index + m[1].length;
    facets.push({
      index: { byteStart: byteAt(start), byteEnd: byteAt(start + 1 + m[2].length) },
      features: [{ $type: 'app.bsky.richtext.facet#tag', tag: m[2] }],
    });
  }
  return facets;
}

// at://did:plc:x/app.bsky.feed.post/3abc -> its page on bsky.app.
export function postWebUrl(uri, handle) {
  const rkey = uri.split('/').pop();
  return `https://bsky.app/profile/${handle}/post/${rkey}`;
}

function checkText(text) {
  const t = String(text ?? '').trim();
  if (!t) throw new RangeError('Write something to post.');
  if (graphemes(t) > MAX_GRAPHEMES) throw new RangeError(`Bluesky posts can be up to ${MAX_GRAPHEMES} characters.`);
  return t;
}

export function createBlueskyPoster({
  pool, handle, appPassword, siteOrigin, service = 'https://bsky.social', repo = defaultRepo, fetch = globalThis.fetch,
}) {
  async function xrpc(path, { token, body, contentType = 'application/json' } = {}) {
    const response = await fetch(`${service}/xrpc/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': contentType, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: contentType === 'application/json' ? JSON.stringify(body) : body,
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(`Bluesky ${path}: ${response.status} ${result.error ?? ''} ${result.message ?? ''}`.trim());
    return result;
  }

  // The post's first image, uploaded for the card -- or nothing, if it has
  // none or it won't do. A card without a picture is still a card.
  async function thumbnail(post, token) {
    const src = /<img[^>]+src="([^"]+)"/.exec(`${post.synopsisHtml ?? ''}${post.contentHtml ?? ''}`)?.[1];
    if (!src) return undefined;
    try {
      const response = await fetch(new URL(src, siteOrigin));
      const type = response.headers.get('content-type') ?? '';
      if (!response.ok || !type.startsWith('image/')) return undefined;
      const bytes = Buffer.from(await response.arrayBuffer());
      if (bytes.length > MAX_THUMB_BYTES) return undefined;
      return (await xrpc('com.atproto.repo.uploadBlob', { token, body: bytes, contentType: type })).blob;
    } catch (err) {
      console.error(`[blueskyPoster] no card image for "${post.slug}":`, err.message);
      return undefined;
    }
  }

  return {
    handle,
    listPosted: () => repo.listPosted(pool),
    // post: as blogSource.listPosts() returns it. Resolves to the new
    // Bluesky post's at:// uri.
    async send(post, text) {
      const body = checkText(text);
      if (!(await repo.claim(pool, post.slug))) throw new AlreadyPosted(`"${post.slug}" was already posted to Bluesky.`);
      try {
        const session = await xrpc('com.atproto.server.createSession', { body: { identifier: handle, password: appPassword } });
        const thumb = await thumbnail(post, session.accessJwt);
        const record = {
          $type: 'app.bsky.feed.post',
          text: body,
          createdAt: new Date().toISOString(),
          langs: ['en'],
          embed: {
            $type: 'app.bsky.embed.external',
            external: {
              uri: `${siteOrigin}/blog/${post.slug}`,
              title: post.title,
              description: clip(htmlToText(post.synopsisHtml ?? '').replace(/\n+/g, ' '), MAX_DESCRIPTION),
              ...(thumb ? { thumb } : {}),
            },
          },
        };
        const facets = facetsFor(body);
        if (facets.length) record.facets = facets;
        const { uri } = await xrpc('com.atproto.repo.createRecord', {
          token: session.accessJwt,
          body: { repo: session.did, collection: 'app.bsky.feed.post', record },
        });
        await repo.setUri(pool, post.slug, uri);
        console.log(`[blueskyPoster] "${post.slug}" posted: ${uri}`);
        return uri;
      } catch (err) {
        await repo.release(pool, post.slug).catch(() => {});
        throw err;
      }
    },
  };
}

// Local dev: shows what would be posted. Nothing is recorded, so the real
// thing can still be done later from wherever Bluesky is set up.
export function createConsoleBlueskyPoster({ handle = 'pielabs.bsky.social', siteOrigin }) {
  return {
    handle,
    listPosted: async () => new Map(),
    async send(post, text) {
      const body = checkText(text);
      console.log(`[blueskyPoster] would post as ${handle}:\n${body}\n[card] ${post.title} -- ${siteOrigin}/blog/${post.slug}`);
      return '';
    },
  };
}
