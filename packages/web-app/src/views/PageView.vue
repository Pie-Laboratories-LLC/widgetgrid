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
  watch: {
    // Vue Router reuses this component instance across navigations between
    // two paths that match the same route record (e.g. /home -> /about),
    // since only the dynamic :slug segment changes -- a mount-only hook
    // would silently not refire, so pass 1/2 has to be driven from a watcher
    // instead of created()/mounted().
    'route.params.slug': {
      immediate: true,
      handler(slug) {
        this.loadPageOrSplash(slug || 'home');
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
    loadPageOrSplash(slug) {
      if (slug === 'home' && !hasSeenSplash()) {
        markSplashSeen();
        this.store.loadPage('splash');
        return;
      }
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
