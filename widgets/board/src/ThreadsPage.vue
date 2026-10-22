<template>
  <div>
    <nav class="board-crumbs">
      <a :href="paths.boards" @click="go(paths.boards, $event)">Message boards</a>
    </nav>
    <p v-if="status === 'loading'" class="board-muted">Loading…</p>
    <p v-else-if="status === 'error'" class="board-error">{{ error }}</p>
    <template v-else>
      <h2>{{ section.name }}</h2>
      <p class="board-muted">{{ section.description }}</p>

      <template v-if="viewer.canPost">
        <button v-if="!composing" type="button" class="board-button" @click="composing = true">New thread</button>
        <Composer
          v-else with-title cancellable autofocus submit-label="Post thread"
          :busy="posting" :error="postError" @submit="createThread" @cancel="composing = false"
        />
      </template>
      <PostingNotice v-else :viewer="viewer" />

      <p v-if="!threads.length" class="board-muted board-empty">No threads yet. Start the first one.</p>
      <ol class="board-threads">
        <li v-for="thread in threads" :key="thread.id" class="board-thread" :class="{ 'board-thread-removed': thread.removed }">
          <!-- ▶ opens a thread with replies in place, as a reply tree; one
               without replies has no toggle and sits flush left. -->
          <div class="board-thread-head">
            <button
              v-if="thread.replyCount" type="button" class="board-collapse" :aria-expanded="!!open[thread.id]"
              :title="open[thread.id] ? 'Hide replies' : 'Show replies'" @click="toggle(thread)"
            >{{ open[thread.id] ? '▼\uFE0E' : '▶\uFE0E' }}</button>
            <a class="board-thread-title" :href="threadPath(thread)" @click="go(threadPath(thread), $event)">{{ thread.title }}</a>
          </div>
          <span class="board-muted board-thread-meta" :class="{ 'board-thread-meta-indented': thread.replyCount }">
            <template v-if="thread.removed">[removed] · </template>
            {{ thread.author || '[deleted]' }} ·
            <time :datetime="thread.createdAt" :title="exactTime(thread.createdAt)">{{ relativeTime(thread.createdAt) }}</time> ·
            {{ thread.replyCount }} {{ thread.replyCount === 1 ? 'reply' : 'replies' }}<template v-if="thread.lastReplyAt">,
              latest <time :datetime="thread.lastReplyAt" :title="exactTime(thread.lastReplyAt)">{{ relativeTime(thread.lastReplyAt) }}</time></template>
          </span>
          <template v-if="open[thread.id]">
            <p v-if="open[thread.id].status === 'loading'" class="board-muted board-thread-meta-indented">Loading…</p>
            <p v-else-if="open[thread.id].status === 'error'" class="board-error board-thread-meta-indented">{{ open[thread.id].error }}</p>
            <ThreadOutline
              v-else :posts="open[thread.id].posts" :parent-id="thread.id"
              :section-slug="sectionSlug" :thread-id="thread.id"
            />
          </template>
        </li>
      </ol>
      <button v-if="nextBefore" type="button" class="board-button board-button-quiet" :disabled="loadingMore" @click="loadMore">More threads</button>
    </template>
  </div>
</template>

<script>
import { boardPath, navigate } from '@widgetgrid/site-routes';
import { boardClient, describe, relativeTime, exactTime } from './boardClient.js';
import Composer from './Composer.vue';
import PostingNotice from './PostingNotice.vue';
import ThreadOutline from './ThreadOutline.vue';

// /site/messages/<section>: its threads, newest first, 30 at a time, and
// starting a new one.
export default {
  name: 'ThreadsPage',
  components: { Composer, PostingNotice, ThreadOutline },
  props: {
    sectionSlug: { type: String, required: true },
  },
  data() {
    return {
      section: null, threads: [], viewer: null, nextBefore: '',
      status: 'loading', error: '', loadingMore: false,
      composing: false, posting: false, postError: '',
      paths: { boards: boardPath() },
      // threadId -> { status, posts, error } for threads opened in place.
      open: {},
    };
  },
  async created() {
    try {
      const page = await boardClient.listThreads(this.sectionSlug);
      Object.assign(this, { section: page.section, threads: page.threads, nextBefore: page.nextBefore, viewer: page.viewer });
      this.status = 'ready';
    } catch (err) {
      this.error = describe(err);
      this.status = 'error';
    }
  },
  methods: {
    relativeTime,
    exactTime,
    threadPath(thread) {
      return boardPath({ section: this.sectionSlug, thread: thread.id });
    },
    async toggle(thread) {
      if (this.open[thread.id]) {
        delete this.open[thread.id];
        return;
      }
      this.open[thread.id] = { status: 'loading', posts: [], error: '' };
      try {
        const { posts } = await boardClient.getThread(thread.id);
        if (this.open[thread.id]) this.open[thread.id] = { status: 'ready', posts, error: '' };
      } catch (err) {
        if (this.open[thread.id]) this.open[thread.id] = { status: 'error', posts: [], error: describe(err) };
      }
    },
    async loadMore() {
      this.loadingMore = true;
      try {
        const page = await boardClient.listThreads(this.sectionSlug, this.nextBefore);
        this.threads.push(...page.threads);
        this.nextBefore = page.nextBefore;
      } catch (err) {
        this.error = describe(err);
      } finally {
        this.loadingMore = false;
      }
    },
    async createThread({ title, body, notifyReplies }) {
      this.posting = true;
      this.postError = '';
      try {
        const threadId = await boardClient.createThread({ section: this.sectionSlug, title, body, notifyReplies });
        navigate(boardPath({ section: this.sectionSlug, thread: threadId }));
      } catch (err) {
        this.postError = describe(err);
      } finally {
        this.posting = false;
      }
    },
    go(path, event) {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      navigate(path);
    },
  },
};
</script>

<style scoped>
.board-threads {
  list-style: none;
  padding: 0;
  margin: 16px 0;
}

.board-thread {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.board-thread-head {
  display: flex;
  gap: 6px;
  align-items: baseline;
}

/* Lines up under the title when a ▶ sits in front of it. */
.board-thread-meta-indented {
  padding-left: 20px;
}

/* Fixed width: ▶ and ▼ differ in most fonts, and the title shouldn't
   shift when one becomes the other. */
.board-collapse {
  width: 14px;
  padding: 0;
  border: none;
  background: none;
  color: #888;
  font-size: 0.75rem;
  text-align: center;
  cursor: pointer;
  flex-shrink: 0;
}

.board-thread-title {
  font-weight: 600;
  color: inherit;
  text-decoration: none;
  overflow-wrap: anywhere;
}

.board-thread-title:hover {
  text-decoration: underline;
}

.board-thread-meta {
  font-size: 0.85rem;
}

.board-thread-removed {
  opacity: 0.6;
}

.board-empty {
  margin-top: 16px;
}
</style>
