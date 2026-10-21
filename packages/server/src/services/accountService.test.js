import { test } from 'node:test';
import assert from 'node:assert/strict';
import grpc from '@grpc/grpc-js';
import { createAccountService, usernameProblem } from './accountService.js';
import { RegistrarError } from '../registrar.js';

// In-memory stand-in for usernamesRepo.js: taken names, live reservations.
function fakeUsernames({ taken = [], reservations = {} } = {}) {
  const takenSet = new Set(taken.map((t) => t.toLowerCase()));
  const res = new Map(Object.entries(reservations).map(([k, v]) => [k.toLowerCase(), v])); // key -> email
  const claims = [];
  return {
    res,
    claims,
    async isAvailable(_pool, { username, email }) {
      const holder = res.get(username.toLowerCase());
      return !takenSet.has(username.toLowerCase()) && (!holder || holder === email);
    },
    async reserve(_pool, { username, email }) {
      if (!(await this.isAvailable(null, { username, email }))) return false;
      res.set(username.toLowerCase(), email);
      return true;
    },
    async claimForUser(_pool, args) {
      if (takenSet.has(args.username.toLowerCase())) return null;
      claims.push(args);
      return args.username;
    },
  };
}

function setup({ usernames = fakeUsernames(), caller = null, captchaOk = true, registrar } = {}) {
  const signUps = [];
  const forgotten = [];
  const service = createAccountService({
    pool: {},
    usernames,
    captcha: { verify: async () => captchaOk },
    authContext: { getCaller: async () => caller, forget: () => forgotten.push(true) },
    registrar: registrar ?? {
      async signUp(args) { signUps.push(args); },
      async confirm() {},
      async resendCode() {},
    },
  });
  const call = (method, request) => new Promise((resolve) => {
    service[method]({ request, metadata: { get: () => [] } }, (err, res) => resolve({ err, res }));
  });
  return { call, signUps, usernames, forgotten };
}

const GOOD = { email: 'New@Example.com', username: 'NewPerson', password: 'Sup3r-secret', captchaToken: 't' };

test('usernameProblem enforces the shape and the reserved list', () => {
  assert.equal(usernameProblem('ok_name-1'), null);
  assert.match(usernameProblem('ab'), /3-20/);
  assert.match(usernameProblem('has space'), /3-20/);
  assert.match(usernameProblem('a'.repeat(21)), /3-20/);
  assert.match(usernameProblem('Webmaster'), /reserved/);
});

test('Register reserves the username, then signs up with the lowercased email', async () => {
  const { call, signUps, usernames } = setup();
  const { err } = await call('Register', GOOD);
  assert.equal(err, null);
  assert.equal(usernames.res.get('newperson'), 'new@example.com');
  assert.deepEqual(signUps, [{ email: 'new@example.com', password: 'Sup3r-secret' }]);
});

test('a taken username (any capitalisation) is refused before Cognito is called', async () => {
  const { call, signUps } = setup({ usernames: fakeUsernames({ taken: ['newperson'] }) });
  const { err } = await call('Register', GOOD);
  assert.equal(err.code, grpc.status.ALREADY_EXISTS);
  assert.equal(err.message, 'That username is taken.');
  assert.equal(signUps.length, 0);
});

test('a name reserved by someone else is taken; the same email may register again', async () => {
  const other = setup({ usernames: fakeUsernames({ reservations: { NewPerson: 'someone@example.com' } }) });
  assert.equal((await other.call('Register', GOOD)).err.code, grpc.status.ALREADY_EXISTS);
  const same = setup({ usernames: fakeUsernames({ reservations: { NewPerson: 'new@example.com' } }) });
  assert.equal((await same.call('Register', GOOD)).err, null);
});

test('a failed captcha stops registration', async () => {
  const { call, signUps } = setup({ captchaOk: false });
  const { err } = await call('Register', GOOD);
  assert.equal(err.code, grpc.status.PERMISSION_DENIED);
  assert.equal(signUps.length, 0);
});

test("Cognito's existing-email and weak-password errors become form messages", async () => {
  const failing = (err) => ({ async signUp() { throw err; }, async confirm() {}, async resendCode() {} });
  const taken = setup({ registrar: failing(new RegistrarError('email_taken')) });
  const takenErr = (await taken.call('Register', GOOD)).err;
  assert.equal(takenErr.code, grpc.status.ALREADY_EXISTS);
  assert.match(takenErr.message, /already exists/);

  const weak = setup({ registrar: failing(new RegistrarError('invalid_password', 'Password did not conform with policy: Password must have uppercase characters')) });
  const weakErr = (await weak.call('Register', GOOD)).err;
  assert.equal(weakErr.code, grpc.status.INVALID_ARGUMENT);
  assert.equal(weakErr.message, 'Password must have uppercase characters.');
});

test('ConfirmRegistration wants six digits', async () => {
  const { call } = setup();
  assert.equal((await call('ConfirmRegistration', { email: 'a@example.com', code: '12345' })).err.code, grpc.status.INVALID_ARGUMENT);
  assert.equal((await call('ConfirmRegistration', { email: 'a@example.com', code: ' 123456 ' })).err, null);
});

test('CheckUsername reports shape problems and availability', async () => {
  const { call } = setup({ usernames: fakeUsernames({ taken: ['bob'] }) });
  assert.deepEqual((await call('CheckUsername', { username: 'Bob' })).res, { available: false, problem: 'That username is taken.' });
  assert.equal((await call('CheckUsername', { username: 'x' })).res.available, false);
  assert.deepEqual((await call('CheckUsername', { username: 'alice' })).res, { available: true, problem: '' });
});

test('ChooseUsername needs a signed-in caller and never replaces an existing name', async () => {
  assert.equal((await setup().call('ChooseUsername', { username: 'alice' })).err.code, grpc.status.UNAUTHENTICATED);

  const has = setup({ caller: { userId: 'u1', email: 'a@example.com', username: 'Existing' } });
  assert.equal((await has.call('ChooseUsername', { username: 'alice' })).res.username, 'Existing');

  const fresh = setup({ caller: { userId: 'u2', email: 'b@example.com', username: null } });
  assert.equal((await fresh.call('ChooseUsername', { username: 'alice' })).res.username, 'alice');
  assert.equal(fresh.forgotten.length, 1);
});
