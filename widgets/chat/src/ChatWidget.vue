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
        <div ref="messagesEl" class="chat-messages">
          <p v-if="messages.length === 0" class="chat-status">Say hello — Matt will get back to you here.</p>
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
    };
  },
  created() {
    // MainWidget.vue owns the actual SubscribeChatEvents stream for the
    // page's whole lifetime and relays events here -- same reasoning as
    // its blog post-subscription relay (see its own comment): this widget
    // gets unmounted/remounted every time the view switches away from and
    // back to 'chat', which would drop a subscription owned here.
    window.addEventListener('widgetgrid:chat-event', this.onChatEvent);

    if (this.isOwner) {
      this.loadChats();
    } else {
      chatClient.startOrGetChat()
        .then((chat) => {
          this.myChatId = chat.id;
          return this.loadMessages(chat.id);
        })
        .then(() => { this.status = 'ready'; })
        .catch(() => { this.status = 'error'; });
    }
  },
  beforeUnmount() {
    window.removeEventListener('widgetgrid:chat-event', this.onChatEvent);
  },
  updated() {
    this.scrollToBottom();
  },
  methods: {
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
