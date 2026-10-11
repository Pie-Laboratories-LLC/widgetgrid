// Browser-side sign-in against the shared Cognito user pool
// (infra/cdk/lib/identity-stack.js): authorization code + PKCE through the
// hosted UI at auth.pie-laboratories.com, which hands off to IAM Identity
// Center. Shared by packages/web-app (completes the redirect) and every
// widget that makes authenticated calls (bundled into each; they all read
// and write the same localStorage entry, so any one of them can refresh).
import { RegisterSignInRequest, LogoutRequest } from '@widgetgrid/proto-gen-web/widgetgrid/v1/auth_pb.js';
import { AuthServicePromiseClient } from '@widgetgrid/proto-gen-web/widgetgrid/v1/auth_grpc_web_pb.js';

// Same pool and SPA client for every environment; the redirect URI is
// derived from the page's own origin (each one is registered on the client).
const AUTH_ORIGIN = 'https://auth.pie-laboratories.com';
const CLIENT_ID = 'bvec1bfa2e7srgjf237e2m3ja';
const IDENTITY_PROVIDER = 'IdentityCenter';
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

async function tokenRequest(params) {
  const response = await fetch(`${AUTH_ORIGIN}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: CLIENT_ID, ...params }),
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
// CALLBACK_PATH, where the web app calls completeSignIn().
let signInStarting = false;

export async function startSignIn() {
  if (signInStarting) return;
  signInStarting = true;
  const verifier = randomString(48);
  const challenge = base64url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)));
  const state = randomString(16);
  for (let i = localStorage.length - 1; i >= 0; i -= 1) {
    const key = localStorage.key(i);
    if (key?.startsWith(PKCE_PREFIX) && (JSON.parse(localStorage.getItem(key))?.startedAt ?? 0) < Date.now() - PKCE_TTL_MS) {
      localStorage.removeItem(key);
    }
  }
  localStorage.setItem(PKCE_PREFIX + state, JSON.stringify({
    verifier,
    startedAt: Date.now(),
    returnTo: window.location.pathname + window.location.search,
  }));
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: redirectUri(),
    scope: 'openid email profile',
    code_challenge: challenge,
    code_challenge_method: 'S256',
    identity_provider: IDENTITY_PROVIDER,
    state,
  });
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
  try {
    const code = url.searchParams.get('code');
    if (!code || pending.startedAt < Date.now() - PKCE_TTL_MS) {
      throw new Error(url.searchParams.get('error_description') ?? 'sign-in expired or was cancelled');
    }
    const tokens = await tokenRequest({
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
      sessionToken: '',
      role: 'member',
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
      const tokens = await tokenRequest({ grant_type: 'refresh_token', refresh_token: stored.refreshToken });
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
    };
  } catch {
    return null;
  }
}

// Local sign-out: forgets the tokens and ends the owner presence session.
// The Identity Center session stays, so the next sign-in skips the
// password prompt.
export async function signOut({ grpcWebOrigin = '' } = {}) {
  const stored = readStored();
  writeStored(null);
  announce();
  if (!stored?.sessionToken) return;
  try {
    const request = new LogoutRequest();
    request.setToken(stored.sessionToken);
    await new AuthServicePromiseClient(grpcWebOrigin).logout(request, {});
  } catch {
    // The presence row expires on its own; not worth surfacing.
  }
}
