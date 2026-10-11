import crypto from 'node:crypto';
import grpc from '@grpc/grpc-js';
import * as defaultAuthRepo from '@widgetgrid/db/src/authRepo.js';
import * as defaultUsersRepo from '@widgetgrid/db/src/usersRepo.js';
import { isOwnerOnline, subscribePresence } from '../presenceBus.js';

// Matches the SPA client's refresh-token lifetime (90 days, see
// infra/cdk/lib/identity-stack.js): a session record shouldn't outlive the
// browser's ability to stay signed in.
const SESSION_TTL_MS = 90 * 24 * 60 * 60 * 1000;

// ownerEmail: the one Identity Center email that gets role 'owner' on sign-in
// (OWNER_EMAIL, see index.js). Everyone else who signs in is a 'member'.
export function createAuthService({
  pool,
  verifyIdToken,
  ownerEmail,
  authRepo = defaultAuthRepo,
  usersRepo = defaultUsersRepo,
}) {
  return {
    async RegisterSignIn(call, callback) {
      let claims;
      try {
        claims = await verifyIdToken(call.request.idToken);
      } catch {
        callback({ code: grpc.status.UNAUTHENTICATED, message: 'invalid id token' });
        return;
      }
      try {
        const email = String(claims.email ?? '');
        const becomeOwner = !!ownerEmail && email.toLowerCase() === ownerEmail.toLowerCase();
        const user = await usersRepo.upsertOnSignIn(pool, { sub: claims.sub, email, becomeOwner });

        if (user.role !== 'owner') {
          callback(null, { sessionToken: '', role: user.role });
          return;
        }
        const sessionToken = crypto.randomBytes(32).toString('hex');
        await authRepo.createSession(pool, {
          token: sessionToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + SESSION_TTL_MS),
        });
        callback(null, { sessionToken, role: user.role });
      } catch (err) {
        callback({ code: grpc.status.INTERNAL, message: err.message });
      }
    },

    async Logout(call, callback) {
      try {
        // Presence follows the owner's open chat streams (presenceBus.js);
        // signing out closes this page's, so nothing to publish here.
        if (call.request.token) await authRepo.deleteSession(pool, call.request.token);
        callback(null, {});
      } catch (err) {
        callback({ code: grpc.status.INTERNAL, message: err.message });
      }
    },

    async SubscribeOwnerPresence(call) {
      // Current state immediately on subscribe, not just future changes --
      // otherwise the chat icon would stay greyed out until the owner next
      // came or went.
      call.write({ online: isOwnerOnline() });

      const unsubscribe = subscribePresence((nowOnline) => call.write({ online: nowOnline }));
      call.on('cancelled', unsubscribe);
    },
  };
}
