<template>
  <div class="widget widget-chat">
    <div v-if="isOwner" class="chat-shell">
      <aside class="chat-list">
        <p v-if="status === 'loading'" class="chat-status">Loading…</p>
        <p v-else-if="chats.length === 0" class="chat-status">No conversations yet.</p>
        <div
          v-for="chat in chats" :key="chat.id" class="chat-list-item"
          :class="{ 'chat-list-item-active': chat.id === selectedChatId }"
          @click="selectChat(chat.id)"
        >
          <input
            v-if="renamingChatId === chat.id" v-model="renameValue" class="chat-rename-input"
            autofocus @click.stop @keyup.enter="confirmRename" @keyup.esc="cancelRename" @blur="confirmRename"
          />
          <template v-else>
            <span class="chat-list-label" :class="{ 'chat-list-label-unread': chat.hasUnread }">{{ chat.label }}</span>
            <button type="button" class="chat-rename-btn" title="Rename" aria-label="Rename" @click.stop="startRename(chat)">✎</button>
          </template>
        </div>
      </aside>
      <section class="chat-thread">
        <template v-if="selectedChatId">
          <div ref="messagesEl" class="chat-messages">
            <div
              v-for="m in messages" :key="m.id" class="chat-message"
              :class="m.sender === 'owner' ? 'chat-message-mine' : 'chat-message-theirs'"
            ><p class="chat-message-body">{{ m.body }}</p></div>
          </div>
          <form class="chat-composer" @submit.prevent="sendMessage">
            <input v-model="newMessageBody" type="text" class="chat-input" placeholder="Type a message…" />
            <button type="submit" class="chat-send" :disabled="!newMessageBody.trim()">Send</button>
          </form>
        </template>
        <p v-else class="chat-status">Select a conversation.</p>
      </section>
    </div>

    <div v-else class="chat-thread chat-thread-visitor">
      <p v-if="status === 'loading'" class="chat-status">Connecting…</p>
      <template v-else>
        <div class="chat-name-prompt">
          <label for="chat-visitor-name">Your messages appear from:</label>
          <input
            id="chat-visitor-name" v-model="visitorName" type="text" class="chat-name-input"
            placeholder="optional" @blur="saveVisitorName" @keyup.enter="saveVisitorName"
          />
        </div>
        <div ref="messagesEl" class="chat-messages">
          <p v-if="messages.length === 0" class="chat-status">{{ emptyThreadMessage }}</p>
          <div
            v-for="m in messages" :key="m.id" class="chat-message"
            :class="m.sender === 'visitor' ? 'chat-message-mine' : 'chat-message-theirs'"
          ><p class="chat-message-body">{{ m.body }}</p></div>
        </div>
        <form class="chat-composer" @submit.prevent="sendMessage">
          <input v-model="newMessageBody" type="text" class="chat-input" placeholder="Type a message…" />
          <button type="submit" class="chat-send" :disabled="!newMessageBody.trim()">Send</button>
        </form>
      </template>
    </div>
  </div>
</template>

<script>
import { chatClient, getOwnerToken } from './chatClient.js';
import { subscribeOwnerPresence } from './presenceSubscriptionClient.js';

// Chats still get this auto-generated label at creation time (see
// chatRepo.js's findOrCreateByVisitorId) -- used here only to decide
// whether to prefill the "Your messages appear from:" field with it (we
// don't want to prefill with a name the visitor never actually chose).
const AUTO_LABEL = /^chat\d+$/;

