import crypto from 'node:crypto';
import grpc from '@grpc/grpc-js';
import * as defaultRepo from '@widgetgrid/db/src/emailSubscriptionsRepo.js';
import { confirmationEmail } from '../subscriptionEmails.js';

// How long a confirmation link works, and how often one address can be
// sent another -- the form takes any address, so without the throttle it
// could be used to flood someone's inbox.
export const CONFIRM_TTL_MS = 3 * 24 * 60 * 60 * 1000;
const RESEND_THROTTLE_MS = 3 * 60 * 60 * 1000;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function newToken() {
  return crypto.randomBytes(32).toString('base64url');
}

// Email updates on new posts -- see proto/widgetgrid/v1/subscription.proto.
// The emails themselves go out from postMailer.js.
export function createSubscriptionService({
  pool, authContext, emailSender, captcha, siteOrigin, repo = defaultRepo, now = () => Date.now(),
}) {
  return {
    async Subscribe(call, callback) {
      try {
        const email = String(call.request.email ?? '').trim().toLowerCase();
        if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
          callback({ code: grpc.status.INVALID_ARGUMENT, message: "That doesn't look like an email address." });
          return;
        }

        // Signed in and subscribing their own account address, which
        // they've already proved, so no confirmation round trip.
        const caller = await authContext.getCaller(call);
        if (caller && caller.emailVerified !== false && caller.email.toLowerCase() === email) {
          await repo.upsertActive(pool, { email, userId: caller.userId, unsubscribeToken: newToken() });
          callback(null, { outcome: 'subscribed' });
          return;
        }

        if (!(await captcha.verify(call.request.captchaToken))) {
          callback({ code: grpc.status.PERMISSION_DENIED, message: 'The captcha check failed. Please try again.' });
          return;
        }

        // From here on the answer is "confirmation_sent" whatever happens,
        // so the form doesn't reveal who's subscribed.
        const existing = await repo.findByEmail(pool, email);
        const recentlySent = existing?.confirm_sent_at
          && now() - new Date(existing.confirm_sent_at).getTime() < RESEND_THROTTLE_MS;
        if (existing?.status === 'active' || recentlySent) {
          callback(null, { outcome: 'confirmation_sent' });
          return;
        }

        const confirmToken = newToken();
        const row = await repo.upsertPending(pool, {
          email, confirmTokenHash: hashToken(confirmToken), unsubscribeToken: newToken(),
        });
        if (row) {
          await emailSender.send(confirmationEmail({
            siteOrigin, to: email, confirmToken, expiresInDays: CONFIRM_TTL_MS / (24 * 60 * 60 * 1000),
          }));
        }
        callback(null, { outcome: 'confirmation_sent' });
      } catch (err) {
        console.error('[subscriptionService] Subscribe failed:', err);
        callback({ code: grpc.status.INTERNAL, message: 'Something went wrong. Please try again later.' });
      }
    },

    async ConfirmSubscription(call, callback) {
      try {
        const row = await repo.confirm(pool, {
          confirmTokenHash: hashToken(String(call.request.token ?? '')),
          sentAfter: new Date(now() - CONFIRM_TTL_MS),
        });
        if (!row) {
          callback({ code: grpc.status.NOT_FOUND, message: 'This confirmation link has expired or was already used.' });
          return;
        }
        callback(null, { email: row.email });
      } catch (err) {
        callback({ code: grpc.status.INTERNAL, message: err.message });
      }
    },

    async Unsubscribe(call, callback) {
      try {
        const row = await repo.removeByUnsubscribeToken(pool, String(call.request.token ?? ''));
        callback(null, { email: row?.email ?? '' });
      } catch (err) {
        callback({ code: grpc.status.INTERNAL, message: err.message });
      }
    },
  };
}
