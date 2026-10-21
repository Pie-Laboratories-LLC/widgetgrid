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

function setup() {
  const repo = fakeRepo();
  const pushes = [];
  const emails = [];
  let callerId = null;
  const service = createBoardService({
    pool: {},
    repo,
    siteOrigin: 'https://example.com',
    pushSender: { sendToOwner: async (m) => { pushes.push(m); } },
    emailSender: { send: async (m) => { emails.push(m); } },
    authContext: {
      getCaller: async () => {
        const u = USERS[callerId];
        return u ? { userId: u.id, email: u.email, username: u.username, role: u.role, groups: [] } : null;
      },
    },
  });
  const as = (id) => { callerId = id; };
  const call = (method, request) => new Promise((resolve) => {
    service[method]({ request, metadata: { get: () => [] } }, (err, res) => resolve({ err, res }));
  });
  return { repo, pushes, emails, as, call };
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
