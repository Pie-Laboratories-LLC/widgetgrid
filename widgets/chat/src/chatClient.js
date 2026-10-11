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
import { authMetadata, getIdentity } from '@widgetgrid/auth-web';

const GRPC_WEB_ORIGIN = import.meta.env.VITE_GRPC_WEB_ORIGIN ?? '';
const client = new ChatServicePromiseClient(GRPC_WEB_ORIGIN);

const VISITOR_ID_KEY = 'widgetgrid:visitorId';

// UI-only: whether to show the owner's side of chat. The server decides
// for real from the access token (authContext.js).
export function isSignedInOwner() {
  return getIdentity()?.role === 'owner';
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

// visitor-id always, plus the access token when signed in -- a signed-in
// member who isn't the owner still chats as a visitor (see authContext.js).
async function identityMetadata() {
  return { 'visitor-id': getOrCreateVisitorId(), ...(await authMetadata()) };
}

export const chatClient = {
  async startOrGetChat() {
    const response = await client.startOrGetChat(new StartOrGetChatRequest(), await identityMetadata());
    return response.toObject().chat;
  },
  async sendMessage(chatId, body) {
    const request = new SendMessageRequest();
    request.setChatId(chatId);
    request.setBody(body);
    const response = await client.sendMessage(request, await identityMetadata());
    return response.toObject().message;
  },
  async listMessages(chatId) {
    const request = new ListMessagesRequest();
    request.setChatId(chatId);
    const response = await client.listMessages(request, await identityMetadata());
    return response.toObject().messagesList;
  },
  async listChats() {
    const response = await client.listChats(new ListChatsRequest(), await identityMetadata());
    return response.toObject().chatsList;
  },
  async renameChat(chatId, label) {
    const request = new RenameChatRequest();
    request.setChatId(chatId);
    request.setLabel(label);
    await client.renameChat(request, await identityMetadata());
  },
  async markRead(chatId) {
    const request = new MarkReadRequest();
    request.setChatId(chatId);
    await client.markRead(request, await identityMetadata());
  },
};
