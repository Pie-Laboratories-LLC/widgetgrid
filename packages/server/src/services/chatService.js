import grpc from '@grpc/grpc-js';
import * as chatRepo from '@widgetgrid/db/src/chatRepo.js';
import * as authRepo from '@widgetgrid/db/src/authRepo.js';
import * as chatNotificationRepo from '@widgetgrid/db/src/chatNotificationRepo.js';
import { isOwnerRequest, getVisitorId } from '../authContext.js';
import { publishChatEvent, subscribeChatEvents } from '../chatBus.js';

// "not more than once an hour" -- a global throttle (not per-chat): the
// point is protecting the owner's phone from being spammed, not making
// sure every individual conversation gets its own text.
const NOTIFICATION_THROTTLE_MS = 60 * 60 * 1000;

function toProtoChat(row) {
  return {
    id: row.id,
    label: row.label,
    hasUnread: !!row.has_unread,
    createdAt: row.created_at.toISOString(),
  };
}

function toProtoMessage(row) {
  return {
    id: row.id,
    chatId: row.chat_id,
    sender: row.sender,
    body: row.body,
    createdAt: row.created_at.toISOString(),
  };
}

function invalidArgument(callback, message) {
  callback({ code: grpc.status.INVALID_ARGUMENT, message });
}

function permissionDenied(callback, message) {
  callback({ code: grpc.status.PERMISSION_DENIED, message });
}

