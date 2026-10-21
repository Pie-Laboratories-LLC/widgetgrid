import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPostMailer } from './postMailer.js';

function post(slug) {
  return { slug, title: slug.toUpperCase(), synopsisHtml: `<p>${slug}</p>` };
}

function fakeRepo(subscribers = []) {
  const mailings = new Map();
  return {
    mailings,
    async listMailingSlugs() { return [...mailings.keys()]; },
    async claimMailing(_pool, { slug, sent }) {
      if (mailings.has(slug)) return false;
      mailings.set(slug, sent);
      return true;
    },
    async listActive() { return subscribers; },
    async deleteExpiredPending() {},
  };
}

function setup({ posts, subscribers, repo = fakeRepo(subscribers) }) {
  const sent = [];
  const source = { posts };
  const mailer = createPostMailer({
    pool: {},
    repo,
    blogSource: { listPosts: async () => source.posts },
    emailSender: { send: async (m) => { sent.push(m); } },
    siteOrigin: 'https://example.com',
  });
  return { mailer, sent, source, repo };
}

const SUBSCRIBERS = [
  { email: 'a@example.com', unsubscribe_token: 'ua' },
  { email: 'b@example.com', unsubscribe_token: 'ub' },
];

test('the first run records existing posts without emailing them', async () => {
  const { mailer, sent, repo } = setup({ posts: [post('two'), post('one')], subscribers: SUBSCRIBERS });
  await mailer.tick();
  assert.equal(sent.length, 0);
  assert.deepEqual([...repo.mailings], [['two', false], ['one', false]]);
});

test('a new post goes to every subscriber once, with one-click unsubscribe', async () => {
  const { mailer, sent, source } = setup({ posts: [post('one')], subscribers: SUBSCRIBERS });
  await mailer.tick();
  source.posts = [post('two'), post('one')];
  await mailer.tick();
  await mailer.tick();
  assert.deepEqual(sent.map((m) => m.to), ['a@example.com', 'b@example.com']);
  assert.equal(sent[0].subject, 'New post: TWO');
  assert.match(sent[0].text, /https:\/\/example\.com\/blog\/two/);
  assert.equal(sent[0].headers['List-Unsubscribe'], '<https://example.com/email/unsubscribe?token=ua>');
  assert.equal(sent[0].headers['List-Unsubscribe-Post'], 'List-Unsubscribe=One-Click');
});

test('a post another replica already claimed is not sent again', async () => {
  const repo = fakeRepo(SUBSCRIBERS);
  repo.mailings.set('one', false);
  repo.mailings.set('two', true); // claimed elsewhere
  const { mailer, sent } = setup({ posts: [post('two'), post('one')], repo });
  await mailer.tick();
  assert.equal(sent.length, 0);
});

test('two new posts go out oldest first', async () => {
  const { mailer, sent, source } = setup({ posts: [post('one')], subscribers: [SUBSCRIBERS[0]] });
  await mailer.tick();
  source.posts = [post('three'), post('two'), post('one')];
  await mailer.tick();
  assert.deepEqual(sent.map((m) => m.subject), ['New post: TWO', 'New post: THREE']);
});

test('one failed delivery does not stop the rest', async () => {
  const repo = fakeRepo(SUBSCRIBERS);
  repo.mailings.set('one', false);
  const sent = [];
  const mailer = createPostMailer({
    pool: {},
    repo,
    blogSource: { listPosts: async () => [post('two'), post('one')] },
    emailSender: {
      send: async (m) => {
        if (m.to === 'a@example.com') throw new Error('bounce');
        sent.push(m);
      },
    },
    siteOrigin: 'https://example.com',
  });
  await mailer.tick();
  assert.deepEqual(sent.map((m) => m.to), ['b@example.com']);
});