export default {
  name: 'ChatWidget',
  props: {
    data: { type: Object, required: true },
    title: { type: String, default: '' },
  },
  data() {
    return {
      isOwner: !!getOwnerToken(),
      status: 'loading',
      chats: [],
      selectedChatId: null,
      myChatId: null, // visitor only
      messages: [],
      newMessageBody: '',
      renamingChatId: null,
      renameValue: '',
      visitorName: '', // visitor only
      // Whether the owner is currently logged in anywhere -- chat works
      // either way now, this only picks which empty-thread copy to show
      // (see emptyThreadMessage below). Visitor only; the owner obviously
      // doesn't need to be told their own online status.
      ownerOnline: false,
    };
  },
  computed: {
    emptyThreadMessage() {
      return this.ownerOnline ? 'Say hello — Matt will get back to you here.' : 'Leave a message for Matt.';
    },
  },
  created() {
    // MainWidget.vue owns the actual SubscribeChatEvents stream for the
    // page's whole lifetime and relays events here -- same reasoning as
    // its blog post-subscription relay (see its own comment): this widget
    // gets unmounted/remounted every time the view switches away from and
    // back to 'chat', which would drop a subscription owned here.
    window.addEventListener('widgetgrid:chat-event', this.onChatEvent);

    // isOwner (data(), above) is only read once at creation -- without
    // this, logging in/out while the chat view is already showing (rather
    // than navigating away and back, which remounts this widget fresh)
    // left isOwner stuck on whatever it was, so the widget kept rendering
    // the old owner/visitor layout and calling the old-mode RPCs even
    // though the server was already honoring the new identity on every
    // request. Same trap MainWidget.vue's own identity-changed handler
    // already documents for its subscription -- this is the other half of
    // that fix, for this widget's own render mode.
    window.addEventListener('widgetgrid:identity-changed', this.onIdentityChanged);

    // Safety net for a live SubscribeChatEvents 'data' event arriving while
    // this tab is backgrounded: Chrome deprioritizes task processing for
    // background tabs, which can delay the stream's JS callback running
    // well after the underlying connection already has the data (the
    // message is never lost -- it's already committed server-side -- just
    // slow to paint). Re-fetching on refocus catches that up without
    // relying on the live event ever firing promptly. Cheap no-op the vast
    // majority of the time (nothing missed), so unconditional on every
    // visibility change is fine.
    document.addEventListener('visibilitychange', this.onVisibilityChange);

    this.initForIdentity();
  },
  beforeUnmount() {
    window.removeEventListener('widgetgrid:chat-event', this.onChatEvent);
    window.removeEventListener('widgetgrid:identity-changed', this.onIdentityChanged);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    this.unsubscribePresence?.();
  },
  updated() {
    this.scrollToBottom();
  },
  methods: {
    // Shared by created() and onIdentityChanged() below -- the actual
    // owner/visitor branch used to live directly in created(), duplicated
    // here would drift the two paths apart.
    initForIdentity() {
      if (this.isOwner) {
        this.loadChats();
      } else {
        this.unsubscribePresence = subscribeOwnerPresence((online) => {
          this.ownerOnline = online;
        });
        chatClient.startOrGetChat()
          .then((chat) => {
            this.myChatId = chat.id;
            if (!AUTO_LABEL.test(chat.label)) this.visitorName = chat.label;
            return this.loadMessages(chat.id);
          })
          .then(() => { this.status = 'ready'; })
          .catch(() => { this.status = 'error'; });
      }
    },
    // Logging in/out dispatches this without a page reload (see
    // LoginWidget.vue) -- re-derive isOwner and reset every piece of state
    // the owner/visitor branches populate differently, then re-run
    // initForIdentity() as if this were a fresh mount. Presence is
    // resubscribed from scratch since switching TO owner doesn't need it
    // (isOwner is checked before ever subscribing) and switching TO visitor
    // needs a subscription that was never opened while isOwner was true.
    onIdentityChanged() {
      this.unsubscribePresence?.();
      this.unsubscribePresence = null;
      this.isOwner = !!getOwnerToken();
      this.status = 'loading';
      this.chats = [];
      this.selectedChatId = null;
      this.myChatId = null;
      this.messages = [];
      this.renamingChatId = null;
      this.renameValue = '';
      this.visitorName = '';
      this.ownerOnline = false;
      this.initForIdentity();
    },
    async loadChats() {
      try {
        const chats = await chatClient.listChats();
        this.chats = chats;
        this.status = 'ready';
        // Only auto-select on first load -- a later refresh (triggered by
        // a live chat event) shouldn't yank the owner away from whatever
        // conversation they're already reading.
        if (!this.selectedChatId && chats.length > 0) {
          this.selectChat(chats[0].id);
        }
      } catch {
        this.status = 'error';
      }
    },
    async loadMessages(chatId) {
      this.messages = await chatClient.listMessages(chatId);
    },
    selectChat(chatId) {
      this.selectedChatId = chatId;
      this.loadMessages(chatId);
      chatClient.markRead(chatId);
      const chat = this.chats.find((c) => c.id === chatId);
      if (chat) chat.hasUnread = false;
    },
    startRename(chat) {
      this.renamingChatId = chat.id;
      this.renameValue = chat.label;
    },
    async confirmRename() {
      const chatId = this.renamingChatId;
      const label = this.renameValue.trim();
      this.renamingChatId = null;
      if (!chatId || !label) return;
      await chatClient.renameChat(chatId, label);
      const chat = this.chats.find((c) => c.id === chatId);
      if (chat) chat.label = label;
    },
    cancelRename() {
      this.renamingChatId = null;
    },
    // "Your messages appear from:" -- optional, and reuses the same
    // RenameChat RPC the owner's own rename pencil uses (see
    // chatService.js's RenameChat, now scoped to allow a visitor to rename
    // their own chat), rather than being a separate mechanism. The owner
    // can still overwrite it afterward via their own rename control.
    async saveVisitorName() {
      const label = this.visitorName.trim();
      if (!label || !this.myChatId) return;
      await chatClient.renameChat(this.myChatId, label);
    },
    async sendMessage() {
      const body = this.newMessageBody.trim();
      const chatId = this.isOwner ? this.selectedChatId : this.myChatId;
      if (!body || !chatId) return;
      this.newMessageBody = '';
      const message = await chatClient.sendMessage(chatId, body);
      this.messages.push(message);
    },
    // Live updates while this widget is mounted -- see the 'created' hook
    // comment for why these arrive via a relayed window event rather than
    // a subscription owned here.
    async onChatEvent(event) {
      if (this.isOwner) {
        await this.loadChats();
        if (event.detail.chatId === this.selectedChatId) {
          await this.loadMessages(this.selectedChatId);
          await chatClient.markRead(this.selectedChatId);
          const chat = this.chats.find((c) => c.id === this.selectedChatId);
          if (chat) chat.hasUnread = false;
        }
      } else {
        if (!this.myChatId) return; // startOrGetChat hasn't resolved yet
        await this.loadMessages(this.myChatId);
        await chatClient.markRead(this.myChatId);
      }
    },
    // See the 'created' hook comment for why this exists. visibilitychange
    // fires on both hide and show -- only refetch on the latter, hiding
    // needs no reaction.
    async onVisibilityChange() {
      if (document.visibilityState !== 'visible') return;
      if (this.isOwner) {
        await this.loadChats();
        if (this.selectedChatId) await this.loadMessages(this.selectedChatId);
      } else if (this.myChatId) {
        await this.loadMessages(this.myChatId);
      }
    },
    scrollToBottom() {
      const el = this.$refs.messagesEl;
      if (el) el.scrollTop = el.scrollHeight;
    },
  },
};
</script>

