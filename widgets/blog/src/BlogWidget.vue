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
    <!-- Contact panel: pinned to the bottom-right of the visible area
         (sticky, zero-height anchor) rather than to the end of the posts.
         Pointer devices see it while hovering the blog; touch devices,
         which can't hover, get a toggle button instead. -->
    <div class="contact-anchor">
      <div class="contact" :class="{ 'contact-open': contactOpen }">
        <div id="blog-contact-panel" class="contact-panel">
          <a class="contact-address" :href="`mailto:${WEBMASTER}`">{{ WEBMASTER }}</a>
          <span class="contact-buttons">
            <a class="contact-button" :href="subscribePath" @click="onSubscribeClick">Subscribe</a>
            <!-- A real file URL (packages/static-server serves it), so no
                 in-app navigation: browsers show or offer the feed. -->
            <a class="contact-button" href="/rss.xml">RSS</a>
          </span>
        </div>
        <button
          type="button" class="contact-toggle" aria-label="Contact" aria-controls="blog-contact-panel"
          :aria-expanded="contactOpen ? 'true' : 'false'" @click="contactOpen = !contactOpen"
        >
          <!-- Tabler Icons "mail" (MIT). -->
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z" />
            <path d="M3 7l9 6l9 -6" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { sitePath, parseSitePath, navigate } from '@widgetgrid/site-routes';
import { blogClient } from './blogClient.js';

const WEBMASTER = 'webmaster@pie-laboratories.com';

export default {
  name: 'BlogWidget',
  props: {
    data: { type: Object, required: true },
    title: { type: String, default: '' },
  },
  data() {
    return { posts: [], status: 'loading', contactOpen: false, WEBMASTER };
  },
  computed: {
    subscribePath() {
      return sitePath('subscribe');
    },
    // data.post is the post the URL names (/blog/<slug>, passed down by
    // MainWidget.vue); with none, or one that doesn't exist, the newest
    // is open.
    expandedSlug() {
      const named = this.posts.find((p) => p.slug === this.data.post);
      return named?.slug ?? this.posts[0]?.slug ?? null;
    },
  },
  watch: {
    'data.post'() {
      this.scrollToPost();
    },
  },
  created() {
    blogClient.listBlogPosts()
      .then((res) => {
        this.posts = res.posts;
        this.status = 'ready';
        this.scrollToPost();
      })
      .catch(() => {
        this.status = 'error';
      });
  },
  methods: {
    onSubscribeClick(event) {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      navigate(this.subscribePath);
    },
    // Brings the URL's post to the top of MainWidget.vue's scroll
    // container -- on a deep link, and on clicking a post further down
    // (the one above it collapsing would otherwise leave it wherever that
    // shifted it to).
    scrollToPost() {
      if (!this.data.post) return;
      this.$nextTick(() => {
        document.getElementById(`post-${this.expandedSlug}`)?.scrollIntoView({ block: 'start' });
      });
    },
    formatDate(isoDateTime) {
      return new Date(isoDateTime).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      });
    },
    // Only one post is ever expanded, the one the URL names -- clicking a
    // collapsed (synopsis) post navigates to its /blog/<slug>, which opens
    // it and implicitly closes whichever was open before. A link to one of
    // the site's own views (e.g. a cross-post link, see blogSource.js's
    // rewriteCrossPostLink) becomes an in-app navigation instead of a full
    // page load; any other link just behaves as a link.
    onPostClick(post, event) {
      const link = event.target.closest('a');
      if (link) {
        const url = new URL(link.href, window.location.href);
        const plainClick = !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
        if (plainClick && url.origin === window.location.origin && !link.target && parseSitePath(url.pathname)) {
          event.preventDefault();
          navigate(url.pathname + url.search + url.hash);
        }
        return;
      }
      if (post.slug !== this.expandedSlug) navigate(sitePath('blog', post.slug));
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
  /* Wide enough to use most of the content column on a desktop screen,
     still capped so lines don't run the full width of a very wide one. */
  max-width: 1100px;
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
   constrained them to the .post's own max-width, so a large source
   image (e.g. a raw screen capture) could blow well past the column and
   dominate the whole main content area. height: auto keeps the aspect
   ratio when max-width actually kicks in and scales it down. */
.post-body :deep(img) {
  max-width: 100%;
  height: auto;
}

.contact-anchor {
  position: sticky;
  bottom: 0;
  height: 0;
  z-index: 5;
}

.contact {
  position: absolute;
  right: 0;
  bottom: 16px;
  display: flex;
  /* Panel stacked above the toggle (touch), not beside it: beside it, the
     open panel ran off the left edge of a phone-width content column. */
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.contact-panel {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-items: center;
  gap: 8px 12px;
  padding: 10px 14px;
  border-radius: 8px;
  background: rgb(5, 5, 5);
  color: #f4ead9;
  font-size: 0.85rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  transition: opacity 0.2s ease;
}

.contact-address {
  white-space: nowrap;
  color: inherit;
  text-decoration: none;
}

.contact-address:hover,
.contact-address:focus-visible {
  text-decoration: underline;
}

.contact-buttons {
  display: flex;
  gap: 8px;
}

.contact-button {
  padding: 4px 12px;
  border: 1px solid rgba(244, 234, 217, 0.4);
  border-radius: 6px;
  color: inherit;
  text-decoration: none;
}

.contact-button:hover,
.contact-button:focus-visible {
  background: rgba(244, 234, 217, 0.12);
}

.contact-toggle {
  display: none;
  padding: 10px;
  border: none;
  border-radius: 999px;
  background: rgb(5, 5, 5);
  color: #f4ead9;
  line-height: 0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  cursor: pointer;
}

.contact-toggle svg {
  width: 22px;
  height: 22px;
}

/* Pointer devices: hidden until the pointer is over the blog (or focus is
   inside the panel, so it's reachable by keyboard). */
@media (hover: hover) {
  .contact-panel {
    opacity: 0;
    pointer-events: none;
  }

  .widget-blog:hover .contact-panel,
  .contact-panel:focus-within {
    opacity: 1;
    pointer-events: auto;
  }
}

/* Touch devices: the toggle button, and the panel only while it's open. */
@media (hover: none) {
  .contact-toggle {
    display: block;
  }

  .contact:not(.contact-open) .contact-panel {
    display: none;
  }
}
</style>
