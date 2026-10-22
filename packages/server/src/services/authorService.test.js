import { test } from 'node:test';
import assert from 'node:assert/strict';
import grpc from '@grpc/grpc-js';
import { createAuthorService, slugFromTitle } from './authorService.js';
import { AlreadySent } from '../postMailer.js';
import { buildPostFile } from '../blogSource.js';

const OWNER = { userId: 'o', role: 'owner', groups: [] };

function setup({ caller = OWNER, posts = [] } = {}) {
  const files = new Map(posts.map((p) => [p.fileName, p.raw]));
  const assets = new Map();
  const media = new Map();
  const drafts = new Map();
  const mailed = [];
  let nextId = 1;
  const service = createAuthorService({
    pool: {},
    timeZone: 'America/Denver',
    now: () => new Date('2026-10-22T18:05:00Z'),
    authContext: { getCaller: async () => caller },
    blogSource: {
      listPosts: async () => [...files.keys()].map((fileName) => ({
        fileName, slug: fileName.slice(17, -3).toLowerCase(), title: 't',
        publishedAt: `${fileName.slice(0, 10)}T${fileName.slice(11, 13)}:${fileName.slice(14, 16)}`,
      })),
      readPost: async (f) => files.get(f) ?? null,
      writePost: async (f, raw) => { files.set(f, raw); },
      writeAsset: async (dir, name, bytes) => { assets.set(`${dir}/${name}`, bytes); },
      assetUrl: (dir, name) => `/blog-assets/${dir}/${name}`,
    },
    mediaStore: {
      get: async (k) => media.get(k) ?? null,
      remove: async (k) => { media.delete(k); },
    },
    postMailer: {
      send: async (post) => {
        if (mailed.includes(post.slug)) throw new AlreadySent();
        mailed.push(post.slug);
        return 3;
      },
    },
    draftsRepo: {
      list: async () => [...drafts.values()],
      get: async (_p, id) => drafts.get(String(id)) ?? null,
      findByFileName: async (_p, f) => [...drafts.values()].find((d) => d.file_name === f) ?? null,
      create: async (_p, d) => {
        const row = {
          id: String(nextId++), file_name: d.fileName ?? null, title: d.title ?? '', synopsis: d.synopsis ?? '',
          body: d.body ?? '', slug: '', images: [], updated_at: new Date(),
        };
        drafts.set(row.id, row);
        return row;
      },
      update: async (_p, d) => Object.assign(drafts.get(d.id), d),
      remove: async (_p, id) => { drafts.delete(id); },
    },
    mailingsRepo: { listSent: async () => new Map(mailed.map((s) => [s, new Date()])) },
  });
  const call = (method, request = {}) => new Promise((resolve) => {
    service[method]({ request, metadata: { get: () => [] } }, (err, res) => resolve({ err, res }));
  });
  return { call, files, assets, media, drafts, mailed };
}

test('only the owner writes', async () => {
  const { call } = setup({ caller: { userId: 'm', role: 'member', groups: [] } });
  assert.equal((await call('ListAuthoring')).err.code, grpc.status.PERMISSION_DENIED);
  assert.equal((await setup({ caller: null }).call('CreateDraft')).err.code, grpc.status.UNAUTHENTICATED);
});

