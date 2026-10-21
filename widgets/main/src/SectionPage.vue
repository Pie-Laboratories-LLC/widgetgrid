<template>
  <div class="section-page">
    <h2 class="section-heading">{{ heading }}</h2>
    <p v-if="intro" class="section-intro">{{ intro }}</p>
    <div class="section-entries">
      <!-- Real links (href is the view's path), so middle-click / open in a
           new tab work; a plain click navigates in place instead. -->
      <a
        v-for="entry in entries" :key="entry.view"
        class="section-entry" :class="{ 'section-entry-soon': entry.soon }"
        :href="entry.soon ? undefined : pathFor(entry.view)"
        :aria-disabled="entry.soon ? 'true' : undefined"
        @click="onClick(entry, $event)"
      >
        <span class="section-entry-title">{{ entry.title }}</span>
        <span class="section-entry-description">{{ entry.description }}</span>
        <span v-if="entry.soon" class="section-entry-badge">Coming soon</span>
      </a>
    </div>
  </div>
</template>

<script>
import { sitePath, navigate } from '@widgetgrid/site-routes';

// The /games and /site pages: a heading and a card per thing in that
// section of the topbar. Which entries a section has (and who sees them)
// is MainWidget.vue's call -- this only lays them out.
export default {
  name: 'SectionPage',
  props: {
    heading: { type: String, required: true },
    intro: { type: String, default: '' },
    // [{ view, title, description, soon? }] -- soon: shown, not clickable.
    entries: { type: Array, required: true },
  },
  methods: {
    pathFor(view) {
      return sitePath(view);
    },
    onClick(entry, event) {
      if (entry.soon) {
        event.preventDefault();
        return;
      }
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      navigate(sitePath(entry.view));
    },
  },
};
</script>

<style scoped>
/* Same fluid padding and width cap as BlogWidget.vue's posts, so moving
   between the blog and these pages doesn't shift the content column. */
.section-page {
  padding: clamp(16px, 4vw, 32px);
  max-width: calc(1100px + 2 * 32px);
  box-sizing: border-box;
}

.section-heading {
  margin: 0 0 8px;
}

.section-intro {
  color: #666;
  margin: 0 0 24px;
}

.section-entries {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.section-entry {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  color: inherit;
  text-decoration: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.section-entry:not(.section-entry-soon):hover,
.section-entry:not(.section-entry-soon):focus-visible {
  border-color: #999;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.section-entry-title {
  font-size: 1.2rem;
  font-weight: 600;
}

.section-entry-description {
  color: #555;
}

.section-entry-soon {
  cursor: default;
  opacity: 0.6;
}

.section-entry-badge {
  align-self: flex-start;
  margin-top: 4px;
  padding: 2px 8px;
  border-radius: 999px;
  background: #eee;
  font-size: 0.75rem;
}
</style>
