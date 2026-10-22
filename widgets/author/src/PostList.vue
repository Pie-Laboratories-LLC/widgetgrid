<template>
  <div>
    <h2>Write</h2>
    <button type="button" class="author-button" :disabled="creating" @click="newPost">New post</button>
    <p v-if="message" class="author-success">{{ message }}</p>
    <p v-if="error" class="author-error">{{ error }}</p>

    <p v-if="status === 'loading'" class="author-muted">Loading…</p>
    <template v-else-if="status === 'ready'">
      <template v-if="drafts.length">
        <h3>Drafts</h3>
        <ul class="author-list">
          <li v-for="draft in drafts" :key="draft.id">
            <a :href="editPath(draft.id)" @click="go(editPath(draft.id), $event)">{{ draft.title || 'Untitled' }}</a>
            <span class="author-muted"> · saved {{ when(draft.updatedAt) }}</span>
          </li>
        </ul>
      </template>

      <h3>Published</h3>
      <p v-if="!posts.length" class="author-muted">Nothing published yet.</p>
      <ul class="author-list">
        <li v-for="post in posts" :key="post.fileName">
          <div>
            <a :href="`/blog/${post.slug}`" @click="go(`/blog/${post.slug}`, $event)">{{ post.title }}</a>
            <span class="author-muted"> · {{ when(post.publishedAt) }}</span>
          </div>
          <div class="author-post-actions">
            <button type="button" class="author-link-button" @click="edit(post)">{{ post.draftId ? 'Continue editing' : 'Edit' }}</button>
            <span v-if="post.emailedAt" class="author-muted">Emailed to subscribers {{ when(post.emailedAt) }}</span>
            <button
              v-else type="button" class="author-link-button" :disabled="sending === post.slug"
              @click="email(post)"
            >{{ sending === post.slug ? 'Sending…' : 'Email subscribers' }}</button>
          </div>
        </li>
      </ul>
    </template>
  </div>
</template>

<script>
import { navigate, writePath } from '@widgetgrid/site-routes';
import { authorClient, describe } from './authorClient.js';

// /site/write: drafts of new posts, and every published post with its
// edit and email-subscribers actions. Emailing is never automatic -- it
// happens here, once per post, when asked.
export default {
  name: 'PostList',
  data() {
    return {
      posts: [], drafts: [], status: 'loading', error: '', message: '', creating: false, sending: '',
    };
  },
  async created() {
    await this.load();
  },
  methods: {
    async load() {
      try {
        Object.assign(this, await authorClient.list());
        this.status = 'ready';
      } catch (err) {
        this.error = describe(err);
        this.status = 'error';
      }
    },
    editPath: (id) => writePath(id),
    when(iso) {
      if (!iso) return '';
      return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
    },
    async newPost() {
      this.creating = true;
      try {
        navigate(writePath((await authorClient.createDraft()).id));
      } catch (err) {
        this.error = describe(err);
      } finally {
        this.creating = false;
      }
    },
    async edit(post) {
      try {
        navigate(writePath((await authorClient.createDraft(post.fileName)).id));
      } catch (err) {
        this.error = describe(err);
      }
    },
    async email(post) {
      if (!window.confirm(`Email every subscriber about "${post.title}"? This can only be done once.`)) return;
      this.sending = post.slug;
      this.error = '';
      this.message = '';
      try {
        const sentTo = await authorClient.emailSubscribers(post.slug);
        this.message = `Emailed "${post.title}" to ${sentTo} subscriber${sentTo === 1 ? '' : 's'}.`;
        await this.load();
      } catch (err) {
        this.error = describe(err);
      } finally {
        this.sending = '';
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
h3 {
  margin: 24px 0 8px;
  font-size: 1rem;
}

.author-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.author-list li {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.author-list a {
  color: inherit;
  font-weight: 600;
}

.author-post-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 4px;
  font-size: 0.85rem;
}
</style>
