<template>
  <ul class="board-outline">
    <li v-for="post in children(parentId)" :key="post.id">
      <a class="board-outline-line" :href="pathFor(post)" @click="go(pathFor(post), $event)">
        <strong>{{ post.author || '[deleted]' }}</strong>
        <span class="board-muted">{{ relativeTime(post.createdAt) }}</span>
        <span class="board-outline-excerpt">{{ excerpt(post) }}</span>
      </a>
      <ThreadOutline
        v-if="children(post.id).length" :posts="posts" :parent-id="post.id"
        :section-slug="sectionSlug" :thread-id="threadId"
      />
    </li>
  </ul>
</template>

<script>
import { boardPath, navigate } from '@widgetgrid/site-routes';
import { relativeTime } from './boardClient.js';

const EXCERPT_CHARS = 90;

// A thread's replies as a compact tree -- one line each (author, when, the
// start of the text), newsreader style -- for opening a thread in place
// on the section's thread list. Each line links to that reply in the
// thread. Recursive: one instance per level.
export default {
  name: 'ThreadOutline',
  props: {
    // The thread as GetThread returns it: thread post first, then replies.
    posts: { type: Array, required: true },
    parentId: { type: String, required: true },
    sectionSlug: { type: String, required: true },
    threadId: { type: String, required: true },
  },
  methods: {
    relativeTime,
    children(id) {
      return this.posts.filter((p) => p.parentId === id);
    },
    excerpt(post) {
      if (post.deleted) return '[deleted]';
      if (post.removed && !post.bodyHtml) return '[removed]';
      const text = new DOMParser().parseFromString(post.bodyHtml, 'text/html').body.textContent.replace(/\s+/g, ' ').trim();
      return text.length > EXCERPT_CHARS ? `${text.slice(0, EXCERPT_CHARS).trimEnd()}…` : text;
    },
    pathFor(post) {
      return boardPath({ section: this.sectionSlug, thread: this.threadId, post: post.id });
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
.board-outline {
  list-style: none;
  margin: 4px 0 0;
  padding-left: 18px;
  border-left: 2px solid #eee;
}

.board-outline .board-outline {
  margin-left: 4px;
}

.board-outline-line {
  display: flex;
  gap: 8px;
  align-items: baseline;
  padding: 2px 0;
  font-size: 0.9rem;
  color: inherit;
  text-decoration: none;
  min-width: 0;
}

.board-outline-line:hover .board-outline-excerpt {
  text-decoration: underline;
}

.board-outline-excerpt {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}
</style>