export function createChatService({ pool, ownerPhoneNumber, smsSender }) {
  // Confirms a visitor-supplied chat_id actually belongs to them --
  // without this, any visitor could read/post into any chat by guessing a
  // UUID (chat_id is always explicit in every RPC, even visitor calls --
  // see chat.proto's header comment for why).
  async function assertVisitorOwnsChat(chatId, visitorId) {
    const chat = await chatRepo.findById(pool, chatId);
    if (!chat || chat.visitor_id !== visitorId) {
      const err = new Error('not your chat');
      err.code = grpc.status.PERMISSION_DENIED;
      throw err;
    }
    return chat;
  }

  // "If I'm not logged in, I'd like to be texted... but not more than once
  // an hour" -- checked (and, on a send, recorded) here rather than
  // unconditionally, since the owner being logged in already means they'll
  // see this live in the browser (badge/list), no text needed.
  async function notifyOwnerIfOffline(chat, body) {
    if (await authRepo.hasActiveSession(pool)) return;
    const throttleCutoff = new Date(Date.now() - NOTIFICATION_THROTTLE_MS);
    if (await chatNotificationRepo.wasNotifiedSince(pool, throttleCutoff)) return;
    await chatNotificationRepo.recordNotification(pool);
    await smsSender.send(ownerPhoneNumber, `New message from ${chat.label}: ${body}`);
  }

  return {
    async StartOrGetChat(call, callback) {
      try {
        const visitorId = getVisitorId(call);
        if (!visitorId) return invalidArgument(callback, 'missing visitor-id');

        const existing = await chatRepo.findByVisitorId(pool, visitorId);
        const chat = existing ?? await chatRepo.findOrCreateByVisitorId(pool, visitorId);
        if (!existing) {
          // "starts a chat with me" from the feature spec -- the owner's
          // badge/live list should fire on creation itself, not wait for
          // a first message.
          publishChatEvent({ chatId: chat.id, visitorId, isNewChat: true, chatLabel: chat.label });
        }
        callback(null, { chat: toProtoChat(chat) });
      } catch (err) {
        callback({ code: grpc.status.INTERNAL, message: err.message });
      }
    },

    async SendMessage(call, callback) {
      try {
        const { chatId, body } = call.request;
        const isOwner = await isOwnerRequest(pool, call);
        let sender;
        if (isOwner) {
          sender = 'owner';
        } else {
          const visitorId = getVisitorId(call);
          if (!visitorId) return invalidArgument(callback, 'missing visitor-id');
          await assertVisitorOwnsChat(chatId, visitorId);
          sender = 'visitor';
        }

        const messageRow = await chatRepo.insertMessage(pool, { chatId, sender, body });
        const chat = await chatRepo.findById(pool, chatId);
        publishChatEvent({
          chatId,
          visitorId: chat.visitor_id,
          message: toProtoMessage(messageRow),
          isNewChat: false,
          chatLabel: chat.label,
        });
        if (sender === 'visitor') await notifyOwnerIfOffline(chat, body);
        callback(null, { message: toProtoMessage(messageRow) });
      } catch (err) {
        callback({ code: err.code ?? grpc.status.INTERNAL, message: err.message });
      }
    },

    async ListMessages(call, callback) {
      try {
        const { chatId } = call.request;
        if (!(await isOwnerRequest(pool, call))) {
          const visitorId = getVisitorId(call);
          if (!visitorId) return invalidArgument(callback, 'missing visitor-id');
          await assertVisitorOwnsChat(chatId, visitorId);
        }
        const messages = await chatRepo.listMessages(pool, chatId);
        callback(null, { messages: messages.map(toProtoMessage) });
      } catch (err) {
        callback({ code: err.code ?? grpc.status.INTERNAL, message: err.message });
      }
    },

    async ListChats(call, callback) {
      try {
        if (!(await isOwnerRequest(pool, call))) return permissionDenied(callback, 'owner only');
        const chats = await chatRepo.listAllForOwner(pool);
        callback(null, { chats: chats.map(toProtoChat) });
      } catch (err) {
        callback({ code: grpc.status.INTERNAL, message: err.message });
      }
    },

    // Owner can rename any chat (the pencil icon in their list); a visitor
    // can rename only their own (the "Your messages appear from:" field --
    // see widgets/chat/src/ChatWidget.vue), same scoping as SendMessage/
    // MarkRead above.
    async RenameChat(call, callback) {
      try {
        const { chatId, label } = call.request;
        if (!(await isOwnerRequest(pool, call))) {
          const visitorId = getVisitorId(call);
          if (!visitorId) return invalidArgument(callback, 'missing visitor-id');
          await assertVisitorOwnsChat(chatId, visitorId);
        }
        await chatRepo.rename(pool, chatId, label);
        callback(null, {});
      } catch (err) {
        callback({ code: err.code ?? grpc.status.INTERNAL, message: err.message });
      }
    },

    async MarkRead(call, callback) {
      try {
        const { chatId } = call.request;
        if (await isOwnerRequest(pool, call)) {
          await chatRepo.markOwnerRead(pool, chatId);
        } else {
          const visitorId = getVisitorId(call);
          if (!visitorId) return invalidArgument(callback, 'missing visitor-id');
          await assertVisitorOwnsChat(chatId, visitorId);
          await chatRepo.markVisitorRead(pool, chatId);
        }
        callback(null, {});
      } catch (err) {
        callback({ code: err.code ?? grpc.status.INTERNAL, message: err.message });
      }
    },

    // Owner subscribers get every event; visitor subscribers only get
    // events matching their own visitor-id (see chatBus.js's header
    // comment for why events are filtered by visitor_id rather than a
    // chat_id resolved once at subscribe time -- this lets a visitor
    // subscribe before they've ever started a chat, e.g. at page load).
    async SubscribeChatEvents(call) {
      const isOwner = await isOwnerRequest(pool, call);
      const visitorId = isOwner ? null : getVisitorId(call);
      if (!isOwner && !visitorId) {
        call.emit('error', { code: grpc.status.INVALID_ARGUMENT, message: 'missing visitor-id' });
        return;
      }

      const unsubscribe = subscribeChatEvents((event) => {
        if (!isOwner && event.visitorId !== visitorId) return;
        // visitorId is internal to chatBus.js, not part of chat.proto's
        // ChatEvent -- stripped here rather than sent over the wire.
        call.write({ chatId: event.chatId, message: event.message, isNewChat: event.isNewChat, chatLabel: event.chatLabel });
      });
      call.on('cancelled', unsubscribe);
    },
  };
}
