<template>
  <div>
    <h2>Message boards</h2>
    <p class="board-muted">Feedback and discussion about the games and the site.</p>
    <p v-if="status === 'loading'" class="board-muted">Loading…</p>
    <p v-else-if="status === 'error'" class="board-error">{{ error }}</p>
    <div v-else class="board-sections">
      <a
        v-for="section in sections" :key="section.slug" class="board-section"
        :href="pathFor(section)" @click="go(pathFor(section), $event)"
      >
        <span class="board-section-name">{{ section.name }}</span>
        <span class="board-section-description">{{ section.description }}</span>
        <span class="board-muted">{{ section.threadCount }} {{ section.threadCount === 1 ? 'thread' : 'threads' }}</span>
      </a>
    </div>
    <PostingNotice v-if="viewer" :viewer="viewer" />
    <HeldImages v-if="viewer?.moderator" />
  </div>
</template>

<script>
import { boardPath, navigate } from '@widgetgrid/site-routes';
import { boardClient, describe } from './boardClient.js';
import PostingNotice from './PostingNotice.vue';
import HeldImages from './HeldImages.vue';

// /site/messages: the sections (and, for moderators, images waiting for
// review).
export default {
  name: 'SectionsPage',
  components: { PostingNotice, HeldImages },
  data() {
    return { sections: [], viewer: null, status: 'loading', error: '' };
  },
  async created() {
    try {
      ({ sections: this.sections, viewer: this.viewer } = await boardClient.listSections());
      this.status = 'ready';
    } catch (err) {
      this.error = describe(err);
      this.status = 'error';
    }
  },
  methods: {
    pathFor(section) {
      return boardPath({ section: section.slug });
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
.board-sections {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
  margin: 16px 0 24px;
}

.board-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  color: inherit;
  text-decoration: none;
}

.board-section:hover,
.board-section:focus-visible {
  border-color: #999;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.board-section-name {
  font-size: 1.2rem;
  font-weight: 600;
}

.board-section-description {
  color: #555;
}
</style>
