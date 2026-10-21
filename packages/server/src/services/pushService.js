import grpc from '@grpc/grpc-js';
import * as defaultRepo from '@widgetgrid/db/src/pushSubscriptionsRepo.js';

// Registration side of Web Push (pushSender.js does the sending). Only the
// owner registers browsers today -- the only notifications are owner chat
// alerts.
export function createPushService({ pool, authContext, pushSender, deviceActivity, repo = defaultRepo }) {
  async function requireOwner(call) {
    const caller = await authContext.getCaller(call);
    if (caller?.role !== 'owner') {
      const err = new Error('owner only');
      err.code = grpc.status.PERMISSION_DENIED;
      throw err;
    }
    return caller;
  }

  function fail(callback, err) {
    callback({ code: err.code ?? grpc.status.INTERNAL, message: err.message });
  }

  return {
    async GetPushConfig(call, callback) {
      callback(null, { vapidPublicKey: pushSender.publicKey });
    },

    async RegisterPushSubscription(call, callback) {
      try {
        const caller = await requireOwner(call);
        const { endpoint, p256dh, auth, userAgent } = call.request;
        if (!endpoint.startsWith('https://') || !p256dh || !auth) {
          callback({ code: grpc.status.INVALID_ARGUMENT, message: 'incomplete subscription' });
          return;
        }
        await repo.upsert(pool, { userId: caller.userId, endpoint, p256dh, auth, userAgent: userAgent.slice(0, 500) });
        callback(null, {});
      } catch (err) {
        fail(callback, err);
      }
    },

    async RemovePushSubscription(call, callback) {
      try {
        await requireOwner(call);
        await repo.removeByEndpoint(pool, call.request.endpoint);
        callback(null, {});
      } catch (err) {
        fail(callback, err);
      }
    },

    async ReportActivity(call, callback) {
      try {
        await requireOwner(call);
        const { endpoint, tabId, active } = call.request;
        if (!endpoint || !tabId) {
          callback({ code: grpc.status.INVALID_ARGUMENT, message: 'endpoint and tab_id are required' });
          return;
        }
        deviceActivity.report(endpoint, tabId, active);
        callback(null, {});
      } catch (err) {
        fail(callback, err);
      }
    },

    async SendTestPush(call, callback) {
      try {
        await requireOwner(call);
        const delivered = await pushSender.sendToOwner({
          title: 'Pie Laboratories',
          body: 'Test notification: push is working.',
          tag: 'test',
          url: '/chat',
        });
        callback(null, { delivered });
      } catch (err) {
        fail(callback, err);
      }
    },
  };
}
