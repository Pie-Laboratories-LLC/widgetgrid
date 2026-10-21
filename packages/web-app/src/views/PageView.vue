<template>
  <div v-if="store.layoutStatus === 'loading'" class="container-fluid py-4">
    <p>Loading…</p>
  </div>
  <div v-else-if="store.layoutStatus === 'error'" class="container-fluid py-4">
    <p class="text-danger">Couldn't load this page: {{ store.error?.message }}</p>
  </div>
  <template v-else-if="store.layoutRoot">
    <h1 class="visually-hidden">{{ store.title }}</h1>
    <LayoutRenderer :node="store.layoutRoot" />
    <p v-if="store.contentStatus === 'error'" class="text-danger container-fluid">
      Some widgets failed to load: {{ store.error?.message }}
    </p>
  </template>
</template>

<script>
import { useRoute } from 'vue-router';
import { isSitePath } from '@widgetgrid/site-routes';
import { usePageStore } from '@/stores/pageStore';
import LayoutRenderer from '@/components/LayoutRenderer.vue';

export default {
  name: 'PageView',
  components: { LayoutRenderer },
  setup() {
    // Options-API component, but useRoute()/usePageStore() are plain
    // function calls (not Composition-API reactivity primitives being
    // exposed to the template) -- this keeps the store instance and the
    // reactive route accessible via `this` below without adding a real
    // Composition API surface to the component.
    return { route: useRoute(), store: usePageStore() };
  },
  created() {
    // SplashWidget.vue dispatches this when its logo/overlay is clicked --
    // it has no router access of its own (independently built/deployed,
    // same reasoning as every other cross-widget window event in this
    // app), so swapping back to the home layout in place (no real
    // navigation, no URL change) happens here instead.
    window.addEventListener('widgetgrid:splash-dismissed', this.onSplashDismissed);
  },
  beforeUnmount() {
    window.removeEventListener('widgetgrid:splash-dismissed', this.onSplashDismissed);
  },
  computed: {
    // Every home-page view path (/, /blog/..., /games/..., /site/...,
    // /chat) is the "home" page -- which view shows is MainWidget.vue's
    // business, not a different page. Anything else is "/<slug>/...".
    pageSlug() {
      return isSitePath(this.route.path) ? 'home' : this.route.path.split('/')[1];
    },
  },
  watch: {
    // The single catch-all route (see router/index.js) means this
    // component instance is reused across every navigation -- a mount-only
    // hook would silently not refire, so pass 1/2 has to be driven from a
    // watcher instead of created()/mounted(). Keyed on the page, not the
    // path: moving between the home page's own views must not reload it.
    pageSlug: {
      immediate: true,
      handler(slug) {
        this.loadPageOrSplash(slug);
      },
    },
  },
  methods: {
    // Splash used to be its own separately-linked page (slug "splash");
    // now it's a first-visit-of-the-session interstitial in front of home
    // specifically, gated by a plain session cookie (no Max-Age/Expires,
    // so it clears when the browser closes and splash shows again next
    // session) rather than anything server-side -- "have you seen this in
    // this browser session" has no reason to touch the backend at all.
    // Only on the bare "/": a deep link (a bookmark, a shared post) goes
    // straight to what it names, and counts as having seen it.
    loadPageOrSplash(slug) {
      if (slug === 'home' && this.route.path === '/' && !hasSeenSplash()) {
        markSplashSeen();
        this.store.loadPage('splash');
        return;
      }
      if (slug === 'home') markSplashSeen();
      this.store.loadPage(slug);
    },
    onSplashDismissed() {
      this.store.loadPage('home');
    },
  },
};

const SPLASH_COOKIE = 'widgetgrid_seen_splash';

function hasSeenSplash() {
  return document.cookie.split('; ').some((c) => c.startsWith(`${SPLASH_COOKIE}=`));
}

function markSplashSeen() {
  // No Max-Age/Expires -- a session cookie, cleared when the browser
  // closes, which is exactly "first time in a session" per the feature
  // request.
  document.cookie = `${SPLASH_COOKIE}=1; path=/; SameSite=Lax`;
}
</script>
