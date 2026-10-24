import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  AlreadyPosted, createBlueskyPoster, facetsFor, graphemes, postWebUrl, suggestedText,
} from './blueskyPoster.js';

const POST = {
  slug: 'rak-season', title: 'Rak Season',
  synopsisHtml: '<p>The raks are <em>back</em> &amp; grazing.</p><p><img src="/blog-assets/x/rak.webp"></p>',
  contentHtml: '',
};

function setup({ fail = '' } = {}) {
  const claimed = new Map();
  const calls = [];
  const fetch = async (url, init = {}) => {
    const u = String(url);
    calls.push({ url: u, init });
    const json = (status, body) => ({ ok: status < 300, status, json: async () => body });
    if (u.endsWith('/blog-assets/x/rak.webp')) {
      return { ok: true, headers: new Headers({ 'content-type': 'image/webp' }), arrayBuffer: async () => new ArrayBuffer(10) };
    }
    if (u.endsWith('createSession')) return json(200, { accessJwt: 'jwt', did: 'did:plc:me' });
    if (u.endsWith('uploadBlob')) return json(200, { blob: { $type: 'blob', ref: { $link: 'b' }, mimeType: 'image/webp', size: 10 } });
    if (u.endsWith('createRecord')) {
      return fail ? json(400, { error: 'InvalidRequest', message: fail }) : json(200, { uri: 'at://did:plc:me/app.bsky.feed.post/3k' });
    }
    throw new Error(`unexpected ${u}`);
  };
  const repo = {
    claim: async (_p, slug) => (claimed.has(slug) ? false : (claimed.set(slug, null), true)),
    setUri: async (_p, slug, uri) => { claimed.set(slug, uri); },
    release: async (_p, slug) => { if (claimed.get(slug) === null) claimed.delete(slug); },
    listPosted: async () => new Map(),
  };
  const poster = createBlueskyPoster({
    pool: {}, handle: 'pielabs.bsky.social', appPassword: 'app-pw', siteOrigin: 'https://pie-laboratories.com', repo, fetch,
  });
  return { poster, calls, claimed };
}

test('posts the text with a link card, its picture the post\'s first image', async () => {
  const { poster, calls, claimed } = setup();
  const uri = await poster.send(POST, 'Rak season is here #gamedev');
  assert.equal(uri, 'at://did:plc:me/app.bsky.feed.post/3k');
  assert.equal(claimed.get('rak-season'), uri);
  assert.deepEqual(JSON.parse(calls[0].init.body), { identifier: 'pielabs.bsky.social', password: 'app-pw' });
  assert.equal(calls[1].url, 'https://pie-laboratories.com/blog-assets/x/rak.webp');
  const { repo, record } = JSON.parse(calls.at(-1).init.body);
  assert.equal(repo, 'did:plc:me');
  assert.equal(calls.at(-1).init.headers.Authorization, 'Bearer jwt');
  assert.equal(record.text, 'Rak season is here #gamedev');
  assert.equal(record.embed.external.uri, 'https://pie-laboratories.com/blog/rak-season');
  assert.equal(record.embed.external.title, 'Rak Season');
  assert.equal(record.embed.external.description, 'The raks are back & grazing.');
  assert.equal(record.embed.external.thumb.ref.$link, 'b');
  assert.equal(record.facets[0].features[0].tag, 'gamedev');
});

test('once per post; a refused post can be tried again', async () => {
  const failing = setup({ fail: 'nope' });
  await assert.rejects(failing.poster.send(POST, 'hi'), /Bluesky com.atproto.repo.createRecord: 400/);
  assert.equal(failing.claimed.size, 0);

  const { poster } = setup();
  await poster.send(POST, 'hi');
  await assert.rejects(poster.send(POST, 'hi'), AlreadyPosted);
});

test('empty or over-long text is refused before anything is sent', async () => {
  const { poster, calls } = setup();
  await assert.rejects(poster.send(POST, '  '), RangeError);
  await assert.rejects(poster.send(POST, 'x'.repeat(301)), RangeError);
  assert.equal(calls.length, 0);
});

test('facets: links and tags, at UTF-8 byte offsets', () => {
  const text = 'Été 🐐 https://pie-laboratories.com/blog/x. #raks';
  const [link, tag] = facetsFor(text);
  const bytes = new TextEncoder().encode(text);
  const slice = ({ byteStart, byteEnd }) => new TextDecoder().decode(bytes.slice(byteStart, byteEnd));
  assert.equal(slice(link.index), 'https://pie-laboratories.com/blog/x');
  assert.equal(slice(tag.index), '#raks');
  assert.equal(facetsFor('issue #1 and a#b').length, 0);
});

test('suggested text is the synopsis, cut to 300 characters as Bluesky counts them', () => {
  assert.equal(suggestedText(POST), 'The raks are back & grazing.');
  const long = suggestedText({ synopsisHtml: `<p>${'🐐'.repeat(400)}</p>` });
  assert.equal(graphemes(long), 300);
  assert.ok(long.endsWith('…'));
});

test('postWebUrl', () => {
  assert.equal(postWebUrl('at://did:plc:me/app.bsky.feed.post/3k', 'pielabs.bsky.social'), 'https://bsky.app/profile/pielabs.bsky.social/post/3k');
});
