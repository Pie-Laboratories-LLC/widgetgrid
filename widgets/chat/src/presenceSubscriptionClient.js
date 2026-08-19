// Its own small gRPC-Web client, same reasoning as chatClient.js. Used to
// pick the empty-thread placeholder copy ("Say hello..." vs "Leave a
// message for Matt.") -- see ChatWidget.vue. Not owned by widgets/topbar
// anymore: the chat icon itself no longer greys out based on presence
// (chat works whether or not the owner is logged in), so topbar has no use
// for this: only this widget's own copy depends on it now.
import { SubscribeOwnerPresenceRequest } from '@widgetgrid/proto-gen-web/widgetgrid/v1/auth_pb.js';
import { AuthServicePromiseClient } from '@widgetgrid/proto-gen-web/widgetgrid/v1/auth_grpc_web_pb.js';

const GRPC_WEB_ORIGIN = import.meta.env.VITE_GRPC_WEB_ORIGIN ?? '';
const client = new AuthServicePromiseClient(GRPC_WEB_ORIGIN);

// Fixed, not exponential-backoff -- same reasoning as
// chatSubscriptionClient.js's identical constant.
const RECONNECT_DELAY_MS = 2000;

// Returns an unsubscribe function. onChange receives a plain boolean.
//
// Reconnects automatically on drop -- same reasoning as
// chatSubscriptionClient.js/blogSubscriptionClient.js: WidgetgridDevGatewayStack's
// ALB has a 60s idle timeout, and this stream can easily go quiet longer
// than that between owner login/logout events, silently going stale
// (stuck showing whatever "online" state it last saw) without this.
export function subscribeOwnerPresence(onChange) {
  let cancelled = false;
  let stream = null;
  let reconnectTimer = null;

  function scheduleReconnect() {
    // Guards against grpc-web firing both 'error' and 'end' for the same
    // disconnect and scheduling two reconnects -- same reasoning as
    // chatSubscriptionClient.js's identical guard.
    if (cancelled || reconnectTimer) return;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      connect();
    }, RECONNECT_DELAY_MS);
  }

  function connect() {
    stream = client.subscribeOwnerPresence(new SubscribeOwnerPresenceRequest(), {});
    stream.on('data', (event) => onChange(event.toObject().online));
    stream.on('error', scheduleReconnect);
    stream.on('end', scheduleReconnect);
  }

  connect();
  return () => {
    cancelled = true;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    stream.cancel();
  };
}
