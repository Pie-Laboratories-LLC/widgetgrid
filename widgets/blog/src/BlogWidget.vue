<template>
  <div class="widget widget-blog">
    <p v-if="status === 'loading'" class="blog-status">Loading posts…</p>
    <p v-else-if="status === 'error'" class="blog-status">Couldn't load posts.</p>
    <p v-else-if="posts.length === 0" class="blog-status">No posts yet.</p>
    <article
      v-for="post in posts" v-else :key="post.slug"
      :id="`post-${post.slug}`" class="post" :class="{ 'post-open': post.slug === expandedSlug }"
      @click="onPostClick(post, $event)"
    >
      <h2 class="post-title">{{ post.title }}</h2>
      <time class="post-date" :datetime="post.publishedAt">{{ formatDate(post.publishedAt) }}</time>
      <div class="post-body" v-html="post.slug === expandedSlug ? post.contentHtml : post.synopsisHtml"></div>
    </article>
  </div>
</template>

<script>
import { blogClient } from './blogClient.js';

export default {
  name: 'BlogWidget',
  props: {
    data: { type: Object, required: true },
    title: { type: String, default: '' },
  },
  data() {
    return { posts: [], status: 'loading', expandedSlug: null };
  },
  created() {
    blogClient.listBlogPosts()
      .then((res) => {
        this.posts = res.posts;
        this.expandedSlug = res.posts[0]?.slug ?? null; // newest open by default
        this.status = 'ready';
      })
      .catch(() => {
        this.status = 'error';
      });
  },
  methods: {
    formatDate(isoDateTime) {
      return new Date(isoDateTime).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      });
    },
    // Only one post is ever expanded -- clicking a collapsed (synopsis)
    // post opens it and implicitly closes whichever was open before, since
    // that's just what setting expandedSlug to a new value does. A real
    // link inside a synopsis (e.g. a cross-post link, see blogSource.js's
    // rewriteCrossPostLink) should still just navigate, not also fight
    // with this for what's expanded.
    onPostClick(post, event) {
      if (event.target.closest('a')) return;
      this.expandedSlug = post.slug;
    },
  },
};
</script>

<style scoped>
/* Clearing the fixed topbar/right rail and owning the scroll container is
   widgets/main's job now, not this widget's -- this only ever mounts as a
   child of MainWidget (see its own comment for why), never placed directly
   by the page layout itself anymore. */
.widget-blog {
  /* Fluid like RightRailWidget.vue's own clamp()-based spacing -- a flat
     32px on each side was over 60px of combined dead horizontal space on
     a narrow phone, on top of MainWidget.vue's own margin-right already
     ceding room to the rail. */
  padding: clamp(16px, 4vw, 32px);
  box-sizing: border-box;
}

.blog-status {
  color: #666;
}

.post {
  max-width: 640px;
  margin: 0 0 40px;
  padding-bottom: 40px;
  border-bottom: 1px solid #ddd;
}

.post:last-child {
  border-bottom: none;
}

.post:not(.post-open) {
  cursor: pointer;
}

.post:not(.post-open):hover .post-title {
  text-decoration: underline;
}

.post-title {
  margin: 0 0 4px;
}

.post-date {
  display: block;
  color: #888;
  font-size: 0.85rem;
  margin-bottom: 16px;
}

.post-body :deep(h1) {
  font-size: 1.2rem;
}

/* Post images render at their native pixel size otherwise -- nothing
   constrained them to the .post's own 640px max-width, so a large source
   image (e.g. a raw screen capture) could blow well past the column and
   dominate the whole main content area. height: auto keeps the aspect
   ratio when max-width actually kicks in and scales it down. */
.post-body :deep(img) {
  max-width: 100%;
  height: auto;
}
</style>
