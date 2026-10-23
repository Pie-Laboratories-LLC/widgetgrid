import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAuthContext } from './index.js';

function call(headers = {}) {
  return { metadata: { get: (k) => (k in headers ? [headers[k]] : []) } };
}

const owner = { id: 'u1', cognito_sub: 'sub-owner', email: 'owner@example.com', role: 'owner' };
const member = { id: 'u2', cognito_sub: 'sub-member', email: 'm@example.com', role: 'member' };
const future = () => Math.floor(Date.now() / 1000) + 3600;

function context({ verify, rows = [owner, member] } = {}) {
  let lookups = 0;
  const ctx = createAuthContext({
    pool: {},
    verifyAccessToken: verify ?? (async (t) => ({ sub: t.replace('tok-', ''), exp: future(), 'cognito:groups': ['anonyme users'] })),
    users: { async findBySub(_pool, sub) { lookups += 1; return rows.find((r) => r.cognito_sub === sub) ?? null; } },
  });
  return { ctx, lookups: () => lookups };
}

test('no authorization header is an anonymous caller', async () => {
  const { ctx } = context();
  assert.equal(await ctx.getCaller(call()), null);
  assert.equal(await ctx.isOwner(call()), false);
});

test('a token that fails verification is an anonymous caller', async () => {
  const { ctx } = context({ verify: async () => { throw new Error('expired'); } });
  assert.equal(await ctx.getCaller(call({ authorization: 'Bearer tok-sub-owner' })), null);
});

test('a verified token with no users row is anonymous (RegisterSignIn never ran)', async () => {
  const { ctx } = context();
  assert.equal(await ctx.getCaller(call({ authorization: 'Bearer tok-sub-stranger' })), null);
});

test('owner role comes from the users table, groups from the token', async () => {
  const { ctx } = context();
  const caller = await ctx.getCaller(call({ authorization: 'Bearer tok-sub-owner' }));
  assert.deepEqual(caller, { userId: 'u1', sub: 'sub-owner', email: 'owner@example.com', emailVerified: true, role: 'owner', username: null, joinedAt: null, groups: ['anonyme users'] });
  assert.equal(await ctx.isOwner(call({ authorization: 'Bearer tok-sub-owner' })), true);
});

test('a signed-in member is not the owner', async () => {
  const { ctx } = context();
  assert.equal(await ctx.isOwner(call({ authorization: 'Bearer tok-sub-member' })), false);
});

test('a resolved caller is cached per token', async () => {
  const { ctx, lookups } = context();
  const c = call({ authorization: 'Bearer tok-sub-owner' });
  await ctx.getCaller(c);
  await ctx.getCaller(c);
  assert.equal(lookups(), 1);
});

test('forget drops the cached caller so the next call looks the user up again', async () => {
  const { ctx, lookups } = context();
  const c = call({ authorization: 'Bearer tok-sub-owner' });
  await ctx.getCaller(c);
  ctx.forget(c);
  await ctx.getCaller(c);
  assert.equal(lookups(), 2);
});
