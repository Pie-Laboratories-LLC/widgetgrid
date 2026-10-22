<template>
  <div class="widget widget-author">
    <p v-if="!isOwner" class="author-muted">Only the site owner writes the blog. <a :href="loginHref" @click="go(loginHref, $event)">Log in</a> if that's you.</p>
    <AuthorEditor v-else-if="data.draft" :key="data.draft" :draft-id="data.draft" />
    <PostList v-else />
  </div>
</template>

<script>
import { getIdentity, IDENTITY_CHANGED_EVENT } from '@widgetgrid/auth-web';
import { navigate, sitePath } from '@widgetgrid/site-routes';
import AuthorEditor from './AuthorEditor.vue';
import PostList from './PostList.vue';

// /site/write: the owner's posts and drafts (PostList), or one draft
// (AuthorEditor) at /site/write/<draft>. Owner only -- the server enforces
// it; this just doesn't offer the page to anyone else.
export default {
  name: 'AuthorWidget',
  components: { AuthorEditor, PostList },
  props: {
    // { draft }: the draft id from the address, or null for the list.
    data: { type: Object, required: true },
    title: { type: String, default: '' },
  },
  data() {
    return { isOwner: getIdentity()?.role === 'owner' };
  },
  computed: {
    loginHref() {
      return `${sitePath('login')}?return=${encodeURIComponent(window.location.pathname)}`;
    },
  },
  created() {
    this.onIdentity = () => { this.isOwner = getIdentity()?.role === 'owner'; };
    window.addEventListener(IDENTITY_CHANGED_EVENT, this.onIdentity);
  },
  beforeUnmount() {
    window.removeEventListener(IDENTITY_CHANGED_EVENT, this.onIdentity);
  },
  methods: {
    go(path, event) {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      navigate(path);
    },
  },
};
</script>

<style>
/* Shared by the list and the editor (unscoped, prefixed). Same padding as
   the blog and the boards; wider, since the editor sits beside its
   preview. */
.widget-author {
  padding: clamp(16px, 4vw, 32px);
  max-width: 1400px;
  box-sizing: border-box;
}

.widget-author h2 {
  margin: 0 0 12px;
}

.author-muted {
  color: #666;
}

.author-error {
  color: #b42318;
}

.author-success {
  color: #2e7d32;
}

.author-button {
  padding: 6px 16px;
  border: none;
  border-radius: 6px;
  background: rgb(5, 5, 5);
  color: #f4ead9;
  font-size: 0.95rem;
  cursor: pointer;
}

.author-button:disabled {
  opacity: 0.5;
  cursor: default;
}

.author-button-quiet {
  background: none;
  color: inherit;
  border: 1px solid #bbb;
}

.author-link-button {
  padding: 0;
  border: none;
  background: none;
  color: #444;
  font-size: 0.85rem;
  text-decoration: underline;
  cursor: pointer;
}

.author-link-button:disabled {
  color: #999;
  cursor: default;
}
</style>
