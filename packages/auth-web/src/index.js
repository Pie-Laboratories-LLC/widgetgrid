// Browser-side sign-in against the shared Cognito user pool
// (infra/cdk/lib/identity-stack.js): authorization code + PKCE through the
// hosted UI at auth.pie-laboratories.com. /site/login says which way in
// (identity_provider=): Cognito's own email + password form for people who
// registered on the site (/site/register), a social provider, or IAM
// Identity Center for staff. Shared by packages/web-app (completes the redirect) and every
// widget that makes authenticated calls (bundled into each; they all read
// and write the same localStorage entry, so any one of them can refresh).
import { RegisterSignInRequest, LogoutRequest } from '@widgetgrid/proto-gen-web/widgetgrid/v1/auth_pb.js';
import { AuthServicePromiseClient } from '@widgetgrid/proto-gen-web/widgetgrid/v1/auth_grpc_web_pb.js';

// The shared pool and SPA client, unless the build says otherwise -- a
// temporarily stood-up dev environment has its own pool
// (infra/cdk/lib/dev-identity-stack.js; infra/eks/deploy.sh passes these
// into the static image's build). The redirect URI is derived from the
// page's own origin (each one is registered on the client).
const AUTH_ORIGIN = import.meta.env.VITE_COGNITO_AUTH_ORIGIN || 'https://auth.pie-laboratories.com';
const CLIENT_ID = import.meta.env.VITE_COGNITO_SPA_CLIENT_ID || 'bvec1bfa2e7srgjf237e2m3ja';
// "Log in with email and password" signs in through a client that allows
// nothing else, so Cognito's page doesn't offer the social buttons all over
// again (EmailClient in infra/cdk/lib/identity-stack.js). Unset, it's
// CLIENT_ID. A sign-in remembers its client: refreshing and signing out
// must use the same one.
const EMAIL_CLIENT_ID = import.meta.env.VITE_COGNITO_EMAIL_CLIENT_ID || '';
export const CALLBACK_PATH = '/auth/callback';

const STORAGE_KEY = 'widgetgrid:auth';
// One entry per sign-in attempt, keyed by its state value, in localStorage
// rather than sessionStorage: two attempts started at once (a double-fired
// click handler) must not overwrite each other, and the round trip through
// Cognito and Identity Center must not lose it. Expired after 10 minutes.
const PKCE_PREFIX = 'widgetgrid:pkce:';
const PKCE_TTL_MS = 10 * 60 * 1000;
// Refresh this long before the access token actually expires, so a call
// started just before expiry doesn't arrive with a dead token.
const EXPIRY_SKEW_MS = 60 * 1000;

export const IDENTITY_CHANGED_EVENT = 'widgetgrid:identity-changed';

// Ways in, as Cognito names them (identity_provider=).
export const EMAIL_PROVIDER = 'COGNITO';
export const STAFF_PROVIDER = 'IdentityCenter';
// The social buttons /site/login shows, in order. Add one only once it's
// deployed on the pool (SOCIAL_CLIENT_IDS in infra/cdk/lib/social-login.js)
// -- before that Cognito refuses it.
export const SOCIAL_PROVIDERS = ['Google', 'Microsoft', 'LinkedIn'];

function clientFor(provider) {
  return provider === EMAIL_PROVIDER && EMAIL_CLIENT_ID ? EMAIL_CLIENT_ID : CLIENT_ID;
}

function redirectUri() {
  return `${window.location.origin}${CALLBACK_PATH}`;
}

function base64url(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function randomString(byteLength) {
  return base64url(crypto.getRandomValues(new Uint8Array(byteLength)));
}

function readStored() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? null;
  } catch {
    return null;
  }
}

function writeStored(value) {
  if (value) localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  else localStorage.removeItem(STORAGE_KEY);
}

function announce() {
  window.dispatchEvent(new CustomEvent(IDENTITY_CHANGED_EVENT));
}

// Another tab signing in or out changes the same localStorage entry; relay
// it as the same event this tab's widgets already listen for.
window.addEventListener('storage', (e) => {
  if (e.key === STORAGE_KEY) announce();
});

