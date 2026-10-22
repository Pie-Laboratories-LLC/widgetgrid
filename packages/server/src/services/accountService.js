import grpc from '@grpc/grpc-js';
import * as defaultUsernames from '@widgetgrid/db/src/usernamesRepo.js';
import { RegistrarError } from '../registrar.js';
import { NO_ASSIGNED_USERNAMES } from '../siteAccounts.js';

// How long a username reserved at registration is held for the email that
// reserved it -- time enough to find the code and sign in for the first
// time (RegisterSignIn claims it then).
export const RESERVATION_TTL_MS = 24 * 60 * 60 * 1000;

const USERNAME_PATTERN = /^[A-Za-z0-9_-]{3,20}$/;
const USERNAME_RULES = 'Usernames are 3-20 characters: letters, digits, _ or -.';
// Names that would read as speaking for the site.
const RESERVED_USERNAMES = new Set([
  'admin', 'administrator', 'moderator', 'mod', 'webmaster', 'root', 'system', 'support', 'staff', 'owner',
  'pie', 'pielabs', 'pie-labs', 'pie_labs', 'pielaboratories', 'pie-laboratories', 'anonyme',
]);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// A sentence for the form, or null when the name is acceptable as typed
// (availability is a separate question). A name assigned to an address
// (siteAccounts.js) is acceptable only for that address, reserved list or
// not.
export function usernameProblem(username, { email = '', assigned = NO_ASSIGNED_USERNAMES } = {}) {
  if (!USERNAME_PATTERN.test(username)) return USERNAME_RULES;
  const assignedTo = assigned.ownerOf(username);
  if (assignedTo) return assignedTo === String(email).trim().toLowerCase() ? null : 'That username is reserved.';
  if (RESERVED_USERNAMES.has(username.toLowerCase())) return 'That username is reserved.';
  return null;
}

const REGISTRAR_MESSAGES = {
  email_taken: 'An account with that email already exists. Try logging in instead.',
  code_mismatch: "That code isn't right. Check the email and try again.",
  code_expired: 'That code has expired. Send a new one and try again.',
  too_many_attempts: 'Too many attempts. Wait a few minutes and try again.',
  not_found: 'There is no registration waiting for that email. Register again.',
};

class FormError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

// See proto/widgetgrid/v1/account.proto.
export function createAccountService({
  pool, authContext, registrar, captcha, usernames = defaultUsernames,
  assigned = NO_ASSIGNED_USERNAMES, now = () => Date.now(),
}) {
  const reservedAfter = () => new Date(now() - RESERVATION_TTL_MS);

  // Every handler: FormErrors and registrar failures become the matching
  // gRPC status with a message the form can show as is; anything else is
  // logged and reported generically.
  const handle = (fn) => async (call, callback) => {
    try {
      callback(null, await fn(call.request, call));
    } catch (err) {
      if (err instanceof FormError) {
        callback({ code: err.code, message: err.message });
      } else if (err instanceof RegistrarError) {
        const code = err.reason === 'email_taken' ? grpc.status.ALREADY_EXISTS
          : err.reason === 'too_many_attempts' ? grpc.status.RESOURCE_EXHAUSTED
            : grpc.status.INVALID_ARGUMENT;
        // Cognito's own wording for a weak password names the actual rule
        // that failed -- pass it through.
        callback({ code, message: err.reason === 'invalid_password' ? passwordMessage(err.message) : REGISTRAR_MESSAGES[err.reason] });
      } else {
        console.error('[accountService] failed:', err);
        callback({ code: grpc.status.INTERNAL, message: 'Something went wrong. Please try again later.' });
      }
    }
  };

  const normalizeEmail = (raw) => {
    const email = String(raw ?? '').trim().toLowerCase();
    if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
      throw new FormError(grpc.status.INVALID_ARGUMENT, "That doesn't look like an email address.");
    }
    return email;
  };

  const checkUsername = async (username, email = '') => {
    const problem = usernameProblem(username, { email, assigned });
    if (problem) return { available: false, problem };
    if (!(await usernames.isAvailable(pool, { username, email, reservedAfter: reservedAfter() }))) {
      return { available: false, problem: 'That username is taken.' };
    }
    return { available: true, problem: '' };
  };

  return {
    // The form sends the email when it has one, so an address's assigned
    // name shows as available to it.
    CheckUsername: handle(async ({ username, email }) => checkUsername(
      String(username ?? '').trim(), String(email ?? '').trim().toLowerCase(),
    )),

    Register: handle(async (request) => {
      const email = normalizeEmail(request.email);
      // An address with an assigned name gets it whatever was typed.
      const username = assigned.forEmail(email) ?? String(request.username ?? '').trim();
      const password = String(request.password ?? '');
      const { available, problem } = await checkUsername(username, email);
      if (!available) {
        throw new FormError(problem === 'That username is taken.' ? grpc.status.ALREADY_EXISTS : grpc.status.INVALID_ARGUMENT, problem);
      }
      if (password.length < 8) throw new FormError(grpc.status.INVALID_ARGUMENT, 'Passwords need at least 8 characters.');
      if (!(await captcha.verify(request.captchaToken))) {
        throw new FormError(grpc.status.PERMISSION_DENIED, 'The captcha check failed. Please try again.');
      }
      if (!(await usernames.reserve(pool, { username, email, reservedAfter: reservedAfter() }))) {
        throw new FormError(grpc.status.ALREADY_EXISTS, 'That username is taken.');
      }
      await registrar.signUp({ email, password });
      return {};
    }),

    ConfirmRegistration: handle(async (request) => {
      const code = String(request.code ?? '').trim();
      if (!/^\d{6}$/.test(code)) throw new FormError(grpc.status.INVALID_ARGUMENT, 'The code is the 6 digits from the email.');
      await registrar.confirm({ email: normalizeEmail(request.email), code });
      return {};
    }),

    ResendRegistrationCode: handle(async (request) => {
      await registrar.resendCode({ email: normalizeEmail(request.email) });
      return {};
    }),

    ChooseUsername: handle(async (request, call) => {
      const caller = await authContext.getCaller(call);
      if (!caller) throw new FormError(grpc.status.UNAUTHENTICATED, 'Log in first.');
      if (caller.username) return { username: caller.username };
      const username = assigned.forEmail(caller.email) ?? String(request.username ?? '').trim();
      const problem = usernameProblem(username, { email: caller.email, assigned });
      if (problem) throw new FormError(grpc.status.INVALID_ARGUMENT, problem);
      const claimed = await usernames.claimForUser(pool, {
        userId: caller.userId, username, email: caller.email, reservedAfter: reservedAfter(),
      });
      if (!claimed) throw new FormError(grpc.status.ALREADY_EXISTS, 'That username is taken.');
      authContext.forget?.(call);
      return { username: claimed };
    }),
  };
}

// Cognito's InvalidPasswordException reads "Password did not conform with
// policy: Password must have uppercase characters" -- keep the useful half.
function passwordMessage(message) {
  const detail = /policy: (.+)$/.exec(message ?? '')?.[1];
  return detail ? `${detail.replace(/\.?$/, '.')}` : 'That password is too weak. Use at least 8 characters with upper and lower case letters, a digit and a symbol.';
}