<style scoped>
.widget-chat {
  height: 100%;
  box-sizing: border-box;
}

.chat-status {
  color: #666;
  padding: 24px;
}

.chat-shell {
  display: flex;
  height: 100%;
}

.chat-list {
  width: 220px;
  flex: none;
  overflow-y: auto;
  border-right: 1px solid #ddd;
  box-sizing: border-box;
}

.chat-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}

.chat-list-item:hover {
  background: #f7f5fa;
}

.chat-list-item-active {
  background: #efe9f7;
}

.chat-list-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-list-label-unread {
  font-weight: 700;
}

.chat-rename-btn {
  flex: none;
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 2px 4px;
}

.chat-rename-btn:hover {
  color: #333;
}

.chat-rename-input {
  width: 100%;
  box-sizing: border-box;
  padding: 4px 6px;
}

.chat-thread {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.chat-thread-visitor {
  height: 100%;
}

.chat-name-prompt {
  flex: none;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-bottom: 1px solid #ddd;
  font-size: 0.85rem;
  color: #666;
}

.chat-name-input {
  flex: 1;
  max-width: 220px;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 0.9rem;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chat-message {
  max-width: 70%;
  padding: 8px 12px;
  border-radius: 12px;
  background: #f0f0f0;
}

.chat-message-body {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.chat-message-mine {
  align-self: flex-end;
  background: #150a2e;
  color: #f4ead9;
}

.chat-message-theirs {
  align-self: flex-start;
}

.chat-composer {
  flex: none;
  display: flex;
  gap: 8px;
  padding: 16px 24px;
  border-top: 1px solid #ddd;
}

.chat-input {
  flex: 1;
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 1rem;
}

.chat-send {
  padding: 10px 16px;
  border-radius: 6px;
  border: none;
  background: #150a2e;
  color: #f4ead9;
  cursor: pointer;
  font-weight: 600;
}

.chat-send:disabled {
  opacity: 0.5;
  cursor: default;
}
</style>
