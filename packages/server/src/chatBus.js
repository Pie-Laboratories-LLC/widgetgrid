import { EventEmitter } from 'node:events';

// In-process pub/sub for new chats/messages -- same reasoning as
// presenceBus.js: chatService.js is the thing handling the request that
// creates the event, so it publishes directly rather than anything
// polling for a change.
//
// Events carry visitor_id internally (not part of ChatEvent in chat.proto)
// so SubscribeChatEvents can filter by "is this event for this visitor's
// chat" without ever needing to know the chat's id in advance -- a widget
// can subscribe before that visitor has started a chat at all (see
// widgets/main's chatSubscriptionClient.js, which subscribes once at page
// load) and still get every event for that visitor's chat as soon as one
// exists, no resubscribe required.
const emitter = new EventEmitter();
emitter.setMaxListeners(0); // one subscriber per connected browser tab, no fixed cap

export function publishChatEvent(event) {
  emitter.emit('chat-event', event);
}

export function subscribeChatEvents(onEvent) {
  emitter.on('chat-event', onEvent);
  return () => emitter.off('chat-event', onEvent);
}
