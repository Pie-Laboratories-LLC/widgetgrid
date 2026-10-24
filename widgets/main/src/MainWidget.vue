<template>
  <div class="widget widget-main" :class="{ 'main-collapsed': collapsed, 'main-no-rail': railHidden }" @scroll="onScroll">
    <!-- Height passes straight through (the full-height views -- chat,
         the games, l'horaire -- size to it), except while the topbar is
         shrunk by scrolling: see .main-inner-held. -->
    <div class="main-inner" :class="{ 'main-inner-held': collapsed && topbarMode === 'scroll' }">
      <p v-if="view === 'blog' && !blogComponent" class="main-status">Loading…</p>
      <component v-else-if="view === 'blog'" :is="blogComponent" :key="blogReloadKey" :data="{ post }" title="" />
      <p v-else-if="view === 'solitaire' && !solitaireComponent" class="main-status">Loading…</p>
      <component v-else-if="view === 'solitaire'" :is="solitaireComponent" :data="{}" title="" />
      <p v-if="view === 'chat' && !chatComponent" class="main-status">Loading…</p>
      <component v-else-if="view === 'chat'" :is="chatComponent" :data="{}" title="" />
      <p v-if="view === 'embuscade' && !embuscadeComponent" class="main-status">Loading…</p>
      <component v-else-if="view === 'embuscade'" :is="embuscadeComponent" :data="{}" title="" />
      <p v-if="view === 'lastnaming' && !lastNamingComponent" class="main-status">Loading…</p>
      <component v-else-if="view === 'lastnaming'" :is="lastNamingComponent" :data="{}" title="" />
      <SectionPage v-if="view === 'games'" heading="Games" :entries="gameEntries" />
      <SectionPage v-if="view === 'site'" heading="Site" :entries="siteEntries" />
      <p v-if="view === 'messages' && !boardComponent" class="main-status">Loading…</p>
      <component v-else-if="view === 'messages'" :is="boardComponent" :data="{ board }" title="" />
      <p v-if="isAccountView && !accountComponent" class="main-status">Loading…</p>
      <component v-else-if="isAccountView" :is="accountComponent" :data="{ view }" title="" />
      <p v-if="view === 'subscribe' && !subscribeComponent" class="main-status">Loading…</p>
      <component v-else-if="view === 'subscribe'" :is="subscribeComponent" :data="{}" title="" />
      <p v-if="view === 'lhoraire' && !lhoraireComponent" class="main-status">Loading…</p>
      <component v-else-if="view === 'lhoraire'" :is="lhoraireComponent" :data="{}" title="" />
      <p v-if="view === 'write' && !authorComponent" class="main-status">Loading…</p>
      <component v-else-if="view === 'write'" :is="authorComponent" :data="{ draft }" title="" />
    </div>
  </div>
</template>

<script>
import { getIdentity } from '@widgetgrid/auth-web';
import { featureFlags } from '@widgetgrid/feature-flags';
import {
  currentSiteRoute, viewChrome, viewFlag, navigate, ROUTE_EVENT,
} from '@widgetgrid/site-routes';
import SectionPage from './SectionPage.vue';
import { subscribeNewPosts } from './blogSubscriptionClient.js';
import { subscribeChatEvents } from './chatSubscriptionClient.js';
import { startActivityReporter } from './activityReporter.js';

// The main content area's own switcher: this is the one widget the "home"
// page's layout actually places here (see packages/db/seeds/seed.mjs) --
// what it shows internally (blog, a game, chat...) is a runtime choice,
// not a layout one, driven by the URL: the host app owns the router and
// announces each route on window (ROUTE_EVENT, see @widgetgrid/site-routes
// for the path <-> view mapping). A window event, not some shared store:
// this widget is independently built and dynamically loaded, with no
// other channel to the host.
//
// This also owns clearing the fixed topbar/right rail and being the
// scrolling container (margin-top/margin-right/height/overflow below) --
// BlogWidget.vue doesn't, even though it's the thing usually visible here,
// because it's mounted as a child of this widget, not the direct
// layout-level main-content widget anymore.
//
// 255 / 64 / the 10px threshold below are duplicated in TopBarWidget.vue
// and RightRailWidget.vue too (each needs its own copy: separately built
// bundles, no shared constants module between them) -- keep all three in
// sync if any of these change.
const SCROLL_THRESHOLD = 10;

// Per-view topbar/rail behavior (topbar mode, whether the rail hides) is
// viewChrome() in @widgetgrid/site-routes -- shared, so the topbar and rail
// can start in the right state on a deep link without waiting to hear
// from this widget.

const GAME_ENTRIES = [
  {
    view: 'lastnaming', title: 'The Last Naming',
    description: 'High summer at Oktul, where the Gordun graze their raks below the Kagdun spring.',
  },
  { view: 'solitaire', title: 'Solitaire', description: 'Klondike solitaire: seven columns, four suits, ace to king.' },
  {
    view: 'embuscade', title: 'Embuscade',
    description: 'A tank shooter in a maze, with powerups. Play online against friends or AI opponents.',
  },
];

const ACCOUNT_VIEWS = ['login', 'register', 'account'];

const isLhoraireAdmin = () => !!getIdentity()?.groups.includes('anonyme admins');
const isOwner = () => getIdentity()?.role === 'owner';

export default {
  name: 'MainWidget',
  components: { SectionPage },
  props: {
    data: { type: Object, required: true },
    title: { type: String, default: '' },
  },
  data() {
    return {
      view: null, post: null, blogComponent: null, solitaireComponent: null, chatComponent: null,
      embuscadeComponent: null, lastNamingComponent: null, lhoraireComponent: null, subscribeComponent: null, accountComponent: null, boardComponent: null, board: null, collapsed: false, railHidden: false,
      authorComponent: null, draft: null,
      // null until ConfigService has answered; see viewShown().
      flags: null,
      blogReloadKey: 0, isLhoraireAdmin: isLhoraireAdmin(), isOwner: isOwner(), signedIn: !!getIdentity(),
    };
  },
  created() {
    window.addEventListener(ROUTE_EVENT, this.onRoute);
    // This mounts after the host's first ROUTE_EVENT has gone by -- a
    // bookmarked /games/solitaire starts from the address bar instead.
    this.onRoute({ detail: currentSiteRoute() });
    // A flagged view opened directly (a bookmark) waits for these; then
    // it either loads or, its flag off, goes to the home page.
    featureFlags().then((flags) => {
      this.flags = flags;
      if (!this.viewShown(this.view)) navigate('/', { replace: true });
      else this.loadLastNaming();
    });
    import(/* @vite-ignore */ '/widgets/blog.js').then((mod) => {
      this.blogComponent = mod.default ?? mod;
    });
    // Solitaire isn't preloaded like blog is: its vendored assets (card
    // face spritesheet, images -- see widgets/solitaire's vendor script)
    // are a meaningfully heavier download, not worth fetching for everyone
    // who never clicks that icon.

    // Subscribed here, not in BlogWidget.vue: this widget is always
    // mounted for the page's whole lifetime, so the badge (see
    // TopBarWidget.vue) still shows up while solitaire is open. BlogWidget
    // gets unmounted/remounted every time the view switches away from and
    // back to it (see the template's v-else-if), which would silently
    // drop the subscription for as long as something else was showing.
    this.unsubscribeNewPosts = subscribeNewPosts(() => {
      window.dispatchEvent(new CustomEvent('widgetgrid:new-post'));
    });

    // Same reasoning as the blog subscription above -- subscribed here so
    // it survives ChatWidget being unmounted/remounted as the view
    // switches away from and back to 'chat', and relayed via window event
    // so both TopBarWidget (badge) and ChatWidget (live list/thread
    // updates while it's the active view) can react without either owning
    // the stream itself.
    this.unsubscribeChatEvents = subscribeChatEvents((event) => {
      window.dispatchEvent(new CustomEvent('widgetgrid:chat-event', { detail: event }));
    });

    // subscribeChatEvents() reads the owner token/visitor id ONCE, at the
    // moment it's called -- which for the owner's own browser is normally
    // BEFORE they've logged in (this widget
    // mounts at page load, login happens later in the same page session).
    // Without re-subscribing here, this stream would stay open under the
    // pre-login (anonymous visitor) identity for the rest of the page's
    // life, and the owner would never receive their own chat events live
    // even after successfully logging in -- see LoginWidget.vue, which
    // dispatches this event on both login success and logout.
    this.onIdentityChanged = () => {
      this.isLhoraireAdmin = isLhoraireAdmin();
      this.isOwner = isOwner();
      this.signedIn = !!getIdentity();
      this.unsubscribeChatEvents();
      this.unsubscribeChatEvents = subscribeChatEvents((event) => {
        window.dispatchEvent(new CustomEvent('widgetgrid:chat-event', { detail: event }));
      });
    };
    window.addEventListener('widgetgrid:identity-changed', this.onIdentityChanged);

    // Lets chat alerts skip this device while it's in front of the owner
    // (see activityReporter.js). Here for the same page-lifetime reason.
    this.stopActivityReporter = startActivityReporter();
  },
  beforeUnmount() {
    window.removeEventListener(ROUTE_EVENT, this.onRoute);
    window.removeEventListener('widgetgrid:identity-changed', this.onIdentityChanged);
    this.unsubscribeNewPosts();
    this.unsubscribeChatEvents();
    this.stopActivityReporter();
  },
  computed: {
    topbarMode() {
      return viewChrome(this.view).topbar;
    },
    // /site/login, /site/register, /site/account: one widget (widgets/account).
    isAccountView() {
      return ACCOUNT_VIEWS.includes(this.view);
    },
    // A game behind a feature flag that's off isn't listed.
    gameEntries() {
      return GAME_ENTRIES.filter((entry) => this.viewShown(entry.view));
    },
    // l'horaire is listed only for the "anonyme admins" group, writing the
    // blog only for the owner (UI only; the servers enforce both).
    siteEntries() {
      const entries = [
        this.signedIn
          ? { view: 'account', title: 'Your account', description: 'Your username and email, and logging out.' }
          : { view: 'login', title: 'Log in or register', description: 'An account lets you post on the message boards.' },
        { view: 'subscribe', title: 'Email updates', description: 'An email whenever a new blog post goes up.' },
        { view: 'messages', title: 'Message boards', description: 'Feedback and discussion about the games and the site.' },
      ];
      if (this.isOwner) {
        entries.push({ view: 'write', title: 'Write', description: 'Draft, preview and publish blog posts.' });
      }
      if (this.isLhoraireAdmin) {
        entries.push({ view: 'lhoraire', title: "l'horaire", description: 'Projects, issues and workflows.' });
      }
      return entries;
    },
  },
  methods: {
    // Whether a view may show: it has no feature flag, or its flag is on.
    // While the flags are still on their way, a flagged view just waits.
    viewShown(view) {
      const flag = viewFlag(view);
      return !flag || this.flags?.[flag] === true;
    },
    // Not preloaded either: three.js and the glTF are ~0.7 MB. Only once
    // its feature flag is known to be on.
    loadLastNaming() {
      if (this.view === 'lastnaming' && !this.lastNamingComponent && this.viewShown('lastnaming')) {
        import(/* @vite-ignore */ '/widgets/lastnaming.js').then((mod) => {
          this.lastNamingComponent = mod.default ?? mod;
        });
      }
    },
    onRoute(event) {
      const { view, post = null, board = null, draft = null, forceReload = false } = event.detail;
      // A flagged view whose flag is off: as if the path didn't exist (an
      // unknown section path shows the blog -- packages/web-app's router).
      if (this.flags && !this.viewShown(view)) {
        navigate('/', { replace: true });
        return;
      }
      this.post = post;
      this.draft = draft;
      // Moving between board pages is the same view, so the scroll reset
      // below doesn't happen -- do it here (a #post- link scrolls itself).
      if (view === 'messages' && this.view === 'messages' && JSON.stringify(board) !== JSON.stringify(this.board) && this.$el) {
        this.$el.scrollTop = 0;
      }
      this.board = board;
      // TopBarWidget.vue sets this when the home icon carried the new-post
      // badge: bumping the :key above forces BlogWidget to remount (fresh
      // fetch) even if we're already on the blog view, where a plain view
      // change wouldn't otherwise cause Vue to recreate it.
      if (forceReload) this.blogReloadKey += 1;
      // Moving between posts (/blog/a -> /blog/b) is the same view:
      // BlogWidget scrolls to the post itself.
      if (view === this.view) return;
      this.view = view;
      if (this.view === 'solitaire' && !this.solitaireComponent) {
        import(/* @vite-ignore */ '/widgets/solitaire.js').then((mod) => {
          this.solitaireComponent = mod.default ?? mod;
        });
      }
      if (this.view === 'chat' && !this.chatComponent) {
        import(/* @vite-ignore */ '/widgets/chat.js').then((mod) => {
          this.chatComponent = mod.default ?? mod;
        });
      }
      if (this.view === 'lhoraire' && !this.lhoraireComponent) {
        import(/* @vite-ignore */ '/widgets/lhoraire.js').then((mod) => {
          this.lhoraireComponent = mod.default ?? mod;
        });
      }
      if (this.view === 'messages' && !this.boardComponent) {
        import(/* @vite-ignore */ '/widgets/board.js').then((mod) => {
          this.boardComponent = mod.default ?? mod;
        });
      }
      if (ACCOUNT_VIEWS.includes(this.view) && !this.accountComponent) {
        import(/* @vite-ignore */ '/widgets/account.js').then((mod) => {
          this.accountComponent = mod.default ?? mod;
        });
      }
      if (this.view === 'write' && !this.authorComponent) {
        import(/* @vite-ignore */ '/widgets/author.js').then((mod) => {
          this.authorComponent = mod.default ?? mod;
        });
      }
      if (this.view === 'subscribe' && !this.subscribeComponent) {
        import(/* @vite-ignore */ '/widgets/subscribe.js').then((mod) => {
          this.subscribeComponent = mod.default ?? mod;
        });
      }
      if (this.view === 'embuscade' && !this.embuscadeComponent) {
        import(/* @vite-ignore */ '/widgets/embuscade.js').then((mod) => {
          this.embuscadeComponent = mod.default ?? mod;
        });
      }
      this.loadLastNaming();
      // Fresh view starts scrolled to top -- this element persists across
      // view switches (only its content changes), so scrollTop would
      // otherwise carry over from whatever the previous view left it at.
      // (Not yet mounted on the first call, from created().)
      if (this.$el) this.$el.scrollTop = 0;
      this.setCollapsed(this.topbarMode === 'collapsed');
      this.setRailHidden(viewChrome(this.view).railHidden);
    },
    // This element is the only thing that actually scrolls on the page
    // (the fixed topbar/rail don't, and nothing else does either), so it's
    // the one place that can know the topbar should shrink -- broadcast on
    // window (see TopBarWidget.vue/RightRailWidget.vue). Only matters in
    // 'scroll' mode -- in 'collapsed' mode the bar stays pinned regardless
    // of scroll position, set once already by onRoute.
    //
    // Shrinks past SCROLL_THRESHOLD -- or on reaching the bottom of a page
    // that overflows by less than that, so any page with a scrollbar can
    // shrink it. Expands only back at the very top: the gap between the two
    // keeps it from flickering around the threshold, and .main-inner-held
    // keeps the shrunk page scrolled down until then.
    onScroll(event) {
      if (this.topbarMode !== 'scroll') return;
      const el = event.target;
      if (!this.collapsed) {
        const atBottom = el.scrollTop > 0 && el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
        if (el.scrollTop > SCROLL_THRESHOLD || atBottom) this.setCollapsed(true);
      } else if (el.scrollTop <= 0) {
        this.setCollapsed(false);
      }
    },
    setRailHidden(value) {
      if (value === this.railHidden) return;
      this.railHidden = value;
      window.dispatchEvent(new CustomEvent('widgetgrid:rail', { detail: { hidden: value } }));
    },
    setCollapsed(value) {
      if (value === this.collapsed) return;
      this.collapsed = value;
      window.dispatchEvent(new CustomEvent('widgetgrid:scroll', { detail: { collapsed: value } }));
    },
  },
};
</script>

<style scoped>
.widget-main {
  margin-top: 255px;
  /* Matches RightRailWidget.vue's own clamp() exactly (unconditional, no
     breakpoint) -- that rail's actual rendered width scales continuously
     with viewport width, so this has to track the same formula or the
     content column either overlaps the rail (margin too small) or wastes
     space the rail already gave back (margin too big, confirmed the hard
     way: a stale fixed 160px here on a narrow phone reserved a rail's
     worth of width even though the rail itself had already shrunk to
     ~88px, silently eating the difference as dead space). */
  margin-right: clamp(88px, 20vw, 160px);
  height: calc(100vh - 255px);
  overflow-y: auto;
  box-sizing: border-box;
  transition: margin-top 0.25s ease, height 0.25s ease;
}

/* Shrinking the topbar on scroll gives this container 191px more height
   (127px on a phone). Content only a little taller than the expanded
   space then fits entirely, the browser snaps scrollTop back to 0, the
   topbar expands again, and the page bounces -- the topbar could never
   be shrunk. While shrunk by scrolling, the content is held at least
   SCROLL_THRESHOLD + 1px taller than the container, so it stays scrolled
   down -- onScroll expands it only back at the very top. */
.main-inner {
  height: 100%;
}

.main-inner-held {
  height: auto;
  min-height: calc(100% + 11px);
}

/* The rail is hidden in this view (viewChrome), so there's nothing
   to clear on the right. */
.widget-main.main-no-rail {
  margin-right: 0;
}

.widget-main.main-collapsed {
  margin-top: 64px;
  height: calc(100vh - 64px);
}

/* Kept in sync with TopBarWidget.vue's own identical breakpoint/value --
   same reasoning as margin-right above, just for the top offset: that
   widget's uncollapsed height drops to 128px here, so this margin has to
   follow or the same dead-space bug opens up vertically instead. */
@media (max-width: 640px) {
  .widget-main {
    margin-top: 128px;
    height: calc(100vh - 128px);
  }
}

.main-status {
  padding: 32px;
  color: #666;
}
</style>
