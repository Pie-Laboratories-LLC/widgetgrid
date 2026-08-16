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

// Returns an unsubscribe function. onChatEvent receives a plain
// { chatId, message, isNewChat, chatLabel } object per event. Subscribed
// once here for the page's whole lifetime (see MainWidget.vue's 'created'
// hook, same reasoning as its blog subscription) -- the server filters by
// visitor_id internally (see chatBus.js/chatService.js), so this is safe
// to open before the visitor has ever started a chat.
export function subscribeChatEvents(onChatEvent) {
  const stream = client.subscribeChatEvents(new SubscribeChatEventsRequest(), identityMetadata());
  stream.on('data', (event) => onChatEvent(event.toObject()));
  // Same "no reconnect/backoff loop" call as blogSubscriptionClient.js,
  // and the same known local-k8s mesh limitation applies here too.
  return () => stream.cancel();
}
