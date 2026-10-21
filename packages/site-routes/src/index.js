// Path <-> view mapping for the "home" page's views (widgets/main's
// switcher), plus the window events navigation travels on. The host app
// (packages/web-app) owns the URL and the router; widgets have no router
// access (independently built), so they ask for a path with
// navigate() and hear the result as ROUTE_EVENT. Bundled into each user,
// same as @widgetgrid/auth-web.

// Request: { path, forceReload?, replace? }. Anyone may dispatch it.
export const NAVIGATE_EVENT = 'widgetgrid:navigate';
// Result, dispatched by the host after every completed navigation (and a
// repeat of the current one): { path, view, post, forceReload }.
export const ROUTE_EVENT = 'widgetgrid:route';
// Cancelable, dispatched by the host before leaving a view (topbar icon or
// the browser's back button alike): { from, to } view names. The widget
// being left may preventDefault() to stay -- see EmbuscadeWidget.vue.
export const BEFORE_NAVIGATE_EVENT = 'widgetgrid:before-navigate';

const VIEW_PATHS = {
  blog: '/blog',
  solitaire: '/games/solitaire',
  embuscade: '/games/embuscade',
  lhoraire: '/site/lhoraire',
  chat: '/chat',
};

// How each view wants the fixed topbar and right rail. topbar: 'scroll'
// (the default) shrinks/expands as MainWidget.vue's content scrolls;
// 'collapsed' pins it compact the whole time the view is active, ignoring
// scroll. railHidden: the view takes the rail's width. Shared rather than
// living in MainWidget.vue so the topbar and rail can start in the right
// state on a deep link (e.g. a bookmarked /games/solitaire) -- they may
// mount after MainWidget.vue has already announced it.
const VIEW_CHROME = {
  // Scroll-driven toggling made the page feel janky while playing, since
  // dragging cards near the top of the board kept crossing the scroll
  // threshold back and forth.
  solitaire: { topbar: 'collapsed', railHidden: true },
  // Same jank reasoning as solitaire, and the game needs the height.
  embuscade: { topbar: 'collapsed', railHidden: true },
  // Chat owns its own internal scroll region (widgets/chat's
  // .chat-messages), so MainWidget.vue's container never scrolls while it
  // shows -- a scroll-driven toggle would never trigger anyway.
  chat: { topbar: 'collapsed', railHidden: false },
  // The issue tree scrolls inside its own grid and wants the room.
  lhoraire: { topbar: 'collapsed', railHidden: true },
};

export function viewChrome(view) {
  return VIEW_CHROME[view] ?? { topbar: 'scroll', railHidden: false };
}

// First path segments that belong to the home page's views rather than
// naming some other DB-driven page.
const SITE_SECTIONS = new Set(['blog', 'games', 'site', 'chat']);

// { view, post } for a home-page path, or null if it isn't one. "/" is the
// blog; "/blog/<post>" is the blog with that post open.
export function parseSitePath(pathname) {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (path === '/') return { view: 'blog', post: null };
  const blog = /^\/blog(?:\/([^/]+))?$/.exec(path);
  if (blog) return { view: 'blog', post: blog[1] ? decodeURIComponent(blog[1]) : null };
  for (const [view, viewPath] of Object.entries(VIEW_PATHS)) {
    if (path === viewPath) return { view, post: null };
  }
  return null;
}

export function sitePath(view, post = null) {
  if (view === 'blog' && post) return `/blog/${encodeURIComponent(post)}`;
  return VIEW_PATHS[view] ?? '/';
}

// True for "/" and anything under a home-page section, including paths
// in a section that don't name a view (yet) -- the host redirects those.
export function isSitePath(pathname) {
  return pathname === '/' || SITE_SECTIONS.has(pathname.split('/')[1]);
}

// The view the address bar currently names. For a widget's initial state:
// it mounts after the host's first ROUTE_EVENT has already gone by.
export function currentSiteRoute() {
  return parseSitePath(window.location.pathname) ?? { view: 'blog', post: null };
}

export function navigate(path, { forceReload = false, replace = false } = {}) {
  window.dispatchEvent(new CustomEvent(NAVIGATE_EVENT, { detail: { path, forceReload, replace } }));
}
