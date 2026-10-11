import crypto from 'node:crypto';
import grpc from '@grpc/grpc-js';
import * as defaultAuthRepo from '@widgetgrid/db/src/authRepo.js';
import * as defaultUsersRepo from '@widgetgrid/db/src/usersRepo.js';
import { publishPresence, subscribePresence } from '../presenceBus.js';

// Matches the SPA client's refresh-token lifetime (Cognito default, 30
// days): a presence session shouldn't outlive the browser's ability to
// stay signed in.
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

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
        publishPresence(true);
        callback(null, { sessionToken, role: user.role });
      } catch (err) {
        callback({ code: grpc.status.INTERNAL, message: err.message });
      }
    },

    async Logout(call, callback) {
      try {
        if (call.request.token) await authRepo.deleteSession(pool, call.request.token);
        // hasActiveSession, not a flat "false": another device could still
        // be signed in.
        publishPresence(await authRepo.hasActiveSession(pool));
        callback(null, {});
      } catch (err) {
        callback({ code: grpc.status.INTERNAL, message: err.message });
      }
    },

    async SubscribeOwnerPresence(call) {
      // Current state immediately on subscribe, not just future changes --
      // otherwise a page loaded while already signed in elsewhere would
      // show the chat icon greyed out until the next sign-in/out.
      const online = await authRepo.hasActiveSession(pool);
      call.write({ online });

      const unsubscribe = subscribePresence((nowOnline) => call.write({ online: nowOnline }));
      call.on('cancelled', unsubscribe);
    },
  };
}
