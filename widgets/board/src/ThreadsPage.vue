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
          <a class="board-thread-title" :href="threadPath(thread)" @click="go(threadPath(thread), $event)">{{ thread.title }}</a>
          <span class="board-muted board-thread-meta">
            <template v-if="thread.removed">[removed] · </template>
            {{ thread.author || '[deleted]' }} ·
            <time :datetime="thread.createdAt" :title="exactTime(thread.createdAt)">{{ relativeTime(thread.createdAt) }}</time> ·
            {{ thread.replyCount }} {{ thread.replyCount === 1 ? 'reply' : 'replies' }}<template v-if="thread.lastReplyAt">,
              latest <time :datetime="thread.lastReplyAt" :title="exactTime(thread.lastReplyAt)">{{ relativeTime(thread.lastReplyAt) }}</time></template>
          </span>
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

// /site/messages/<section>: its threads, newest first, 30 at a time, and
// starting a new one.
export default {
  name: 'ThreadsPage',
  components: { Composer, PostingNotice },
  props: {
    sectionSlug: { type: String, required: true },
  },
  data() {
    return {
      section: null, threads: [], viewer: null, nextBefore: '',
      status: 'loading', error: '', loadingMore: false,
      composing: false, posting: false, postError: '',
      paths: { boards: boardPath() },
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
