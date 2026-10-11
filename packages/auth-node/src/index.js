import { CognitoJwtVerifier } from 'aws-jwt-verify';
import * as usersRepo from '@widgetgrid/db/src/usersRepo.js';

// The shared widgetgrid user pool (infra/cdk/lib/identity-stack.js). Same
// pool and SPA client for dev, prod and local -- env overrides exist only
// for pointing a test environment somewhere else.
export const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID || 'us-east-1_DC0Ukf8jA';
export const COGNITO_SPA_CLIENT_ID = process.env.COGNITO_SPA_CLIENT_ID || 'bvec1bfa2e7srgjf237e2m3ja';

// Verifiers fetch the pool's JWKS once and cache it; verification after
// that is local crypto, no network round trip per call.
export function createCognitoVerifiers({ userPoolId = COGNITO_USER_POOL_ID, clientId = COGNITO_SPA_CLIENT_ID } = {}) {
  const access = CognitoJwtVerifier.create({ userPoolId, clientId, tokenUse: 'access' });
  const id = CognitoJwtVerifier.create({ userPoolId, clientId, tokenUse: 'id' });
  return {
    verifyAccessToken: (token) => access.verify(token),
    verifyIdToken: (token) => id.verify(token),
  };
}

// How long a resolved caller is reused for the same token -- saves a
// users-table lookup on every call of a burst, short enough that a role
// change lands within a minute.
const CALLER_CACHE_MS = 60 * 1000;

// Resolves "authorization: Bearer <access token>" on a gRPC call to the
// signed-in caller, or null for an anonymous caller (no header, a bad or
// expired token, or a user who never completed widgetgrid-server's
// RegisterSignIn). Callers decide what anonymous means for them --
// widgetgrid-server's chat falls back to the visitor-id header,
// lhoraire-server rejects the call.
export function createAuthContext({ pool, verifyAccessToken, users = usersRepo }) {
  const cache = new Map();

  async function getCaller(call) {
    const header = call.metadata.get('authorization')[0];
    if (!header || !header.startsWith('Bearer ')) return null;
    const token = header.slice('Bearer '.length);

    const hit = cache.get(token);
    if (hit && hit.until > Date.now()) return hit.caller;

    let claims;
    try {
      claims = await verifyAccessToken(token);
    } catch {
      return null;
    }
    const user = await users.findBySub(pool, claims.sub);
    if (!user) return null;
    const caller = {
      userId: user.id,
      sub: user.cognito_sub,
      email: user.email,
      role: user.role,
      groups: claims['cognito:groups'] ?? [],
    };
    // Never cache past the token's own expiry.
    cache.set(token, { caller, until: Math.min(Date.now() + CALLER_CACHE_MS, claims.exp * 1000) });
    if (cache.size > 1000) cache.delete(cache.keys().next().value);
    return caller;
  }

  return {
    getCaller,
    async isOwner(call) {
      return (await getCaller(call))?.role === 'owner';
    },
  };
}

// IAM Identity Center group names, as they arrive in cognito:groups.
export const GROUP_USERS = 'anonyme users';
export const GROUP_ADMINS = 'anonyme admins';
