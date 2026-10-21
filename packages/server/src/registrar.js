import crypto from 'node:crypto';
import {
  CognitoIdentityProviderClient, SignUpCommand, ConfirmSignUpCommand, ResendConfirmationCodeCommand,
} from '@aws-sdk/client-cognito-identity-provider';

// DI seam for creating a sign-in account -- same local-vs-real split as
// emailSender.js. createCognitoRegistrar() signs up in the shared user
// pool (infra/cdk/lib/identity-stack.js) through its registration app
// client, the only client the pool's pre-sign-up trigger accepts sign-ups
// from -- which is what keeps the captcha and username checks in
// accountService.js from being skipped by calling Cognito directly.
// Cognito itself emails the 6-digit verification code. createConsoleRegistrar()
// is local dev: nothing leaves the process, the code is printed instead.
//
// Every method throws RegistrarError with a `reason` the service maps to a
// message: email_taken | invalid_password | code_mismatch | code_expired |
// too_many_attempts | not_found.
export class RegistrarError extends Error {
  constructor(reason, message) {
    super(message ?? reason);
    this.reason = reason;
  }
}

const COGNITO_REASONS = {
  UsernameExistsException: 'email_taken',
  InvalidPasswordException: 'invalid_password',
  CodeMismatchException: 'code_mismatch',
  ExpiredCodeException: 'code_expired',
  TooManyRequestsException: 'too_many_attempts',
  TooManyFailedAttemptsException: 'too_many_attempts',
  LimitExceededException: 'too_many_attempts',
  UserNotFoundException: 'not_found',
};

// The pool signs in by email (UsernameAttributes=email), so the email *is*
// the Cognito username here -- unrelated to the site's own username.
export function createCognitoRegistrar({ clientId, clientSecret }) {
  const client = new CognitoIdentityProviderClient({});
  // The registration client has a secret, so every call proves it holds it.
  const secretHash = (email) => crypto.createHmac('sha256', clientSecret).update(email + clientId).digest('base64');

  async function call(command) {
    try {
      return await client.send(command);
    } catch (err) {
      const reason = COGNITO_REASONS[err.name];
      if (reason) throw new RegistrarError(reason, err.message);
      throw err;
    }
  }

  return {
    async signUp({ email, password }) {
      await call(new SignUpCommand({
        ClientId: clientId, SecretHash: secretHash(email), Username: email, Password: password,
        UserAttributes: [{ Name: 'email', Value: email }],
      }));
    },
    async confirm({ email, code }) {
      await call(new ConfirmSignUpCommand({
        ClientId: clientId, SecretHash: secretHash(email), Username: email, ConfirmationCode: code,
      }));
    },
    async resendCode({ email }) {
      await call(new ResendConfirmationCodeCommand({ ClientId: clientId, SecretHash: secretHash(email), Username: email }));
    },
  };
}

// Local stand-in: remembers sign-ups in memory and logs the code. An
// account "created" here exists nowhere else -- Cognito's hosted sign-in
// page has never heard of it -- so it's for exercising the registration
// pages, not for logging in afterwards.
export function createConsoleRegistrar() {
  const pending = new Map(); // email -> { code, confirmed }
  return {
    async signUp({ email, password }) {
      if (pending.get(email)?.confirmed) throw new RegistrarError('email_taken');
      if (password.length < 8) throw new RegistrarError('invalid_password', 'Password must be at least 8 characters.');
      const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
      pending.set(email, { code, confirmed: false });
      console.log(`[registrar] (local, not Cognito) verification code for ${email}: ${code}`);
    },
    async confirm({ email, code }) {
      const entry = pending.get(email);
      if (!entry) throw new RegistrarError('not_found');
      if (entry.code !== code) throw new RegistrarError('code_mismatch');
      entry.confirmed = true;
    },
    async resendCode({ email }) {
      const entry = pending.get(email);
      if (!entry || entry.confirmed) throw new RegistrarError('not_found');
      console.log(`[registrar] (local, not Cognito) verification code for ${email}: ${entry.code}`);
    },
  };
}
