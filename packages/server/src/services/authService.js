import crypto from 'node:crypto';
import grpc from '@grpc/grpc-js';
import * as defaultAuthRepo from '@widgetgrid/db/src/authRepo.js';
import * as defaultUsersRepo from '@widgetgrid/db/src/usersRepo.js';
import * as defaultUsernamesRepo from '@widgetgrid/db/src/usernamesRepo.js';
import { RESERVATION_TTL_MS } from './accountService.js';
import { NO_ASSIGNED_USERNAMES, emailIsVerified } from '../siteAccounts.js';
import { isOwnerOnline, subscribePresence } from '../presenceBus.js';

// Matches the SPA client's refresh-token lifetime (90 days, see
// infra/cdk/lib/identity-stack.js): a session record shouldn't outlive the
// browser's ability to stay signed in.
const SESSION_TTL_MS = 90 * 24 * 60 * 60 * 1000;

// ownerEmails: the addresses that get role 'owner' on sign-in (OWNER_EMAIL,
// see siteAccounts.js). Everyone else who signs in is a 'member'.
// assigned: names that belong to particular addresses (siteAccounts.js).
export function createAuthService({
  pool,
  verifyIdToken,
  ownerEmails = [],
  assigned = NO_ASSIGNED_USERNAMES,
  authRepo = defaultAuthRepo,
  usersRepo = defaultUsersRepo,
  usernamesRepo = defaultUsernamesRepo,
  now = () => Date.now(),
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
        // An unproved address earns nothing by matching (siteAccounts.js).
        const emailVerified = emailIsVerified(claims);
        const becomeOwner = emailVerified && ownerEmails.includes(email.toLowerCase());
        const user = await usersRepo.upsertOnSignIn(pool, { sub: claims.sub, email, emailVerified, becomeOwner });

        // First sign-in after registering: the username reserved then
        // (accountService.js's Register) becomes theirs now that the row
        // exists. An address with an assigned name gets that instead, even
        // without a reservation (Identity Center, or one that lapsed). No
        // reservation otherwise leaves it empty -- they choose one when
        // it's needed.
        let username = user.username ?? '';
        if (!username && emailVerified) {
          const reservedAfter = new Date(now() - RESERVATION_TTL_MS);
          const reserved = assigned.forEmail(email)
            ?? await usernamesRepo.findReservationByEmail(pool, { email, reservedAfter });
          if (reserved) {
            username = await usernamesRepo.claimForUser(pool, { userId: user.id, username: reserved, email, reservedAfter }) ?? '';
          }
        }

        if (user.role !== 'owner') {
          callback(null, { sessionToken: '', role: user.role, username });
          return;
        }
        const sessionToken = crypto.randomBytes(32).toString('hex');
        await authRepo.createSession(pool, {
          token: sessionToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + SESSION_TTL_MS),
        });
        callback(null, { sessionToken, role: user.role, username });
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
