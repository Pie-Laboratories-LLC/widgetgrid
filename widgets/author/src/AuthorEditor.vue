<template>
  <div>
    <nav class="author-crumbs">
      <a :href="listPath" @click="go(listPath, $event)">Write</a> ›
      {{ draft?.fileName ? 'Editing a published post' : 'New post' }}
    </nav>
    <p v-if="status === 'loading'" class="author-muted">Loading…</p>
    <p v-else-if="status === 'error'" class="author-error">{{ error }}</p>
    <div v-else class="author-editor">
      <form class="author-fields" @submit.prevent>
        <label class="author-label" for="author-title">Title</label>
        <input id="author-title" v-model="title" class="author-input" type="text" maxlength="200" />

        <label class="author-label" for="author-slug">Address</label>
        <p v-if="draft.fileName" class="author-fixed">/blog/{{ draft.publishedSlug }} <span class="author-muted">(fixed once published)</span></p>
        <div v-else class="author-slug">
          <span class="author-muted">/blog/</span>
          <input id="author-slug" v-model="slug" class="author-input" type="text" maxlength="60" :placeholder="suggestedSlug || 'from the title'" spellcheck="false" />
        </div>

        <label class="author-label" for="author-synopsis">Synopsis <span class="author-muted">(shown in the list and in the email)</span></label>
        <textarea id="author-synopsis" v-model="synopsis" class="author-input" rows="3"></textarea>

        <label class="author-label" for="author-body">Post</label>
        <textarea id="author-body" ref="body" v-model="body" class="author-input author-body" rows="22" @paste="pasteImages"></textarea>

        <div class="author-toolbar">
          <button type="button" class="author-button author-button-quiet" :disabled="uploading" @click="$refs.file.click()">
            {{ uploading ? 'Adding image…' : 'Add image' }}
          </button>
          <input ref="file" type="file" accept="image/*" multiple hidden @change="addImages" />
          <span class="author-muted author-save-state">or paste one into the post</span>
          <span class="author-muted author-save-state">{{ saveState }}</span>
        </div>
        <p v-if="error" class="author-error">{{ error }}</p>

        <div class="author-actions">
          <button type="button" class="author-button" :disabled="publishing || !!missing" @click="publish">
            {{ draft.fileName ? 'Update post' : 'Publish' }}
          </button>
          <span v-if="missing" class="author-muted">{{ missing }}</span>
          <button type="button" class="author-link-button" @click="discard">
            {{ draft.fileName ? 'Discard changes' : 'Delete draft' }}
          </button>
        </div>
        <p class="author-muted author-note">
          Publishing doesn't email anyone. Check the post, then send it to subscribers from
          <a :href="listPath" @click="go(listPath, $event)">Write</a>.
        </p>
      </form>

      <!-- Rendered by the server exactly as the blog will render it. -->
      <article class="author-preview">
        <p class="author-preview-label">Preview</p>
        <h1>{{ preview.title || 'Untitled' }}</h1>
        <div class="author-preview-synopsis" v-html="preview.synopsisHtml"></div>
        <div class="author-preview-content" v-html="preview.contentHtml"></div>
      </article>
    </div>
  </div>
</template>

<script>
import { navigate, writePath } from '@widgetgrid/site-routes';
import { authorClient, describe } from './authorClient.js';

const SAVE_DELAY_MS = 1200;
const PREVIEW_DELAY_MS = 500;

// Same rule as the server's routeSlug: lowercase, runs of anything else
// one hyphen.
const toSlug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60).replace(/-+$/, '');

