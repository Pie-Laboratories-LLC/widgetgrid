import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPostMailer, AlreadySent } from './postMailer.js';

function post(slug) {
  return { slug, title: slug.toUpperCase(), synopsisHtml: `<p>${slug}</p>` };
}

function fakeRepo(subscribers = []) {
  const sentSlugs = new Set();
  return {
    sentSlugs,
    async claimSend(_pool, slug) {
      if (sentSlugs.has(slug)) return false;
      sentSlugs.add(slug);
      return true;
    },
    async listActive() { return subscribers; },
    async deleteExpiredPending() {},
  };
}

function setup({ subscribers, send } = {}) {
  const sent = [];
  const repo = fakeRepo(subscribers);
  const mailer = createPostMailer({
    pool: {},
    repo,
    emailSender: { send: send ?? (async (m) => { sent.push(m); }) },
    siteOrigin: 'https://example.com',
  });
  return { mailer, sent, repo };
}

const SUBSCRIBERS = [
  { email: 'a@example.com', unsubscribe_token: 'ua' },
  { email: 'b@example.com', unsubscribe_token: 'ub' },
];

test('a post goes to every subscriber, with one-click unsubscribe', async () => {
  const { mailer, sent } = setup({ subscribers: SUBSCRIBERS });
  assert.equal(await mailer.send(post('new-one')), 2);
  assert.deepEqual(sent.map((m) => m.to), ['a@example.com', 'b@example.com']);
  assert.match(sent[0].headers['List-Unsubscribe'], /token=ua/);
  assert.match(sent[0].text, /https:\/\/example\.com\/blog\/new-one/);
});

test('a post is only ever sent once', async () => {
  const { mailer, sent } = setup({ subscribers: SUBSCRIBERS });
  await mailer.send(post('once'));
  await assert.rejects(mailer.send(post('once')), AlreadySent);
  assert.equal(sent.length, 2);
});

test('one failed delivery does not stop the rest', async () => {
  const sent = [];
  const { mailer } = setup({
    subscribers: SUBSCRIBERS,
    send: async (m) => {
      if (m.to === 'a@example.com') throw new Error('bounce');
      sent.push(m);
    },
  });
  assert.equal(await mailer.send(post('partial')), 1);
  assert.deepEqual(sent.map((m) => m.to), ['b@example.com']);
});
