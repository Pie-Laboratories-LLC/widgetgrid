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
  watch: {
    // Vue Router reuses this component instance across navigations between
    // two paths that match the same route record (e.g. /home -> /about),
    // since only the dynamic :slug segment changes -- a mount-only hook
    // would silently not refire, so pass 1/2 has to be driven from a watcher
    // instead of created()/mounted().
    'route.params.slug': {
      immediate: true,
      handler(slug) {
        this.store.loadPage(slug || 'home');
      },
    },
  },
};
</script>