// /site/write/<draft>: one draft -- a new post, or edits to a published
// one -- beside its live preview. Saves as you type; publishing writes the
// post file and returns to it on the blog.
export default {
  name: 'AuthorEditor',
  props: {
    draftId: { type: String, required: true },
  },
  data() {
    return {
      draft: null, title: '', slug: '', synopsis: '', body: '',
      preview: { title: '', synopsisHtml: '', contentHtml: '' },
      status: 'loading', error: '', saveState: '', dirty: false,
      uploading: false, publishing: false, published: false,
      // True while load() fills the fields, so that isn't taken for typing.
      loading: false,
    };
  },
  computed: {
    listPath: () => writePath(),
    suggestedSlug() {
      return toSlug(this.title);
    },
    // What still stops publishing (the server checks too).
    missing() {
      if (!this.title.trim()) return 'Add a title to publish.';
      if (!this.synopsis.trim()) return 'Write the synopsis to publish.';
      return '';
    },
  },
  watch: {
    title: 'changed',
    slug: 'changed',
    synopsis: 'changed',
    body: 'changed',
  },
  async created() {
    try {
      this.load(await authorClient.getDraft(this.draftId));
      this.status = 'ready';
      this.refreshPreview();
    } catch (err) {
      this.error = describe(err);
      this.status = 'error';
    }
  },
  beforeUnmount() {
    clearTimeout(this.previewTimer);
    clearTimeout(this.saveTimer);
    // Leaving with unsaved typing: save it on the way out.
    if (this.dirty && !this.published) this.save();
  },
  methods: {
    load(draft) {
      this.draft = draft;
      this.loading = true;
      Object.assign(this, { title: draft.title, slug: draft.slug, synopsis: draft.synopsis, body: draft.body });
      this.$nextTick(() => { this.loading = false; });
    },
    changed() {
      if (this.loading || !this.draft) return;
      this.dirty = true;
      this.saveState = 'Unsaved changes';
      clearTimeout(this.saveTimer);
      this.saveTimer = setTimeout(() => this.save(), SAVE_DELAY_MS);
      clearTimeout(this.previewTimer);
      this.previewTimer = setTimeout(() => this.refreshPreview(), PREVIEW_DELAY_MS);
    },
    fields() {
      return { title: this.title, synopsis: this.synopsis, body: this.body };
    },
    async save() {
      clearTimeout(this.saveTimer);
      this.dirty = false;
      this.saveState = 'Saving…';
      try {
        this.draft = await authorClient.saveDraft({ id: this.draft.id, ...this.fields(), slug: this.slug || this.suggestedSlug });
        if (!this.dirty) this.saveState = 'Saved';
        return true;
      } catch (err) {
        this.dirty = true;
        this.saveState = '';
        this.error = describe(err);
        return false;
      }
    },
    async refreshPreview() {
      try {
        this.preview = await authorClient.preview({ draftId: this.draft.id, ...this.fields() });
      } catch {
        // The next keystroke tries again; saving reports real trouble.
      }
    },
    addImages(event) {
      const files = [...event.target.files];
      event.target.value = '';
      this.uploadImages(files);
    },
    // Pasting a screenshot (or a copied image) adds it, like Add image.
    // Copying from a spreadsheet or word processor brings text AND a
    // picture of it -- that's a text paste, left alone.
    pasteImages(event) {
      const clipboard = event.clipboardData;
      if (clipboard?.types?.includes('text/plain')) return;
      const files = [...(clipboard?.files ?? [])].filter((f) => f.type.startsWith('image/'));
      if (!files.length) return;
      event.preventDefault();
      this.uploadImages(files);
    },
    async uploadImages(files) {
      if (!files.length || this.uploading) return;
      this.uploading = true;
      this.error = '';
      const box = this.$refs.body;
      let at = box.selectionStart ?? this.body.length;
      try {
        for (const file of files) {
          const { markdown } = await authorClient.uploadImage(this.draft.id, file);
          const insert = `${at > 0 && this.body[at - 1] !== '\n' ? '\n\n' : ''}${markdown}\n\n`;
          this.body = this.body.slice(0, at) + insert + this.body.slice(at);
          at += insert.length;
        }
        await this.save();
        await this.refreshPreview();
        this.$nextTick(() => { box.focus(); box.setSelectionRange(at, at); });
      } catch (err) {
        this.error = describe(err);
      } finally {
        this.uploading = false;
      }
    },
    async publish() {
      const what = this.draft.fileName ? 'Update the published post' : `Publish at /blog/${this.slug || this.suggestedSlug}`;
      if (!window.confirm(`${what}? Subscribers won't be emailed until you send it from Write.`)) return;
      this.publishing = true;
      this.error = '';
      try {
        if (!(await this.save())) return;
        const slug = await authorClient.publish(this.draft.id);
        // The draft is gone now -- nothing to save on the way out.
        this.published = true;
        clearTimeout(this.saveTimer);
        navigate(`/blog/${slug}`);
      } catch (err) {
        this.error = describe(err);
      } finally {
        this.publishing = false;
      }
    },
    async discard() {
      const question = this.draft.fileName
        ? 'Discard these changes? The published post stays as it is.'
        : 'Delete this draft and its images?';
      if (!window.confirm(question)) return;
      clearTimeout(this.saveTimer);
      this.dirty = false;
      try {
        await authorClient.deleteDraft(this.draft.id);
        navigate(writePath());
      } catch (err) {
        this.error = describe(err);
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
.author-crumbs {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 12px;
}

.author-crumbs a {
  color: inherit;
}

.author-editor {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 24px;
}

@media (min-width: 1000px) {
  .author-editor {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }

  .author-preview {
    position: sticky;
    top: 12px;
    max-height: calc(100vh - 140px);
    overflow-y: auto;
  }
}

.author-fields {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.author-label {
  font-weight: 600;
  font-size: 0.9rem;
  margin-top: 8px;
}

.author-input {
  width: 100%;
  box-sizing: border-box;
  padding: 8px 10px;
  border: 1px solid #bbb;
  border-radius: 6px;
  font: inherit;
}

.author-body {
  font-family: ui-monospace, Menlo, Consolas, monospace;
  font-size: 0.9rem;
  line-height: 1.5;
  resize: vertical;
}

.author-slug {
  display: flex;
  align-items: center;
  gap: 4px;
}

.author-fixed {
  margin: 0;
}

.author-toolbar,
.author-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 8px;
}

.author-save-state {
  font-size: 0.85rem;
}

.author-note {
  font-size: 0.85rem;
}

.author-preview {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px 20px;
  overflow-wrap: anywhere;
}

.author-preview-label {
  margin: 0 0 8px;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #888;
}

.author-preview h1 {
  margin: 0 0 8px;
}

.author-preview-synopsis {
  color: #555;
  font-style: italic;
  border-bottom: 1px solid #eee;
  margin-bottom: 16px;
}

.author-preview :deep(img) {
  max-width: 100%;
  height: auto;
}
</style>
