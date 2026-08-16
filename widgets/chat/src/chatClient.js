// Its own gRPC-Web client, same reasoning as widgets/blog/src/blogClient.js.
import {
  StartOrGetChatRequest,
  SendMessageRequest,
  ListMessagesRequest,
  ListChatsRequest,
  RenameChatRequest,
  MarkReadRequest,
} from '@widgetgrid/proto-gen-web/widgetgrid/v1/chat_pb.js';
import { ChatServicePromiseClient } from '@widgetgrid/proto-gen-web/widgetgrid/v1/chat_grpc_web_pb.js';

const GRPC_WEB_ORIGIN = import.meta.env.VITE_GRPC_WEB_ORIGIN ?? '';
const client = new ChatServicePromiseClient(GRPC_WEB_ORIGIN);

// Same localStorage key LoginWidget.vue writes on a successful login --
// independently built widgets, no shared module to hold the constant in
// (see LoginWidget.vue's comment on TOKEN_KEY).
const TOKEN_KEY = 'widgetgrid:ownerToken';
const VISITOR_ID_KEY = 'widgetgrid:visitorId';

export function getOwnerToken() {
  return localStorage.getItem(TOKEN_KEY);
}

// The one piece of identity an anonymous visitor has: a UUID generated
// once and kept in localStorage, not an account -- see chat.proto's header
// comment. Created lazily here since this is the first feature that needs
// one.
export function getOrCreateVisitorId() {
  let id = localStorage.getItem(VISITOR_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VISITOR_ID_KEY, id);
  }
  return id;
}

// authorization for the owner's browser, visitor-id for everyone else --
// mirrors authContext.js's isOwnerRequest/getVisitorId on the server.
function identityMetadata() {
  const token = getOwnerToken();
  return token ? { authorization: `Bearer ${token}` } : { 'visitor-id': getOrCreateVisitorId() };
}

export const chatClient = {
  async startOrGetChat() {
    const response = await client.startOrGetChat(new StartOrGetChatRequest(), identityMetadata());
    return response.toObject().chat;
  },
  async sendMessage(chatId, body) {
    const request = new SendMessageRequest();
    request.setChatId(chatId);
    request.setBody(body);
    const response = await client.sendMessage(request, identityMetadata());
    return response.toObject().message;
  },
  async listMessages(chatId) {
    const request = new ListMessagesRequest();
    request.setChatId(chatId);
    const response = await client.listMessages(request, identityMetadata());
    return response.toObject().messagesList;
  },
  async listChats() {
    const response = await client.listChats(new ListChatsRequest(), identityMetadata());
    return response.toObject().chatsList;
  },
  async renameChat(chatId, label) {
    const request = new RenameChatRequest();
    request.setChatId(chatId);
    request.setLabel(label);
    await client.renameChat(request, identityMetadata());
  },
  async markRead(chatId) {
    const request = new MarkReadRequest();
    request.setChatId(chatId);
    await client.markRead(request, identityMetadata());
  },
};
