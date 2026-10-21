<template>
  <div>
    <nav class="board-crumbs">
      <a :href="paths.boards" @click="go(paths.boards, $event)">Message boards</a>
      <template v-if="section"> › <a :href="paths.section" @click="go(paths.section, $event)">{{ section.name }}</a></template>
    </nav>
    <p v-if="status === 'loading'" class="board-muted">Loading…</p>
    <p v-else-if="status === 'error'" class="board-error">{{ error }}</p>
    <template v-else>
      <PostItem :post="root" root @toggle-replies="repliesHidden = $event" />
      <p v-if="actionError" class="board-error">{{ actionError }}</p>

      <Composer
        v-if="viewer.canPost && !root.deleted && !root.removed" ref="replyBox" submit-label="Reply"
        placeholder="Reply to the thread" :busy="replying" :error="replyError" @submit="replyToThread"
      />
      <PostingNotice v-else-if="!viewer.canPost" :viewer="viewer" />

      <p v-if="!children(root.id).length" class="board-muted">No replies yet.</p>
      <template v-else-if="!repliesHidden">
        <PostItem v-for="post in children(root.id)" :key="post.id" :post="post" :depth="0" />
      </template>
    </template>
  </div>
</template>

<script>
import { boardPath, navigate } from '@widgetgrid/site-routes';
import { boardClient, describe } from './boardClient.js';
import Composer from './Composer.vue';
import PostItem from './PostItem.vue';
import PostingNotice from './PostingNotice.vue';

// /site/messages/<section>/<thread>: the thread post, then its replies as
// a tree (newest first at every level). Owns the thread's posts; every
// PostItem, however deep, acts through the `board` it provides.
export default {
  name: 'ThreadPage',
  components: { Composer, PostItem, PostingNotice },
  provide() {
    return { board: this.actions };
  },
  props: {
    sectionSlug: { type: String, required: true },
    threadId: { type: String, required: true },
  },
  data() {
    return {
      section: null, posts: [], viewer: null,
      status: 'loading', error: '', actionError: '',
      replying: false, replyError: '', repliesHidden: false,
    };
  },
  computed: {
    root() {
      return this.posts[0];
    },
    // parentId -> replies, in server order (newest first).
    childMap() {
      const map = new Map();
      for (const post of this.posts.slice(1)) {
        if (!map.has(post.parentId)) map.set(post.parentId, []);
        map.get(post.parentId).push(post);
      }
      return map;
    },
    paths() {
      return { boards: boardPath(), section: boardPath({ section: this.sectionSlug }) };
    },
    // What PostItems call -- a stable object whose getters read this
    // component's current state.
    actions() {
      const page = this;
      return {
        get viewer() { return page.viewer; },
        children: (id) => page.children(id),
        threadPath: (postId) => boardPath({ section: page.sectionSlug, thread: page.threadId, post: postId }),
        reply: (parent, payload) => page.reply(parent, payload),
        edit: (post, payload) => page.edit(post, payload),
        // Deleting the thread's own post with nothing under it deletes the
        // thread -- back to the section, then.
        remove: (post) => page.act(() => boardClient.deletePost(post.id), { leaveIfGone: post.id === page.threadId }),
        setNotify: (post, enabled) => page.act(() => boardClient.setReplyNotifications(post.id, enabled)),
        hide: (post, hidden) => page.act(() => boardClient.hidePost(post.id, hidden)),
        ban: (username, banned) => page.act(() => boardClient.banUser(username, banned)),
      };
    },
  },
  async created() {
    await this.load();
    this.status = this.error ? 'error' : 'ready';
    // A link to one post in the thread (#post-<id>, e.g. from a reply
    // email): bring it into view once it's rendered.
    const target = /^#post-(\d+)$/.exec(window.location.hash)?.[1];
    if (target) {
      this.$nextTick(() => {
        const el = document.getElementById(`post-${target}`);
        el?.scrollIntoView({ block: 'center' });
        el?.classList.add('board-post-target');
      });
    }
  },
  methods: {
    children(id) {
      return this.childMap.get(id) ?? [];
    },
    async load() {
      try {
        ({ section: this.section, posts: this.posts, viewer: this.viewer } = await boardClient.getThread(this.threadId));
        this.error = '';
      } catch (err) {
        this.error = describe(err);
      }
    },
    // A change that reshapes the thread (delete, hide, ban, opt-in):
    // do it, then reload rather than patching the tree by hand.
    async act(change, { leaveIfGone = false } = {}) {
      this.actionError = '';
      try {
        await change();
      } catch (err) {
        this.actionError = describe(err);
        return;
      }
      await this.load();
      if (this.error && leaveIfGone) navigate(this.paths.section);
      else if (this.error) this.actionError = this.error;
    },
    // Returns an error message, or '' on success -- the replying PostItem
    // shows it next to its composer.
    async reply(parent, { body, notifyReplies }) {
      try {
        const post = await boardClient.reply({ parentId: parent.id, body, notifyReplies });
        // Newest first: straight after the thread post keeps the whole list
        // in the server's order.
        this.posts.splice(1, 0, post);
        return '';
      } catch (err) {
        return describe(err);
      }
    },
    async edit(post, { title, body }) {
      try {
        const updated = await boardClient.editPost({ postId: post.id, body, title });
        this.posts.splice(this.posts.findIndex((p) => p.id === post.id), 1, updated);
        return '';
      } catch (err) {
        return describe(err);
      }
    },
    async replyToThread(payload) {
      this.replying = true;
      this.replyError = await this.reply(this.root, payload);
      this.replying = false;
      if (!this.replyError) this.$refs.replyBox.reset();
    },
    go(path, event) {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      navigate(path);
    },
  },
};
</script>
