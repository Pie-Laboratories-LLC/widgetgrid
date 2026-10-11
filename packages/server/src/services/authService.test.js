import { test } from 'node:test';
import assert from 'node:assert/strict';
import grpc from '@grpc/grpc-js';
import { createAuthService } from './authService.js';

function fakeDeps({ claims = { sub: 's1', email: 'Owner@Example.com' }, existingRole } = {}) {
  const sessions = [];
  const upserts = [];
  return {
    sessions,
    upserts,
    deps: {
      pool: {},
      ownerEmail: 'owner@example.com',
      verifyIdToken: async (t) => {
        if (t !== 'good') throw new Error('bad token');
        return claims;
      },
      usersRepo: {
        async upsertOnSignIn(_pool, args) {
          upserts.push(args);
          const role = args.becomeOwner ? 'owner' : (existingRole ?? 'member');
          return { id: 'u1', cognito_sub: args.sub, email: args.email, role };
        },
      },
      authRepo: {
        async createSession(_pool, s) { sessions.push(s); },
        async deleteSession(_pool, token) { sessions.splice(sessions.findIndex((s) => s.token === token), 1); },
        async hasActiveSession() { return sessions.length > 0; },
      },
    },
  };
}

function invoke(service, method, request) {
  return new Promise((resolve) => {
    service[method]({ request }, (err, response) => resolve({ err, response }));
  });
}

test('RegisterSignIn rejects an unverifiable ID token', async () => {
  const { deps, upserts } = fakeDeps();
  const { err } = await invoke(createAuthService(deps), 'RegisterSignIn', { idToken: 'forged' });
  assert.equal(err.code, grpc.status.UNAUTHENTICATED);
  assert.equal(upserts.length, 0);
});

test('the configured owner email (case-insensitive) becomes owner and gets a presence session', async () => {
  const { deps, sessions, upserts } = fakeDeps();
  const { err, response } = await invoke(createAuthService(deps), 'RegisterSignIn', { idToken: 'good' });
  assert.equal(err, null);
  assert.equal(upserts[0].becomeOwner, true);
  assert.equal(response.role, 'owner');
  assert.equal(response.sessionToken.length, 64);
  assert.equal(sessions.length, 1);
  assert.equal(sessions[0].userId, 'u1');
});

test('anyone else signs in as a member with no presence session', async () => {
  const { deps, sessions } = fakeDeps({ claims: { sub: 's2', email: 'friend@example.com' } });
  const { response } = await invoke(createAuthService(deps), 'RegisterSignIn', { idToken: 'good' });
  assert.deepEqual(response, { sessionToken: '', role: 'member' });
  assert.equal(sessions.length, 0);
});

test('an existing owner keeps the role even if their email no longer matches', async () => {
  const { deps } = fakeDeps({ claims: { sub: 's1', email: 'renamed@example.com' }, existingRole: 'owner' });
  const { response } = await invoke(createAuthService(deps), 'RegisterSignIn', { idToken: 'good' });
  assert.equal(response.role, 'owner');
});

test('Logout removes the presence session', async () => {
  const { deps, sessions } = fakeDeps();
  const service = createAuthService(deps);
  const { response } = await invoke(service, 'RegisterSignIn', { idToken: 'good' });
  await invoke(service, 'Logout', { token: response.sessionToken });
  assert.equal(sessions.length, 0);
});
