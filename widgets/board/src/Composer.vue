<template>
  <form class="composer" @submit.prevent="submit">
    <input
      v-if="withTitle" v-model="title" class="composer-title" type="text" maxlength="200"
      placeholder="Title" aria-label="Title" required
    />
    <div class="composer-tabs" role="tablist">
      <button type="button" role="tab" :aria-selected="!previewing" :class="{ active: !previewing }" @click="previewing = false">Write</button>
      <button type="button" role="tab" :aria-selected="previewing" :class="{ active: previewing }" @click="previewing = true">Preview</button>
      <button type="button" class="composer-help-toggle" :aria-expanded="showHelp" @click="showHelp = !showHelp">Formatting help</button>
    </div>
    <textarea
      v-show="!previewing" ref="body" v-model="body" class="composer-body" rows="6" maxlength="20000"
      :placeholder="placeholder" aria-label="Post"
    ></textarea>
    <!-- Same renderer the server uses (packages/markup), so this is what
         will be posted. -->
    <div v-if="previewing" class="composer-preview board-body" v-html="previewHtml"></div>

    <div v-if="showHelp" class="composer-help">
      <table>
        <tbody>
          <tr><td><code>**bold**</code></td><td><strong>bold</strong></td></tr>
          <tr><td><code>*italic*</code></td><td><em>italic</em></td></tr>
          <tr><td><code>~~struck~~</code></td><td><del>struck</del></td></tr>
          <tr><td><code>`code`</code></td><td><code>code</code></td></tr>
          <tr><td><code>[link](https://…)</code></td><td>a link (plain URLs work too)</td></tr>
          <tr><td><code>&gt; quote</code></td><td>a quoted line</td></tr>
          <tr><td><code>- item</code></td><td>a list</td></tr>
        </tbody>
      </table>
      <p>Colour: <code>:red[text]</code>. Colours:
        <span v-for="(hex, name) in palette" :key="name" class="composer-swatch" :style="{ color: `var(--mk-${name}, ${hex})` }">{{ name }}</span>
      </p>
    </div>

    <label class="composer-notify">
      <input v-model="notifyReplies" type="checkbox" />
      Email me about replies to this post
    </label>
    <div class="composer-actions">
      <button type="submit" class="board-button" :disabled="busy || !body.trim() || (withTitle && !title.trim())">{{ submitLabel }}</button>
      <button v-if="cancellable" type="button" class="board-button board-button-quiet" :disabled="busy" @click="$emit('cancel')">Cancel</button>
    </div>
    <p v-if="error" class="board-error">{{ error }}</p>
  </form>
</template>

<script>
import { renderMarkup, PALETTE } from '@widgetgrid/markup';

// Writing a thread, a reply, or an edit: the text, a live preview, a
// formatting crib (including the colour palette), and the "email me about
// replies" opt-in. Emits submit({ title, body, notifyReplies }) -- the
// parent does the saving and passes busy/error back.
export default {
  name: 'Composer',
  props: {
    withTitle: { type: Boolean, default: false },
    initialTitle: { type: String, default: '' },
    initialBody: { type: String, default: '' },
    initialNotify: { type: Boolean, default: false },
    submitLabel: { type: String, default: 'Post' },
    placeholder: { type: String, default: '' },
    cancellable: { type: Boolean, default: false },
    autofocus: { type: Boolean, default: false },
    busy: { type: Boolean, default: false },
    error: { type: String, default: '' },
  },
  emits: ['submit', 'cancel'],
  data() {
    return {
      title: this.initialTitle,
      body: this.initialBody,
      notifyReplies: this.initialNotify,
      previewing: false,
      showHelp: false,
      palette: PALETTE,
    };
  },
  computed: {
    previewHtml() {
      return this.body.trim() ? renderMarkup(this.body) : '<p class="board-muted">Nothing to preview yet.</p>';
    },
  },
  mounted() {
    if (this.autofocus) this.$refs.body.focus();
  },
  methods: {
    submit() {
      this.$emit('submit', { title: this.title.trim(), body: this.body, notifyReplies: this.notifyReplies });
    },
    // The parent calls this after a successful post, so the box is ready
    // for another.
    reset() {
      this.title = '';
      this.body = '';
      this.previewing = false;
    },
  },
};
</script>

<style scoped>
.composer {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 12px 0;
}

.composer-title,
.composer-body {
  padding: 8px 10px;
  border: 1px solid #bbb;
  border-radius: 6px;
  font: inherit;
}

.composer-body {
  resize: vertical;
  min-height: 6em;
}

.composer-tabs {
  display: flex;
  gap: 4px;
  align-items: center;
  font-size: 0.85rem;
}

.composer-tabs button {
  padding: 2px 10px;
  border: 1px solid transparent;
  border-radius: 4px;
  background: none;
  cursor: pointer;
}

.composer-tabs button.active {
  border-color: #bbb;
  background: #f5f5f5;
}

.composer-help-toggle {
  margin-left: auto;
  color: #666;
  text-decoration: underline;
}

.composer-preview {
  min-height: 6em;
  padding: 8px 10px;
  border: 1px dashed #bbb;
  border-radius: 6px;
}

.composer-help {
  font-size: 0.85rem;
  padding: 8px 10px;
  background: #faf9f6;
  border-radius: 6px;
}

.composer-help table {
  border-collapse: collapse;
}

.composer-help td {
  padding: 2px 16px 2px 0;
}

.composer-help p {
  margin: 8px 0 0;
}

.composer-swatch {
  margin-left: 8px;
  font-weight: 600;
}

.composer-notify {
  font-size: 0.9rem;
  display: flex;
  gap: 6px;
  align-items: center;
}

.composer-actions {
  display: flex;
  gap: 8px;
}
</style>
