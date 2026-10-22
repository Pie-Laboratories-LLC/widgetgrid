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

    <div v-if="viewer?.canUploadImages" class="composer-images">
      <button type="button" class="board-action" :disabled="uploading || imageCount >= maxImages" @click="$refs.file.click()">
        {{ uploading ? 'Adding image…' : 'Add image' }}
      </button>
      <input ref="file" type="file" accept="image/*" multiple hidden @change="addImages" />
      <span class="board-muted">{{ imageCount }}/{{ maxImages }} images</span>
      <span v-if="heldNote" class="board-muted">{{ heldNote }}</span>
    </div>
    <p v-else-if="viewer?.imagesFrom" class="board-muted composer-images">
      New accounts can add images from {{ imagesFromText }}.
    </p>
    <p v-if="uploadError" class="board-error">{{ uploadError }}</p>

    <div v-if="showHelp" class="composer-help">
      <table>
        <tbody>
          <tr><td><code>**bold**</code></td><td><strong>bold</strong></td></tr>
          <tr><td><code>*italic*</code></td><td><em>italic</em></td></tr>
          <tr><td><code>_underline_</code></td><td><u>underline</u></td></tr>
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
import { renderMarkup, imageUrls, PALETTE } from '@widgetgrid/markup';
import { boardClient, describe } from './boardClient.js';

const MAX_IMAGES = 5;
// Uploaded board images -- the preview shows them as the post will (the
// server decides for real: only the author's own, and not held ones).
const BOARD_IMAGE = /^\/media\/board\/[A-Za-z0-9_-]{22}\.webp$/;
const previewImage = (url) => (BOARD_IMAGE.test(url) ? { src: url } : null);

// Writing a thread, a reply, or an edit: the text, a live preview, a
// formatting crib (including the colour palette), images (for accounts
// allowed them -- see viewer), and the "email me about replies" opt-in.
// Emits submit({ title, body, notifyReplies }) -- the parent does the
// saving and passes busy/error back.
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
    // BoardViewer: whether images may be added yet.
    viewer: { type: Object, default: null },
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
      maxImages: MAX_IMAGES,
      uploading: false,
      uploadError: '',
      heldNote: '',
    };
  },
  computed: {
    previewHtml() {
      return this.body.trim() ? renderMarkup(this.body, { image: previewImage }) : '<p class="board-muted">Nothing to preview yet.</p>';
    },
    imageCount() {
      return new Set(imageUrls(this.body).filter((url) => BOARD_IMAGE.test(url))).size;
    },
    imagesFromText() {
      return new Date(this.viewer.imagesFrom).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
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
      this.heldNote = '';
    },
    // Each image is uploaded as soon as it's chosen (re-encoded and checked
    // on the server) and its Markdown put where the cursor was.
    async addImages(event) {
      const files = [...event.target.files].slice(0, MAX_IMAGES - this.imageCount);
      event.target.value = '';
      if (!files.length) return;
      this.uploading = true;
      this.uploadError = '';
      const box = this.$refs.body;
      let at = box.selectionStart ?? this.body.length;
      try {
        for (const file of files) {
          const { markdown, status } = await boardClient.uploadImage(file);
          const insert = `${at > 0 && this.body[at - 1] !== '\n' ? '\n' : ''}${markdown}\n`;
          this.body = this.body.slice(0, at) + insert + this.body.slice(at);
          at += insert.length;
          if (status === 'held') this.heldNote = 'An image will show once a moderator has looked at it.';
        }
        this.previewing = false;
        this.$nextTick(() => { box.focus(); box.setSelectionRange(at, at); });
      } catch (err) {
        this.uploadError = describe(err);
      } finally {
        this.uploading = false;
      }
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

.composer-images {
  display: flex;
  gap: 12px;
  align-items: center;
  font-size: 0.85rem;
  margin: 0;
}

.composer-actions {
  display: flex;
  gap: 8px;
}
</style>
