import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSubscriptionService, hashToken } from './subscriptionService.js';

// In-memory stand-in for emailSubscriptionsRepo.js.
function fakeRepo() {
  const rows = new Map(); // email -> row
  return {
    rows,
    async findByEmail(_pool, email) { return rows.get(email) ?? null; },
    async upsertPending(_pool, { email, confirmTokenHash, unsubscribeToken }) {
      const existing = rows.get(email);
      if (existing?.status === 'active') return null;
      const row = { ...existing, email, status: 'pending', confirm_token_hash: confirmTokenHash, confirm_sent_at: new Date(), unsubscribe_token: existing?.unsubscribe_token ?? unsubscribeToken };
      rows.set(email, row);
      return row;
    },
    async upsertActive(_pool, { email, userId, unsubscribeToken }) {
      const row = { email, status: 'active', user_id: userId, unsubscribe_token: rows.get(email)?.unsubscribe_token ?? unsubscribeToken };
      rows.set(email, row);
      return row;
    },
    async confirm(_pool, { confirmTokenHash, sentAfter }) {
      const row = [...rows.values()].find((r) => r.confirm_token_hash === confirmTokenHash && r.status === 'pending' && r.confirm_sent_at > sentAfter);
      if (!row) return null;
      Object.assign(row, { status: 'active', confirm_token_hash: null });
      return row;
    },
    async removeByUnsubscribeToken(_pool, token) {
      const row = [...rows.values()].find((r) => r.unsubscribe_token === token);
      if (!row) return null;
      rows.delete(row.email);
      return { email: row.email };
    },
  };
}

function setup({ caller = null, captchaOk = true } = {}) {
  const repo = fakeRepo();
  const sent = [];
  const service = createSubscriptionService({
    pool: {},
    repo,
    authContext: { getCaller: async () => caller },
    emailSender: { send: async (m) => { sent.push(m); } },
    captcha: { verify: async () => captchaOk },
    siteOrigin: 'https://example.com',
  });
  const call = (method, request) => new Promise((resolve) => {
    service[method]({ request, metadata: { get: () => [] } }, (err, res) => resolve({ err, res }));
  });
  return { repo, sent, call };
}

function tokenFrom(message) {
  return decodeURIComponent(/confirm=([^\s"&]+)/.exec(message.text)[1]);
}

test('a signed-out subscribe sends a confirmation, and the link activates it', async () => {
  const { repo, sent, call } = setup();
  const { res } = await call('Subscribe', { email: ' Reader@Example.com ', captchaToken: 't' });
  assert.equal(res.outcome, 'confirmation_sent');
  assert.equal(repo.rows.get('reader@example.com').status, 'pending');
  assert.equal(sent.length, 1);
  assert.equal(sent[0].to, 'reader@example.com');
  assert.match(sent[0].text, /https:\/\/example\.com\/site\/subscribe\?confirm=/);

  const confirmed = await call('ConfirmSubscription', { token: tokenFrom(sent[0]) });
  assert.equal(confirmed.res.email, 'reader@example.com');
  assert.equal(repo.rows.get('reader@example.com').status, 'active');

  const again = await call('ConfirmSubscription', { token: tokenFrom(sent[0]) });
  assert.equal(again.err.code, 5); // NOT_FOUND: already used
});

test('only the token hash is stored', async () => {
  const { repo, sent, call } = setup();
  await call('Subscribe', { email: 'a@example.com', captchaToken: 't' });
  const token = tokenFrom(sent[0]);
  assert.equal(repo.rows.get('a@example.com').confirm_token_hash, hashToken(token));
  assert.notEqual(repo.rows.get('a@example.com').confirm_token_hash, token);
});

test('a second request within the throttle window sends nothing more', async () => {
  const { sent, call } = setup();
  await call('Subscribe', { email: 'a@example.com', captchaToken: 't' });
  const { res } = await call('Subscribe', { email: 'a@example.com', captchaToken: 't' });
  assert.equal(res.outcome, 'confirmation_sent');
  assert.equal(sent.length, 1);
});

test('an already-active address gets the same answer and no email', async () => {
  const { repo, sent, call } = setup();
  repo.rows.set('a@example.com', { email: 'a@example.com', status: 'active', unsubscribe_token: 'u' });
  const { res } = await call('Subscribe', { email: 'a@example.com', captchaToken: 't' });
  assert.equal(res.outcome, 'confirmation_sent');
  assert.equal(sent.length, 0);
});

test('signed in with their own address: active at once, no captcha or email', async () => {
  const { repo, sent, call } = setup({ caller: { userId: 'u1', email: 'Me@Example.com' }, captchaOk: false });
  const { res } = await call('Subscribe', { email: 'me@example.com' });
  assert.equal(res.outcome, 'subscribed');
  assert.equal(repo.rows.get('me@example.com').status, 'active');
  assert.equal(sent.length, 0);
});

test('signed in with a different address still needs the captcha and confirmation', async () => {
  const { call } = setup({ caller: { userId: 'u1', email: 'me@example.com' }, captchaOk: false });
  const { err } = await call('Subscribe', { email: 'other@example.com' });
  assert.equal(err.code, 7); // PERMISSION_DENIED
});

test('rejects something that is not an email address', async () => {
  const { sent, call } = setup();
  const { err } = await call('Subscribe', { email: 'not an email', captchaToken: 't' });
  assert.equal(err.code, 3); // INVALID_ARGUMENT
  assert.equal(sent.length, 0);
});

test('unsubscribe removes the address and is idempotent', async () => {
  const { repo, call } = setup();
  repo.rows.set('a@example.com', { email: 'a@example.com', status: 'active', unsubscribe_token: 'u' });
  assert.equal((await call('Unsubscribe', { token: 'u' })).res.email, 'a@example.com');
  assert.equal(repo.rows.size, 0);
  assert.equal((await call('Unsubscribe', { token: 'u' })).res.email, '');
});
