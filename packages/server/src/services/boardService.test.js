import { test } from 'node:test';
import assert from 'node:assert/strict';
import grpc from '@grpc/grpc-js';
import { createBoardService, threadPath } from './boardService.js';

const SECTION = { id: 's1', slug: 'game-feedback', name: 'Game feedback', description: '' };
const USERS = {
  u1: { id: 'u1', email: 'alice@example.com', username: 'alice', role: 'member' },
  u2: { id: 'u2', email: 'bob@example.com', username: 'bob', role: 'member' },
  owner: { id: 'owner', email: 'owner@example.com', username: 'matt', role: 'owner' },
};

// In-memory stand-in for boardRepo.js.
function fakeRepo() {
  const posts = new Map();
  const bans = new Set();
  let nextId = 100;
  const row = (p) => ({ ...p, author_username: USERS[p.author_id]?.username, author_banned: bans.has(p.author_id) });
  return {
    posts,
    bans,
    async listSections() { return [{ ...SECTION, thread_count: 0 }]; },
    async findSectionBySlug(_p, slug) { return slug === SECTION.slug ? SECTION : null; },
    async findSectionById() { return SECTION; },
    async listThreads() { return [...posts.values()].filter((p) => !p.parent_id).map(row); },
    async getThread(_p, id) {
      const root = posts.get(id);
      if (!root || root.parent_id) return [];
      return [row(root), ...[...posts.values()].filter((p) => p.thread_id === id).map(row)];
    },
    async getPost(_p, id) { return posts.has(id) ? row(posts.get(id)) : null; },
    async createThread(_p, { authorId, title, body, notifyReplies }) {
      const id = String(nextId++);
      posts.set(id, { id, section_id: 's1', thread_id: null, parent_id: null, author_id: authorId, title, body, notify_replies: notifyReplies, created_at: new Date(), reply_count: 0 });
      return id;
    },
    async createReply(_p, { parent, authorId, body, notifyReplies }) {
      const id = String(nextId++);
      posts.set(id, { id, section_id: 's1', thread_id: parent.thread_id ?? parent.id, parent_id: parent.id, author_id: authorId, title: null, body, notify_replies: notifyReplies, created_at: new Date() });
      return id;
    },
    async editPost(_p, { id, title, body }) { Object.assign(posts.get(id), { body, ...(title ? { title } : {}), edited_at: new Date() }); },
    async deletePost(_p, id) { posts.delete(id); return 'hard'; },
    async setNotifyReplies(_p, { id, enabled }) { posts.get(id).notify_replies = enabled; },
    async setHidden(_p, { id, hidden }) { posts.get(id).hidden_at = hidden ? new Date() : null; },
    async isBanned(_p, userId) { return bans.has(userId); },
    async setBanned(_p, { userId, banned }) { if (banned) bans.add(userId); else bans.delete(userId); },
    async countPostsSince(_p, { authorId }) { return [...posts.values()].filter((p) => p.author_id === authorId).length; },
    async findUserByUsername(_p, name) { return Object.values(USERS).find((u) => u.username === name) ?? null; },
    async findUserById(_p, id) { return USERS[id] ?? null; },
  };
}

// In-memory stand-in for boardImagesRepo.js, plus the media store.
function fakeImages() {
  const images = new Map();
  const files = new Set();
  return {
    images,
    files,
    repo: {
      async findMany(_p, ids) { return ids.filter((id) => images.has(id)).map((id) => images.get(id)); },
      async attachToPost(_p, { ids, userId, postId }) {
        for (const id of ids) {
          const img = images.get(id);
          if (img && img.user_id === userId && !img.post_id) img.post_id = postId;
        }
      },
      async deleteForPost(_p, postId) {
        const gone = [...images.values()].filter((i) => i.post_id === postId).map((i) => i.id);
        for (const id of gone) images.delete(id);
        return gone;
      },
      async listHeld() { return [...images.values()].filter((i) => i.status === 'held').map((i) => ({ ...i, username: USERS[i.user_id].username })); },
      async review(_p, { id, approve }) {
        const img = images.get(id);
        if (img?.status !== 'held') return false;
        img.status = approve ? 'ok' : 'rejected';
        return true;
      },
    },
    store: {
      get: async (key) => (files.has(key) ? Buffer.from('webp') : null),
      remove: async (key) => { files.delete(key); },
    },
  };
}

// A 22-character upload id, as mediaService.js makes them.
const imageId = (n) => `img${String(n).padStart(19, '0')}`;

function setup({ joinedAt = new Date(Date.now() - 30 * 86_400_000) } = {}) {
  const repo = fakeRepo();
  const media = fakeImages();
  const pushes = [];
  const emails = [];
  let callerId = null;
  const service = createBoardService({
    pool: {},
    repo,
    imagesRepo: media.repo,
    mediaStore: media.store,
    siteOrigin: 'https://example.com',
    pushSender: { sendToOwner: async (m) => { pushes.push(m); } },
    emailSender: { send: async (m) => { emails.push(m); } },
    authContext: {
      getCaller: async () => {
        const u = USERS[callerId];
        return u ? { userId: u.id, email: u.email, username: u.username, role: u.role, groups: [], joinedAt } : null;
      },
    },
  });
  const as = (id) => { callerId = id; };
  const call = (method, request) => new Promise((resolve) => {
    service[method]({ request, metadata: { get: () => [] } }, (err, res) => resolve({ err, res }));
  });
  return { repo, media, pushes, emails, as, call };
}