async function tokenRequest(clientId, params) {
  const response = await fetch(`${AUTH_ORIGIN}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: clientId, ...params }),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? `token endpoint ${response.status}`);
  return body;
}

function decodeClaims(jwt) {
  const part = jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(part), (c) => c.charCodeAt(0))));
}

// Starts sign-in: a full-page redirect to the hosted UI. Returns to
// CALLBACK_PATH, where the web app calls completeSignIn(), which then
// puts the address back to returnTo -- by default wherever this was
// called from (the login page passes the page the visitor came from).
// provider goes straight to that way in (see EMAIL_PROVIDER etc.);
// without one, Cognito's page offers every way the client allows.
let signInStarting = false;

// Coming back from the hosted page with the browser's Back button restores
// this page from the back/forward cache, flag and all -- which left "Log in"
// doing nothing until a reload.
window.addEventListener('pageshow', (e) => {
  if (e.persisted) signInStarting = false;
});

export async function startSignIn({ returnTo, provider, retried = false } = {}) {
  if (signInStarting) return;
  signInStarting = true;
  const verifier = randomString(48);
  const challenge = base64url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)));
  const state = randomString(16);
  const clientId = clientFor(provider);
  for (let i = localStorage.length - 1; i >= 0; i -= 1) {
    const key = localStorage.key(i);
    if (key?.startsWith(PKCE_PREFIX) && (JSON.parse(localStorage.getItem(key))?.startedAt ?? 0) < Date.now() - PKCE_TTL_MS) {
      localStorage.removeItem(key);
    }
  }
  localStorage.setItem(PKCE_PREFIX + state, JSON.stringify({
    verifier,
    startedAt: Date.now(),
    returnTo: returnTo ?? window.location.pathname + window.location.search,
    provider,
    clientId,
    retried,
  }));
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri(),
    scope: 'openid email profile',
    code_challenge: challenge,
    code_challenge_method: 'S256',
    state,
  });
  if (provider) params.set('identity_provider', provider);
  window.location.assign(`${AUTH_ORIGIN}/oauth2/authorize?${params}`);
}

export function isSignInCallback() {
  return window.location.pathname === CALLBACK_PATH;
}

// Finishes a sign-in on CALLBACK_PATH: exchanges the code, records the
// sign-in server-side (users row, owner presence), then puts the URL back
// where sign-in started. Never throws: a failed sign-in just leaves the
// visitor on the page they came from.
//
// Safe to run more than once for the same callback (observed on dev: a
// second run found the attempt already consumed). A repeat run whose state
// matches the sign-in already stored is a no-op, and a failure never
// clears an existing sign-in -- the earlier version did, which threw away
// the tokens the first run had just saved.
export async function completeSignIn({ grpcWebOrigin = '' } = {}) {
  if (window.top !== window) return;
  const url = new URL(window.location.href);
  const state = url.searchParams.get('state') ?? '';
  const pending = JSON.parse(localStorage.getItem(PKCE_PREFIX + state) ?? 'null');
  localStorage.removeItem(PKCE_PREFIX + state);

  if (!pending) {
    const existing = readStored();
    if (!(existing && existing.state === state)) {
      console.error('sign-in failed:', url.searchParams.get('error_description') ?? 'no pending sign-in for this callback');
    }
    window.history.replaceState(null, '', existing?.state === state ? existing.returnTo ?? '/' : '/');
    return;
  }

  const returnTo = pending.returnTo ?? '/';
  // A social sign-in that the pre-sign-up trigger has just joined to an
  // existing site account can fail once with "Already found an entry for
  // username Google_..." (infra/cdk/lambda/pre-sign-up); the second try
  // signs in. Done once, automatically, rather than leave them to guess.
  const error = url.searchParams.get('error_description') ?? '';
  if (pending.provider && !pending.retried && /already found an entry/i.test(error)) {
    await startSignIn({ returnTo, provider: pending.provider, retried: true });
    return;
  }
  try {
    const code = url.searchParams.get('code');
    if (!code || pending.startedAt < Date.now() - PKCE_TTL_MS) {
      throw new Error(url.searchParams.get('error_description') ?? 'sign-in expired or was cancelled');
    }
    const clientId = pending.clientId ?? CLIENT_ID;
    const tokens = await tokenRequest(clientId, {
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri(),
      code_verifier: pending.verifier,
    });
    const stored = {
      accessToken: tokens.access_token,
      idToken: tokens.id_token,
      refreshToken: tokens.refresh_token,
      expiresAt: Date.now() + tokens.expires_in * 1000,
      clientId,
      sessionToken: '',
      role: 'member',
      username: '',
      // Which callback produced this sign-in, so a repeat run of the same
      // callback recognises it's already done.
      state,
      returnTo,
    };
    const request = new RegisterSignInRequest();
    request.setIdToken(tokens.id_token);
    const response = await new AuthServicePromiseClient(grpcWebOrigin)
      .registerSignIn(request, { authorization: `Bearer ${tokens.access_token}` });
    stored.sessionToken = response.getSessionToken();
    stored.role = response.getRole();
    stored.username = response.getUsername();
    writeStored(stored);
    announce();
  } catch (err) {
    console.error('sign-in failed:', err);
  }
  window.history.replaceState(null, '', returnTo);
}

let refreshing = null;


// The current access token, refreshed first if it's about to expire, or
// null when signed out (including when the refresh token itself has
// expired, which signs the browser out).
export async function getAccessToken() {
  const stored = readStored();
  if (!stored) return null;
  if (stored.expiresAt - EXPIRY_SKEW_MS > Date.now()) return stored.accessToken;

  refreshing ??= (async () => {
    try {
      // Sign-ins from before there were two clients have none recorded.
      const tokens = await tokenRequest(stored.clientId ?? CLIENT_ID, {
        grant_type: 'refresh_token', refresh_token: stored.refreshToken,
      });
      const next = {
        ...stored,
        accessToken: tokens.access_token,
        idToken: tokens.id_token,
        expiresAt: Date.now() + tokens.expires_in * 1000,
      };
      writeStored(next);
      return next.accessToken;
    } catch {
      writeStored(null);
      announce();
      return null;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

// gRPC-Web metadata for an authenticated call; empty when signed out.
export async function authMetadata() {
  const token = await getAccessToken();
  return token ? { authorization: `Bearer ${token}` } : {};
}

// Who's signed in, for UI decisions only (what to show). Read from the
// stored ID token without verifying it -- the server verifies every call.
export function getIdentity() {
  const stored = readStored();
  if (!stored) return null;
  try {
    const claims = decodeClaims(stored.idToken);
    return {
      email: claims.email,
      groups: claims['cognito:groups'] ?? [],
      role: stored.role,
      // '' until chosen (see proto/widgetgrid/v1/account.proto).
      username: stored.username ?? '',
    };
  } catch {
    return null;
  }
}

// Records the username just chosen (AccountService.ChooseUsername) on the
// stored sign-in, so getIdentity() has it without signing in again.
export function setUsername(username) {
  const stored = readStored();
  if (!stored) return;
  writeStored({ ...stored, username });
  announce();
}

// Forgets the tokens, ends the owner presence session, then ends the
// hosted sign-in page's own session too and comes back to the home page.
// Without that last step the next "Log in" sailed straight through as
// whoever signed in last -- wrong on a shared computer, and no way to
// switch accounts. Staying signed in between visits is the refresh token,
// untouched by any of this. (An Identity Center session outlives it, so
// that button still signs in without a password.)
export async function signOut({ grpcWebOrigin = '' } = {}) {
  const stored = readStored();
  writeStored(null);
  announce();
  if (stored?.sessionToken) {
    try {
      const request = new LogoutRequest();
      request.setToken(stored.sessionToken);
      await new AuthServicePromiseClient(grpcWebOrigin).logout(request, {});
    } catch {
      // The presence row expires on its own; not worth surfacing.
    }
  }
  // logout_uri must be one of the client's registered logout URLs, which
  // are each origin's "/".
  const params = new URLSearchParams({ client_id: stored?.clientId ?? CLIENT_ID, logout_uri: `${window.location.origin}/` });
  window.location.assign(`${AUTH_ORIGIN}/logout?${params}`);
}
