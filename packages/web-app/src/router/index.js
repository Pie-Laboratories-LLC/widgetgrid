import { createRouter, createWebHistory, START_LOCATION, isNavigationFailure, NavigationFailureType } from 'vue-router';
import {
  parseSitePath, sitePath, isSitePath, NAVIGATE_EVENT, ROUTE_EVENT, BEFORE_NAVIGATE_EVENT,
} from '@widgetgrid/site-routes';

// One catch-all route rather than one route per page: pages are DB-driven,
// so Vue Router can't statically register a route per row. PageView.vue
// works out which page a path belongs to (the home page's own view paths
// -- /blog, /games/..., see @widgetgrid/site-routes -- or "/<slug>" for
// any other page) and re-runs the pass-1 -> pass-2 lifecycle only when
// that page changes. A single route also means the PageView instance (and
// with it every mounted widget) survives moving between the home page's
// views.
const routes = [
  { path: '/:pathMatch(.*)*', name: 'page', component: () => import('../views/PageView.vue') },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from) => {
  // ?view=chat was the deep link before paths existed; push notifications
  // already sitting on someone's phone still carry it.
  if (typeof to.query.view === 'string') return { path: sitePath(to.query.view), replace: true };
  // A section path with no view behind it (yet) -- e.g. /games -- shows
  // the blog rather than a "page not found".
  if (isSitePath(to.path) && !parseSitePath(to.path)) return { path: '/', replace: true };

  if (from === START_LOCATION) return true;
  const fromView = parseSitePath(from.path)?.view;
  const toView = parseSitePath(to.path)?.view;
  if (!fromView || fromView === toView) return true;
  return window.dispatchEvent(new CustomEvent(BEFORE_NAVIGATE_EVENT, {
    detail: { from: fromView, to: toView }, cancelable: true,
  }));
});

// The extras (forceReload) of the navigate request now in flight, handed
// on in the ROUTE_EVENT it produces.
let pending = {};

window.addEventListener(NAVIGATE_EVENT, (event) => {
  const { path, forceReload = false, replace = false } = event.detail;
  pending = { forceReload };
  (replace ? router.replace(path) : router.push(path)).finally(() => { pending = {}; });
});

// Also fires for a repeat of the current path (a "duplicated" failure) --
// the home icon clicked while already on the blog still has to deliver
// its forceReload. Vetoed or superseded navigations announce nothing.
router.afterEach((to, from, failure) => {
  if (failure && !isNavigationFailure(failure, NavigationFailureType.duplicated)) return;
  const site = parseSitePath(to.path);
  if (!site) return;
  window.dispatchEvent(new CustomEvent(ROUTE_EVENT, {
    detail: { path: to.path, ...site, forceReload: !!pending.forceReload },
  }));
});
