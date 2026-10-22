<template>
  <div class="widget widget-board">
    <ThreadPage v-if="board.thread" :key="`t${board.thread}`" :section-slug="board.section" :thread-id="board.thread" />
    <ThreadsPage v-else-if="board.section" :key="`s${board.section}`" :section-slug="board.section" />
    <SectionsPage v-else />
  </div>
</template>

<script>
import SectionsPage from './SectionsPage.vue';
import ThreadsPage from './ThreadsPage.vue';
import ThreadPage from './ThreadPage.vue';

// /site/messages and everything under it -- MainWidget.vue passes the
// parsed route's board: { section, thread } (see @widgetgrid/site-routes).
// Keyed per page, so moving between threads starts each one fresh.
export default {
  name: 'BoardWidget',
  components: { SectionsPage, ThreadsPage, ThreadPage },
  props: {
    data: { type: Object, required: true },
    title: { type: String, default: '' },
  },
  computed: {
    board() {
      return this.data.board ?? { section: null, thread: null };
    },
  },
};
</script>

<style>
/* Shared by every board page (unscoped on purpose, prefixed to stay put).
   Same fluid padding and width cap as the blog, so the content column
   doesn't shift between them. */
.widget-board {
  padding: clamp(16px, 4vw, 32px);
  max-width: 1100px;
  box-sizing: border-box;
}

.widget-board h2 {
  margin: 0 0 8px;
  overflow-wrap: anywhere;
}

.board-crumbs {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 12px;
}

.board-crumbs a {
  color: inherit;
}

.board-muted {
  color: #666;
}

.board-error {
  color: #b42318;
}

.board-button {
  padding: 6px 16px;
  border: none;
  border-radius: 6px;
  background: rgb(5, 5, 5);
  color: #f4ead9;
  font-size: 0.95rem;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
}

.board-button:disabled {
  opacity: 0.5;
  cursor: default;
}

.board-button-quiet {
  background: none;
  color: inherit;
  border: 1px solid #bbb;
}

.board-action {
  padding: 0;
  border: none;
  background: none;
  color: #666;
  font-size: 0.8rem;
  cursor: pointer;
  text-decoration: underline;
}

.board-action:hover,
.board-action:focus-visible {
  color: #000;
}

/* Rendered post bodies (packages/markup). */
.board-body {
  overflow-wrap: anywhere;
}

/* Screenshots: never wider than the post, and a bounded height so one
   tall image doesn't take over the thread. */
.board-body img {
  display: block;
  max-width: 100%;
  max-height: 600px;
  height: auto;
  margin: 8px 0;
  border-radius: 4px;
  border: 1px solid #e5e5e5;
}

.board-body .mk-image-held {
  display: inline-block;
  margin: 8px 0;
  padding: 4px 8px;
  border: 1px dashed #bbb;
  border-radius: 4px;
  color: #666;
  font-size: 0.85rem;
}

.board-body > :first-child {
  margin-top: 0;
}

.board-body > :last-child {
  margin-bottom: 0;
}

.board-body blockquote {
  margin: 8px 0;
  padding-left: 12px;
  border-left: 3px solid #ccc;
  color: #444;
}

.board-body pre {
  background: #f5f5f5;
  padding: 8px 10px;
  border-radius: 4px;
  overflow-x: auto;
}

.board-body code {
  background: #f5f5f5;
  padding: 0 3px;
  border-radius: 3px;
}

.board-body pre code {
  background: none;
  padding: 0;
}
</style>
