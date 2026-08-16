import crypto from 'node:crypto';
import grpc from '@grpc/grpc-js';
import * as authRepo from '@widgetgrid/db/src/authRepo.js';
import { publishPresence, subscribePresence } from '../presenceBus.js';

const CODE_TTL_MS = 5 * 60 * 1000;
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days -- "just me", not worth re-texting a code every session

function hashCode(code) {
  return crypto.createHash('sha256').update(code).digest('hex');
}

export function createAuthService({ pool, ownerPhoneNumber, otpSender }) {
  return {
    async RequestLoginCode(call, callback) {
      try {
        const code = String(crypto.randomInt(100_000, 1_000_000));
        await authRepo.createLoginCode(pool, {
          codeHash: hashCode(code),
          expiresAt: new Date(Date.now() + CODE_TTL_MS),
        });
        await otpSender.send(ownerPhoneNumber, code);
        callback(null, {});
      } catch (err) {
        callback({ code: grpc.status.INTERNAL, message: err.message });
      }
    },

    async VerifyLoginCode(call, callback) {
      try {
        const latest = await authRepo.findLatestActiveLoginCode(pool);
        if (!latest) {
          callback(null, { token: '' });
          return;
        }
        // Consumed regardless of match -- see authRepo.js's comment on
        // findLatestActiveLoginCode for why this, not a hash-match lookup,
        // is what makes a wrong guess actually cost something.
        await authRepo.consumeLoginCode(pool, latest.id);
        if (hashCode(call.request.code) !== latest.code_hash) {
          callback(null, { token: '' });
          return;
        }

        const token = crypto.randomBytes(32).toString('hex');
        await authRepo.createSession(pool, { token, expiresAt: new Date(Date.now() + SESSION_TTL_MS) });
        publishPresence(true);
        callback(null, { token });
      } catch (err) {
        callback({ code: grpc.status.INTERNAL, message: err.message });
      }
    },

    async Logout(call, callback) {
      try {
        await authRepo.deleteSession(pool, call.request.token);
        // hasActiveSession, not a flat "false": another device could still
        // be logged in (unlikely for "just me", but cheap to get right).
        publishPresence(await authRepo.hasActiveSession(pool));
        callback(null, {});
      } catch (err) {
        callback({ code: grpc.status.INTERNAL, message: err.message });
      }
    },

    async SubscribeOwnerPresence(call) {
      // Current state immediately on subscribe, not just future changes --
      // otherwise a page loaded while already logged in elsewhere would
      // show the chat icon greyed out until the next login/logout.
      const online = await authRepo.hasActiveSession(pool);
      call.write({ online });

      const unsubscribe = subscribePresence((nowOnline) => call.write({ online: nowOnline }));
      call.on('cancelled', unsubscribe);
    },
  };
}
