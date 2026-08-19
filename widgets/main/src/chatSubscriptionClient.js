// Its own small gRPC-Web client, same reasoning as blogSubscriptionClient.js.
import { SubscribeChatEventsRequest } from '@widgetgrid/proto-gen-web/widgetgrid/v1/chat_pb.js';
import { ChatServicePromiseClient } from '@widgetgrid/proto-gen-web/widgetgrid/v1/chat_grpc_web_pb.js';

const GRPC_WEB_ORIGIN = import.meta.env.VITE_GRPC_WEB_ORIGIN ?? '';
const client = new ChatServicePromiseClient(GRPC_WEB_ORIGIN);

// Same localStorage keys widgets/chat and widgets/login use -- see
// widgets/chat/src/chatClient.js's comment on why there's no shared
// module to hold these constants in instead.
const TOKEN_KEY = 'widgetgrid:ownerToken';
const VISITOR_ID_KEY = 'widgetgrid:visitorId';

function identityMetadata() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) return { authorization: `Bearer ${token}` };
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  return { 'visitor-id': visitorId };
}

// Reconnect delay for a dropped stream (see subscribeChatEvents below) --
// fixed, not exponential-backoff: this reconnects to our own ALB/mesh, not
// a third-party API with rate limits worth backing off from, so a short
// fixed delay is simpler and still avoids hammering on a persistent outage.
const RECONNECT_DELAY_MS = 2000;

// Returns an unsubscribe function. onChatEvent receives a plain
// { chatId, message, isNewChat, chatLabel } object per event. Subscribed
// once here for the page's whole lifetime (see MainWidget.vue's 'created'
// hook, same reasoning as its blog subscription) -- the server filters by
// visitor_id internally (see chatBus.js/chatService.js), so this is safe
// to open before the visitor has ever started a chat.
//
// Reconnects automatically on drop -- confirmed the hard way that this
// isn't just a local-k8s mesh-timeout concern (this file used to have no
// reconnect logic at all, same reasoning as blogSubscriptionClient.js's
// comment on that): WidgetgridDevGatewayStack's ALB has a 60s idle
// timeout, unmodified from the AWS default, and this stream carries no
// traffic at all while a conversation is quiet. Past that idle window the
// ALB silently closes the connection -- messages sent after that keep
// landing in Postgres and reaching ListMessages/ListChats fine, they just
// never arrive live, which is exactly the "have to switch views and back
// to see it" symptom this was reported as.
export function subscribeChatEvents(onChatEvent) {
  let cancelled = false;
  let stream = null;
  let reconnectTimer = null;

  function scheduleReconnect() {
    // The reconnectTimer guard matters here specifically: grpc-web can
    // fire both 'error' and 'end' for the same disconnect, and without
    // this, that would schedule two reconnects and end up with two live
    // streams both calling onChatEvent for every future event.
    if (cancelled || reconnectTimer) return;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      connect();
    }, RECONNECT_DELAY_MS);
  }

  function connect() {
    stream = client.subscribeChatEvents(new SubscribeChatEventsRequest(), identityMetadata());
    stream.on('data', (event) => onChatEvent(event.toObject()));
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