test('a new draft publishes as a dated file with its images beside it', async () => {
  const { call, files, assets, media, drafts } = setup();
  const { res: { draft } } = await call('CreateDraft');
  drafts.get(draft.id).images.push('abc.webp');
  media.set(`drafts/${draft.id}/abc.webp`, Buffer.from('img'));
  await call('SaveDraft', { id: draft.id, title: 'Rak Season!', synopsis: 'S', body: '![](./abc.webp)', slug: 'Rak Season' });
  const { err, res } = await call('Publish', { draftId: draft.id });
  assert.equal(err, null);
  assert.equal(res.slug, 'rak-season');
  assert.ok(files.has('2026-10-22-12-05-rak-season.md'));
  assert.match(files.get('2026-10-22-12-05-rak-season.md'), /^# SYNOPSIS\n\nS\n\n# Rak Season!\n/);
  assert.ok(assets.has('2026-10-22-12-05-rak-season/abc.webp'));
  assert.equal(drafts.size, 0);
  assert.equal(media.size, 0);
});

test('publishing needs a title and a free address', async () => {
  const { call } = setup({ posts: [{ fileName: '2026-01-01-00-00-taken.md', raw: 'x' }] });
  const { res: { draft } } = await call('CreateDraft');
  assert.match((await call('Publish', { draftId: draft.id })).err.message, /title/);
  await call('SaveDraft', { id: draft.id, title: 'Taken', slug: 'taken' });
  assert.match((await call('Publish', { draftId: draft.id })).err.message, /synopsis/);
  await call('SaveDraft', { id: draft.id, title: 'Taken', synopsis: 'S', slug: 'taken' });
  assert.match((await call('Publish', { draftId: draft.id })).err.message, /already a post at \/blog\/taken/);
});

test('editing a published post keeps its file -- the address never changes', async () => {
  const fileName = '2026-09-01-10-00-old-post.md';
  const { call, files } = setup({ posts: [{ fileName, raw: buildPostFile({ title: 'Old', synopsis: 'S', body: 'B' }) }] });
  const { res: { draft } } = await call('CreateDraft', { fileName });
  assert.equal(draft.title, 'Old');
  assert.equal(draft.publishedSlug, 'old-post');
  // Opening it again reuses the same draft.
  assert.equal((await call('CreateDraft', { fileName })).res.draft.id, draft.id);
  await call('SaveDraft', { id: draft.id, title: 'New title', synopsis: 'S', body: 'B2', slug: 'ignored' });
  assert.equal((await call('Publish', { draftId: draft.id })).res.slug, 'old-post');
  assert.deepEqual([...files.keys()], [fileName]);
  assert.match(files.get(fileName), /# New title\n\nB2/);
});

test('the preview finds the draft\'s own images and the post\'s existing ones', async () => {
  const fileName = '2026-09-01-10-00-old-post.md';
  const { call, drafts } = setup({ posts: [{ fileName, raw: buildPostFile({ title: 'Old', synopsis: 'S', body: 'B' }) }] });
  const { res: { draft } } = await call('CreateDraft', { fileName });
  drafts.get(draft.id).images.push('new.webp');
  const { res } = await call('Preview', { draftId: draft.id, title: 'Old', synopsis: 'S', body: '![](./new.webp) ![](./old.png)' });
  assert.match(res.contentHtml, new RegExp(`/media/drafts/${draft.id}/new\\.webp`));
  assert.match(res.contentHtml, /\/blog-assets\/2026-09-01-10-00-old-post\/old\.png/);
});

test('subscribers are emailed on request, once', async () => {
  const { call } = setup({ posts: [{ fileName: '2026-10-23-10-00-hello.md', raw: 'x' }] });
  assert.equal((await call('ListAuthoring')).res.posts[0].canEmail, true);
  assert.equal((await call('EmailSubscribers', { slug: 'hello' })).res.sentTo, 3);
  assert.equal((await call('EmailSubscribers', { slug: 'hello' })).err.code, grpc.status.FAILED_PRECONDITION);
  const [listed] = (await call('ListAuthoring')).res.posts;
  assert.notEqual(listed.emailedAt, '');
  assert.equal(listed.canEmail, false);
});

test('posts from before emailing existed are never offered or sent', async () => {
  const { call, mailed } = setup({ posts: [{ fileName: '2026-09-01-10-00-old.md', raw: 'x' }] });
  assert.equal((await call('ListAuthoring')).res.posts[0].canEmail, false);
  assert.equal((await call('EmailSubscribers', { slug: 'old' })).err.code, grpc.status.FAILED_PRECONDITION);
  assert.equal(mailed.length, 0);
});

test('slugFromTitle makes an address from a title', () => {
  assert.equal(slugFromTitle('The Last Naming: a Devlog!'), 'the-last-naming-a-devlog');
});
