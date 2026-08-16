import { createRouter, createWebHistory } from 'vue-router';

// One dynamic route rather than one route per page: pages are DB-driven, so
// Vue Router can't statically register a route per row. PageView.vue watches
// route.params.slug and re-runs the pass-1 -> pass-2 lifecycle on change.
const routes = [
  { path: '/:slug?', name: 'page', component: () => import('../views/PageView.vue') },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
