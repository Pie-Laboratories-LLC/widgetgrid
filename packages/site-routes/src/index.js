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
  games: '/games',
  solitaire: '/games/solitaire',
  embuscade: '/games/embuscade',
  lastnaming: '/games/the-last-naming',
  site: '/site',
  lhoraire: '/site/lhoraire',
  messages: '/site/messages',
  subscribe: '/site/subscribe',
  login: '/site/login',
  register: '/site/register',
  account: '/site/account',
  write: '/site/write',
  chat: '/chat',
};

// Which topbar icon a view sits under -- the section pages (/games,
// /site) and everything reached from them.
const VIEW_SECTIONS = {
  blog: 'blog',
  games: 'games',
  solitaire: 'games',
  embuscade: 'games',
  lastnaming: 'games',
  site: 'site',
  lhoraire: 'site',
  messages: 'site',
  subscribe: 'site',
  login: 'site',
  register: 'site',
  account: 'site',
  write: 'site',
  chat: 'chat',
};

export function sectionOf(view) {
  return VIEW_SECTIONS[view] ?? null;
}

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
  // A full-bleed 3D scene: it wants every pixel, and scrolling has no
  // meaning in it.
  lastnaming: { topbar: 'collapsed', railHidden: true },
  // Chat owns its own internal scroll region (widgets/chat's
  // .chat-messages), so MainWidget.vue's container never scrolls while it
  // shows -- a scroll-driven toggle would never trigger anyway.
  chat: { topbar: 'collapsed', railHidden: false },
  // The issue tree scrolls inside its own grid and wants the room.
  lhoraire: { topbar: 'collapsed', railHidden: true },
  // Nested replies need the width -- with the rail, a phone left a deep
  // reply a narrow column. The topbar still shrinks on scroll, as on the
  // blog.
  messages: { topbar: 'scroll', railHidden: true },
  // The editor sits beside its preview -- it wants the width too.
  write: { topbar: 'scroll', railHidden: true },
};

// Views not ready to be shown: each names the feature flag (in Consul,
// see @widgetgrid/feature-flags) that has to be on before it is. Off, it's
// left out of its section page and its path goes to the home page. The
// flag is the l'horaire issue tracking the work.
const VIEW_FLAGS = {
  lastnaming: 'anon-16',
};

export function viewFlag(view) {
  return VIEW_FLAGS[view] ?? null;
}

export function viewChrome(view) {
  return VIEW_CHROME[view] ?? { topbar: 'scroll', railHidden: false };
}

// First path segments that belong to the home page's views rather than
// naming some other DB-driven page.
const SITE_SECTIONS = new Set(['blog', 'games', 'site', 'chat']);

// { view, post } for a home-page path, or null if it isn't one. "/" is the
// blog; "/blog/<post>" is the blog with that post open. The message boards
// add board: { section, thread } -- "/site/messages" (sections),
// "/site/messages/<section>" (its threads), "/site/messages/<section>/<id>"
// (a thread; a #post-<id> hash points at a reply in it).
export function parseSitePath(pathname) {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (path === '/') return { view: 'blog', post: null };
  const blog = /^\/blog(?:\/([^/]+))?$/.exec(path);
  if (blog) return { view: 'blog', post: blog[1] ? decodeURIComponent(blog[1]) : null };
  const board = /^\/site\/messages(?:\/([a-z0-9-]+)(?:\/(\d+))?)?$/.exec(path);
  if (board) return { view: 'messages', post: null, board: { section: board[1] ?? null, thread: board[2] ?? null } };
  // The blog editor: "/site/write" lists posts and drafts,
  // "/site/write/<draft>" edits one.
  const write = /^\/site\/write(?:\/(\d+))?$/.exec(path);
  if (write) return { view: 'write', post: null, draft: write[1] ?? null };
  for (const [view, viewPath] of Object.entries(VIEW_PATHS)) {
    if (path === viewPath) return { view, post: null };
  }
  return null;
}

export function sitePath(view, post = null) {
  if (view === 'blog' && post) return `/blog/${encodeURIComponent(post)}`;
  return VIEW_PATHS[view] ?? '/';
}

// The blog editor: the list, or one draft.
export function writePath(draft = null) {
  return draft ? `${VIEW_PATHS.write}/${draft}` : VIEW_PATHS.write;
}

// A message board page: the sections, one section's threads, or a thread
// (optionally at one post in it).
export function boardPath({ section = null, thread = null, post = null } = {}) {
  if (!section) return VIEW_PATHS.messages;
  if (!thread) return `${VIEW_PATHS.messages}/${section}`;
  return `${VIEW_PATHS.messages}/${section}/${thread}${post && post !== thread ? `#post-${post}` : ''}`;
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
