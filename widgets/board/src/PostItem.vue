<template>
  <article :id="`post-${post.id}`" class="board-post" :class="{ 'board-post-root': root, 'board-post-removed': post.removed }">
    <h2 v-if="root && !editing">{{ post.title }}</h2>
    <header class="board-post-meta">
      <!-- Only on posts with replies -- one without sits flush left. On the
           thread's own post it folds the reply tree, not the post. -->
      <button
        v-if="replyCount" type="button" class="board-collapse" :aria-expanded="!collapsed"
        :title="collapsed ? 'Show replies' : 'Hide replies'" @click="toggle"
      >{{ collapsed ? '▶\uFE0E' : '▼\uFE0E' }}</button>
      <strong v-if="post.author">{{ post.author }}</strong><span v-else>[deleted]</span>
      <a class="board-post-time" :href="board.threadPath(post.id)" :title="exactTime(post.createdAt)">{{ relativeTime(post.createdAt) }}</a>
      <span v-if="post.editedAt" class="board-muted" :title="`Edited ${exactTime(post.editedAt)}`">(edited)</span>
      <span v-if="post.removed" class="board-flag">removed</span>
      <span v-if="post.authorBanned" class="board-flag">banned</span>
      <span v-if="collapsed && replyCount" class="board-muted">({{ replyCount }} more)</span>
    </header>

    <template v-if="root || !collapsed">
      <Composer
        v-if="editing" :with-title="root" :initial-title="post.title" :initial-body="post.body"
        :initial-notify="post.notifyReplies" submit-label="Save" cancellable autofocus
        :busy="busy" :error="error" :viewer="board.viewer" @submit="saveEdit" @cancel="editing = false"
      />
      <template v-else>
        <div v-if="post.bodyHtml" class="board-body" v-html="post.bodyHtml"></div>
        <p v-else-if="post.deleted" class="board-muted">[deleted]</p>
        <p v-else-if="post.removed" class="board-muted">[removed]</p>

        <div class="board-post-actions">
          <button v-if="canReply && !root" type="button" class="board-action" @click="replyingTo = !replyingTo">reply</button>
          <template v-if="post.mine && !post.deleted">
            <button type="button" class="board-action" @click="editing = true">edit</button>
            <button type="button" class="board-action" @click="remove">delete</button>
            <label class="board-action-check">
              <input type="checkbox" :checked="post.notifyReplies" @change="board.setNotify(post, $event.target.checked)" />
              email me about replies
            </label>
          </template>
          <template v-if="board.viewer.moderator && !post.deleted">
            <button type="button" class="board-action" @click="board.hide(post, !post.removed)">{{ post.removed ? 'unhide' : 'hide' }}</button>
            <button
              v-if="post.author && !post.mine" type="button" class="board-action"
              @click="ban"
            >{{ post.authorBanned ? `unban ${post.author}` : `ban ${post.author}` }}</button>
          </template>
        </div>

        <Composer
          v-if="replyingTo" ref="replyBox" submit-label="Reply" cancellable autofocus
          :placeholder="`Reply to ${post.author || 'this post'}`" :busy="busy" :error="error" :viewer="board.viewer"
          @submit="sendReply" @cancel="replyingTo = false"
        />
      </template>

      <!-- Indented up to a depth, then flat: deep threads otherwise squeeze
           the text into a sliver, worst on a phone. -->
      <div v-if="!root && children.length" class="board-replies" :class="{ 'board-replies-flat': depth >= maxIndent }">
        <PostItem v-for="child in children" :key="child.id" :post="child" :depth="depth + 1" />
      </div>
    </template>
  </article>
</template>

<script>
import Composer from './Composer.vue';
import { relativeTime, exactTime } from './boardClient.js';

// One post, and (except for the thread's own post, whose replies
// ThreadPage lists) its replies beneath it, recursively. Every action goes
// through the `board` ThreadPage provides.
export default {
  name: 'PostItem',
  components: { Composer },
  inject: ['board'],
  props: {
    post: { type: Object, required: true },
    root: { type: Boolean, default: false },
    depth: { type: Number, default: 0 },
  },
  // Root only: ThreadPage lists the thread's replies, so it does the hiding.
  emits: ['toggle-replies'],
  data() {
    return {
      collapsed: false, editing: false, replyingTo: false, busy: false, error: '',
      maxIndent: window.matchMedia('(max-width: 640px)').matches ? 3 : 8,
    };
  },
  computed: {
    children() {
      return this.board.children(this.post.id);
    },
    canReply() {
      return this.board.viewer.canPost && !this.post.deleted && !this.post.removed;
    },
    // Everything beneath, for the "(n more)" on a collapsed post.
    replyCount() {
      const count = (id) => this.board.children(id).reduce((n, c) => n + 1 + count(c.id), 0);
      return count(this.post.id);
    },
  },
  methods: {
    relativeTime,
    exactTime,
    toggle() {
      this.collapsed = !this.collapsed;
      if (this.root) this.$emit('toggle-replies', this.collapsed);
    },
    async sendReply(payload) {
      this.busy = true;
      this.error = await this.board.reply(this.post, payload);
      this.busy = false;
      if (!this.error) this.replyingTo = false;
    },
    async saveEdit(payload) {
      this.busy = true;
      this.error = await this.board.edit(this.post, payload);
      this.busy = false;
      if (!this.error) this.editing = false;
      // The opt-in lives on the post, not the edit itself.
      if (!this.error && payload.notifyReplies !== this.post.notifyReplies) this.board.setNotify(this.post, payload.notifyReplies);
    },
    remove() {
      if (window.confirm('Delete this post? This can\'t be undone.')) this.board.remove(this.post);
    },
    ban() {
      const verb = this.post.authorBanned ? 'Unban' : 'Ban';
      if (window.confirm(`${verb} ${this.post.author} from posting?`)) this.board.ban(this.post.author, !this.post.authorBanned);
    },
  },
};
</script>

<style scoped>
.board-post {
  margin: 12px 0;
}

.board-post-root {
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.board-post-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: baseline;
  font-size: 0.85rem;
  color: #444;
  margin-bottom: 4px;
}

/* Fixed width, so the author name doesn't shift between ▶ and ▼. */
.board-collapse {
  width: 14px;
  padding: 0;
  border: none;
  background: none;
  color: #888;
  font-size: 0.75rem;
  text-align: center;
  cursor: pointer;
}

.board-post-time {
  color: #888;
  text-decoration: none;
}

.board-post-time:hover {
  text-decoration: underline;
}

.board-flag {
  padding: 0 6px;
  border-radius: 999px;
  background: #fde8e7;
  color: #b42318;
  font-size: 0.75rem;
}

.board-post-removed > .board-body {
  opacity: 0.6;
}

.board-post-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-top: 6px;
}

.board-action-check {
  display: flex;
  gap: 4px;
  align-items: center;
  font-size: 0.8rem;
  color: #666;
}

.board-replies {
  margin-left: 18px;
  padding-left: 12px;
  border-left: 2px solid #eee;
}

.board-replies-flat {
  margin-left: 0;
  padding-left: 0;
  border-left: none;
}

/* Arrived at via a #post-<id> link. */
.board-post-target {
  animation: board-target 2.5s ease-out;
}

@keyframes board-target {
  from { background: #fff4c2; }
  to { background: transparent; }
}
</style>