async function flush() {
  await new Promise((r) => setImmediate(r));
}

test('threadPath points at the thread, and at the post within it', () => {
  assert.equal(threadPath('game-feedback', '100', '100'), '/site/messages/game-feedback/100');
  assert.equal(threadPath('game-feedback', '100', '105'), '/site/messages/game-feedback/100#post-105');
});

test('posting needs a signed-in, unbanned user', async () => {
  const { call, as, repo } = setup();
  assert.equal((await call('CreateThread', { section: 'game-feedback', title: 't', body: 'b' })).err.code, grpc.status.UNAUTHENTICATED);
  as('u1');
  repo.bans.add('u1');
  assert.equal((await call('CreateThread', { section: 'game-feedback', title: 't', body: 'b' })).err.code, grpc.status.PERMISSION_DENIED);
});

test('a new thread renders its Markdown and pushes to the owner', async () => {
  const { call, as, pushes } = setup();
  as('u1');
  const { res } = await call('CreateThread', { section: 'game-feedback', title: 'Lava', body: 'Mind the :red[lava]' });
  await flush();
  assert.equal(pushes.length, 1);
  assert.equal(pushes[0].url, `/site/messages/game-feedback/${res.threadId}`);
  assert.match(pushes[0].body, /^alice: Mind the lava$/);

  as(null);
  const thread = (await call('GetThread', { threadId: res.threadId })).res;
  assert.match(thread.posts[0].bodyHtml, /<span style="color: var\(--mk-red/);
  assert.equal(thread.posts[0].body, ''); // source only for the author
  assert.equal(thread.viewer.canPost, false);
});

test("the owner's own posts don't push to the owner", async () => {
  const { call, as, pushes } = setup();
  as('owner');
  await call('CreateThread', { section: 'game-feedback', title: 'Hello', body: 'Welcome' });
  await flush();
  assert.equal(pushes.length, 0);
});

test('a reply emails the parent author only if they asked, and never for self-replies', async () => {
  const { call, as, emails } = setup();
  as('u1');
  const { threadId } = (await call('CreateThread', { section: 'game-feedback', title: 't', body: 'first', notifyReplies: true })).res;
  await call('Reply', { parentId: threadId, body: 'replying to myself' });
  await flush();
  assert.equal(emails.length, 0);

  as('u2');
  const { post } = (await call('Reply', { parentId: threadId, body: 'Nice **work**' })).res;
  await flush();
  assert.equal(emails.length, 1);
  assert.equal(emails[0].to, 'alice@example.com');
  assert.match(emails[0].subject, /bob replied/);
  assert.match(emails[0].text, new RegExp(`https://example\\.com/site/messages/game-feedback/${threadId}#post-${post.id}`));

  // bob didn't ask, so alice replying to bob sends nothing.
  as('u1');
  await call('Reply', { parentId: post.id, body: 'thanks' });
  await flush();
  assert.equal(emails.length, 1);
});

test('only the author can edit, and edits are marked', async () => {
  const { call, as } = setup();
  as('u1');
  const { threadId } = (await call('CreateThread', { section: 'game-feedback', title: 't', body: 'first' })).res;
  as('u2');
  assert.equal((await call('EditPost', { postId: threadId, body: 'mine now', title: 't' })).err.code, grpc.status.PERMISSION_DENIED);
  as('u1');
  const { post } = (await call('EditPost', { postId: threadId, body: 'second', title: 'better title' })).res;
  assert.equal(post.title, 'better title');
  assert.notEqual(post.editedAt, '');
  assert.equal(post.body, 'second');
});

test('a removed post is withheld from everyone but moderators', async () => {
  const { call, as } = setup();
  as('u1');
  const { threadId } = (await call('CreateThread', { section: 'game-feedback', title: 't', body: 'first' })).res;
  const { post } = (await call('Reply', { parentId: threadId, body: 'rude words' })).res;
  as('u2');
  assert.equal((await call('HidePost', { postId: post.id, hidden: true })).err.code, grpc.status.PERMISSION_DENIED);
  as('owner');
  assert.equal((await call('HidePost', { postId: post.id, hidden: true })).err, null);

  as('u2');
  const seen = (await call('GetThread', { threadId })).res.posts.find((p) => p.id === post.id);
  assert.equal(seen.removed, true);
  assert.equal(seen.bodyHtml, '');
  as('owner');
  assert.match((await call('GetThread', { threadId })).res.posts.find((p) => p.id === post.id).bodyHtml, /rude words/);
});

test('moderators ban and unban by username; the owner cannot be banned', async () => {
  const { call, as, repo } = setup();
  as('owner');
  assert.equal((await call('BanUser', { username: 'bob', banned: true })).err, null);
  assert.ok(repo.bans.has('u2'));
  assert.equal((await call('BanUser', { username: 'matt', banned: true })).err.code, grpc.status.PERMISSION_DENIED);
  await call('BanUser', { username: 'bob', banned: false });
  assert.ok(!repo.bans.has('u2'));
});

test('posting quickly hits the flood limit', async () => {
  const { call, as } = setup();
  as('u1');
  for (let i = 0; i < 6; i++) await call('CreateThread', { section: 'game-feedback', title: `t${i}`, body: 'b' });
  assert.equal((await call('CreateThread', { section: 'game-feedback', title: 'one more', body: 'b' })).err.code, grpc.status.RESOURCE_EXHAUSTED);
});

test('empty and oversized posts are refused', async () => {
  const { call, as } = setup();
  as('u1');
  assert.equal((await call('CreateThread', { section: 'game-feedback', title: ' ', body: 'b' })).err.code, grpc.status.INVALID_ARGUMENT);
  assert.equal((await call('CreateThread', { section: 'game-feedback', title: 't', body: '   ' })).err.code, grpc.status.INVALID_ARGUMENT);
  assert.equal((await call('CreateThread', { section: 'game-feedback', title: 't', body: 'x'.repeat(20_001) })).err.code, grpc.status.INVALID_ARGUMENT);
});

test('a post shows its author\'s own images; held say so; anyone else\'s are links', async () => {
  const { as, call, media } = setup();
  media.images.set(imageId(1), { id: imageId(1), user_id: 'u1', status: 'ok' });
  media.images.set(imageId(2), { id: imageId(2), user_id: 'u1', status: 'held' });
  media.images.set(imageId(3), { id: imageId(3), user_id: 'u2', status: 'ok' });
  as('u1');
  const body = [1, 2, 3].map((n) => `![s${n}](/media/board/${imageId(n)}.webp)`).join(' ');
  const { res: { threadId } } = await call('CreateThread', { section: 'game-feedback', title: 'Pics', body });
  const { res } = await call('GetThread', { threadId });
  const html = res.posts[0].bodyHtml;
  assert.match(html, new RegExp(`<img src="/media/board/${imageId(1)}\\.webp"`));
  assert.match(html, /\[image awaiting review\]/);
  assert.match(html, new RegExp(`<a href="/media/board/${imageId(3)}\\.webp"`));
  // Only the author's unused uploads are tied to the post.
  assert.equal(media.images.get(imageId(1)).post_id, threadId);
  assert.equal(media.images.get(imageId(3)).post_id, undefined);
});

test('at most five images per post', async () => {
  const { as, call } = setup();
  as('u1');
  const body = [1, 2, 3, 4, 5, 6].map((n) => `![](/media/board/${imageId(n)}.webp)`).join('\n');
  const { err } = await call('CreateThread', { section: 'game-feedback', title: 'Too many', body });
  assert.equal(err.code, grpc.status.INVALID_ARGUMENT);
  assert.match(err.message, /up to 5 images/);
});

test('deleting a post deletes its images', async () => {
  const { as, call, media } = setup();
  media.images.set(imageId(1), { id: imageId(1), user_id: 'u1', status: 'ok' });
  media.files.add(`board/${imageId(1)}.webp`);
  as('u1');
  const { res: { threadId } } = await call('CreateThread', { section: 'game-feedback', title: 'T', body: `![](/media/board/${imageId(1)}.webp)` });
  await call('DeletePost', { postId: threadId });
  assert.equal(media.images.size, 0);
  assert.equal(media.files.size, 0);
});

test('the viewer says whether images are allowed yet', async () => {
  const fresh = setup({ joinedAt: new Date(Date.now() - 86_400_000) });
  fresh.as('u1');
  const { viewer } = (await fresh.call('ListSections', {})).res;
  assert.equal(viewer.canUploadImages, false);
  assert.ok(Date.parse(viewer.imagesFrom) > Date.now());
  fresh.as('owner');
  assert.equal((await fresh.call('ListSections', {})).res.viewer.canUploadImages, true);
});

test('moderators review held images', async () => {
  const { as, call, media } = setup();
  media.images.set(imageId(1), { id: imageId(1), user_id: 'u1', status: 'held', labels: [{ name: 'Suggestive', confidence: 71.6 }], created_at: new Date() });
  media.files.add(`board/${imageId(1)}.webp`);
  as('u1');
  assert.equal((await call('ListHeldImages', {})).err.code, grpc.status.PERMISSION_DENIED);
  as('owner');
  const { res } = await call('ListHeldImages', {});
  assert.deepEqual(res.images[0].labels, ['Suggestive 72%']);
  assert.match(res.images[0].dataUrl, /^data:image\/webp;base64,/);
  await call('ReviewImage', { id: imageId(1), approve: true });
  assert.equal(media.images.get(imageId(1)).status, 'ok');
  assert.equal((await call('ReviewImage', { id: imageId(1), approve: false })).err.code, grpc.status.NOT_FOUND);
});
