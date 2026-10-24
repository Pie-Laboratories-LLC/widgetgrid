import { test } from 'node:test';
import assert from 'node:assert/strict';
import grpc from '@grpc/grpc-js';
import { createAuthService } from './authService.js';
import { parseAssignedUsernames } from '../siteAccounts.js';

function fakeDeps({ claims = { sub: 's1', email: 'Owner@Example.com' }, existingRole, reservations = {} } = {}) {
  const sessions = [];
  const upserts = [];
  const claimed = [];
  return {
    sessions,
    upserts,
    claimed,
    deps: {
      pool: {},
      ownerEmails: ['owner@example.com', 'second@example.com'],
      assigned: parseAssignedUsernames('pielabs=site@example.com'),
      verifyIdToken: async (t) => {
        if (t !== 'good') throw new Error('bad token');
        // A site-registered account's token unless the test says otherwise.
        return { email_verified: true, ...claims };
      },
      usersRepo: {
        async upsertOnSignIn(_pool, args) {
          upserts.push(args);
          const role = args.becomeOwner ? 'owner' : (existingRole ?? 'member');
          return { id: 'u1', cognito_sub: args.sub, email: args.email, role };
        },
      },
      usernamesRepo: {
        async findReservationByEmail(_pool, { email }) { return reservations[email] ?? null; },
        async claimForUser(_pool, args) {
          claimed.push(args);
          return args.username;
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
  assert.deepEqual(response, { sessionToken: '', role: 'member', username: '' });
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

test('first sign-in after registering claims the reserved username', async () => {
  const { deps, claimed } = fakeDeps({
    claims: { sub: 's3', email: 'new@example.com' },
    reservations: { 'new@example.com': 'NewPerson' },
  });
  const { response } = await invoke(createAuthService(deps), 'RegisterSignIn', { idToken: 'good' });
  assert.equal(response.username, 'NewPerson');
  assert.equal(claimed[0].userId, 'u1');
  assert.equal(claimed[0].email, 'new@example.com');
});

test('every address in the owner list becomes owner', async () => {
  const { deps, upserts } = fakeDeps({ claims: { sub: 's4', email: 'Second@example.com' } });
  const { response } = await invoke(createAuthService(deps), 'RegisterSignIn', { idToken: 'good' });
  assert.equal(upserts[0].becomeOwner, true);
  assert.equal(response.role, 'owner');
});

test('an address with an assigned name gets it on sign-in, over any reservation', async () => {
  const { deps, claimed } = fakeDeps({
    claims: { sub: 's5', email: 'Site@Example.com' },
    reservations: { 'Site@Example.com': 'Typed' },
  });
  const { response } = await invoke(createAuthService(deps), 'RegisterSignIn', { idToken: 'good' });
  assert.equal(response.username, 'pielabs');
  assert.equal(claimed[0].username, 'pielabs');
});

// Social sign-in: Microsoft's email is unchecked, so it proves nothing.
test('an unverified email matching the owner list does not become owner', async () => {
  const { deps, sessions, upserts } = fakeDeps({
    claims: { sub: 's6', 'cognito:username': 'Microsoft_abc', email: 'owner@example.com', email_verified: undefined },
  });
  const { response } = await invoke(createAuthService(deps), 'RegisterSignIn', { idToken: 'good' });
  assert.equal(upserts[0].becomeOwner, false);
  assert.equal(upserts[0].emailVerified, false);
  assert.equal(response.role, 'member');
  assert.equal(sessions.length, 0);
});

test('an unverified email gets neither its assigned name nor a reservation', async () => {
  const { deps, claimed } = fakeDeps({
    claims: { sub: 's7', 'cognito:username': 'Microsoft_def', email: 'site@example.com', email_verified: false },
    reservations: { 'site@example.com': 'Typed' },
  });
  const { response } = await invoke(createAuthService(deps), 'RegisterSignIn', { idToken: 'good' });
  assert.equal(response.username, '');
  assert.equal(claimed.length, 0);
});

test('Identity Center counts as verified without the claim', async () => {
  const { deps, upserts } = fakeDeps({
    claims: { sub: 's8', 'cognito:username': 'IdentityCenter_owner@example.com', email: 'owner@example.com', email_verified: undefined },
  });
  const { response } = await invoke(createAuthService(deps), 'RegisterSignIn', { idToken: 'good' });
  assert.equal(upserts[0].emailVerified, true);
  assert.equal(response.role, 'owner');
});
