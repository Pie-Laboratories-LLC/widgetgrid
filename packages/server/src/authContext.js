import * as authRepo from '@widgetgrid/db/src/authRepo.js';

// Reads the "authorization: Bearer <token>" metadata header grpc-web
// attaches per-call (see widgets/chat's client) and checks it against
// owner_sessions. Returns a boolean rather than throwing -- callers decide
// what an unauthorized owner-only call should do (chatService.js's
// owner-only RPCs reject with PERMISSION_DENIED).
export async function isOwnerRequest(pool, call) {
  const header = call.metadata.get('authorization')[0];
  if (!header || !header.startsWith('Bearer ')) return false;
  const token = header.slice('Bearer '.length);
  const session = await authRepo.findValidSession(pool, token);
  return !!session;
}

// The browser-generated localStorage UUID identifying a visitor's browser
// (see widgets/chat) -- there's no account behind it, this header *is*
// the identity, same trust level a session cookie would carry here.
export function getVisitorId(call) {
  return call.metadata.get('visitor-id')[0] ?? null;
}
