import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPushSender } from './pushSender.js';

function fakeRepo(endpoints) {
  const removed = [];
  const succeeded = [];
  return {
    removed,
    succeeded,
    async listForOwner() { return endpoints.map((endpoint) => ({ endpoint, p256dh: 'k', auth: 'a' })); },
    async removeByEndpoint(_pool, endpoint) { removed.push(endpoint); },
    async markSuccess(_pool, endpoint) { succeeded.push(endpoint); },
  };
}

test('without VAPID keys push is disabled and sends nothing', async () => {
  let sent = 0;
  const sender = createPushSender({ pool: {}, repo: fakeRepo(['https://a']), send: async () => { sent += 1; } });
  assert.equal(sender.enabled, false);
  assert.equal(sender.publicKey, '');
  assert.equal(await sender.sendToOwner({ title: 't' }), 0);
  assert.equal(sent, 0);
});

test('sends the JSON payload to every owner subscription', async () => {
  const calls = [];
  const repo = fakeRepo(['https://a', 'https://b']);
  const sender = createPushSender({
    pool: {}, publicKey: 'pub', privateKey: 'priv', subject: 'mailto:x@example.com', repo,
    send: async (sub, payload, options) => { calls.push({ sub, payload, options }); },
  });
  const delivered = await sender.sendToOwner({ title: 'New message', body: 'hi', tag: 'chat-1', url: '/?view=chat' });
  assert.equal(delivered, 2);
  assert.deepEqual(JSON.parse(calls[0].payload), { title: 'New message', body: 'hi', tag: 'chat-1', url: '/?view=chat' });
  assert.equal(calls[0].options.vapidDetails.publicKey, 'pub');
  assert.deepEqual(repo.succeeded, ['https://a', 'https://b']);
});

test('subscriptions the push service reports gone are deleted; others are kept', async () => {
  const repo = fakeRepo(['https://gone', 'https://flaky', 'https://ok']);
  const sender = createPushSender({
    pool: {}, publicKey: 'pub', privateKey: 'priv', subject: 'mailto:x@example.com', repo,
    send: async (sub) => {
      if (sub.endpoint === 'https://gone') throw Object.assign(new Error('gone'), { statusCode: 410 });
      if (sub.endpoint === 'https://flaky') throw Object.assign(new Error('busy'), { statusCode: 503 });
    },
  });
  const original = console.error;
  console.error = () => {};
  try {
    assert.equal(await sender.sendToOwner({ title: 't' }), 1);
  } finally {
    console.error = original;
  }
  assert.deepEqual(repo.removed, ['https://gone']);
});
