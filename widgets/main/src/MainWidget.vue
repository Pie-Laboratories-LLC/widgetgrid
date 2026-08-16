<template>
  <div class="widget widget-main" :class="{ 'main-collapsed': collapsed }" @scroll="onScroll">
    <p v-if="view === 'blog' && !blogComponent" class="main-status">Loading…</p>
    <component v-else-if="view === 'blog'" :is="blogComponent" :key="blogReloadKey" :data="{}" title="" />
    <p v-else-if="view === 'solitaire' && !solitaireComponent" class="main-status">Loading…</p>
    <component v-else-if="view === 'solitaire'" :is="solitaireComponent" :data="{}" title="" />
    <p v-if="view === 'chat' && !chatComponent" class="main-status">Loading…</p>
    <component v-else-if="view === 'chat'" :is="chatComponent" :data="{}" title="" />
  </div>
</template>

<script>
import { subscribeNewPosts } from './blogSubscriptionClient.js';
import { subscribeChatEvents } from './chatSubscriptionClient.js';

// The main content area's own switcher: this is the one widget the "home"
// page's layout actually places here (see packages/db/seeds/seed.mjs) --
// what it shows internally (blog or solitaire) is a runtime
// choice, not a layout one, driven by "widgetgrid:navigate" events the
// topbar dispatches on window (see TopBarWidget.vue). A window event, not
// some shared store: the topbar and this widget are independently built
// and dynamically loaded, with no other channel between them.
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

// Per-view topbar behavior. 'scroll' (the default for anything not listed
// here -- add an entry as future views need something other than that
// default) shrinks/expands as this widget's own content scrolls, same as
// today. 'collapsed' pins it compact the whole time that view is active,
// ignoring scroll entirely. Solitaire is 'collapsed': scroll-driven
// toggling made the page feel janky while playing, since dragging cards
// near the top of the board kept crossing SCROLL_THRESHOLD back and forth,
// re-triggering the shrink/expand transition on every crossing.
const TOPBAR_MODE = {
  solitaire: 'collapsed',
  // Chat owns its own internal scroll region (see widgets/chat's
  // .chat-messages), so this widget's own scroll container never
  // overflows while it's showing -- same "avoid a scroll-driven toggle
  // that never actually gets triggered by anything" reasoning as
  // solitaire, not a jank fix like solitaire's was.
  chat: 'collapsed',
};

export default {
  name: 'MainWidget',
  props: {
    data: { type: Object, required: true },
    title: { type: String, default: '' },
  },
  data() {
    return {
      view: 'blog', blogComponent: null, solitaireComponent: null, chatComponent: null, collapsed: false,
      blogReloadKey: 0,
    };
  },
  created() {
    window.addEventListener('widgetgrid:navigate', this.onNavigate);
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
    // BEFORE they've clicked through the 5-click login flow (this widget
    // mounts at page load, login happens later in the same page session).
    // Without re-subscribing here, this stream would stay open under the
    // pre-login (anonymous visitor) identity for the rest of the page's
    // life, and the owner would never receive their own chat events live
    // even after successfully logging in -- see LoginWidget.vue, which
    // dispatches this event on both login success and logout.
    this.onIdentityChanged = () => {
      this.unsubscribeChatEvents();
      this.unsubscribeChatEvents = subscribeChatEvents((event) => {
        window.dispatchEvent(new CustomEvent('widgetgrid:chat-event', { detail: event }));
      });
    };
    window.addEventListener('widgetgrid:identity-changed', this.onIdentityChanged);
  },
  beforeUnmount() {
    window.removeEventListener('widgetgrid:navigate', this.onNavigate);
    window.removeEventListener('widgetgrid:identity-changed', this.onIdentityChanged);
    this.unsubscribeNewPosts();
    this.unsubscribeChatEvents();
  },
  computed: {
    topbarMode() {
      return TOPBAR_MODE[this.view] ?? 'scroll';
    },
  },
  methods: {
    onNavigate(event) {
      this.view = event.detail.view;
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
      // TopBarWidget.vue sets this when the home icon carried the new-post
      // badge: bumping the :key above forces BlogWidget to remount (fresh
      // fetch) even if we're already on the blog view, where a plain view
      // change wouldn't otherwise cause Vue to recreate it.
      if (event.detail.forceReload) this.blogReloadKey += 1;
      // Fresh view starts scrolled to top -- this element persists across
      // view switches (only its content changes), so scrollTop would
      // otherwise carry over from whatever the previous view left it at.
      this.$el.scrollTop = 0;
      this.setCollapsed(this.topbarMode === 'collapsed');
    },
    // This element is the only thing that actually scrolls on the page
    // (the fixed topbar/rail don't, and nothing else does either), so it's
    // the one place that can know the topbar should shrink -- broadcast on
    // window (see TopBarWidget.vue/RightRailWidget.vue). Only matters in
    // 'scroll' mode -- in 'collapsed' mode the bar stays pinned regardless
    // of scroll position, set once already by onNavigate.
    onScroll(event) {
      if (this.topbarMode !== 'scroll') return;
      this.setCollapsed(event.target.scrollTop > SCROLL_THRESHOLD);
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
  margin-right: 160px;
  height: calc(100vh - 255px);
  overflow-y: auto;
  box-sizing: border-box;
  transition: margin-top 0.25s ease, height 0.25s ease;
}

.widget-main.main-collapsed {
  margin-top: 64px;
  height: calc(100vh - 64px);
}

.main-status {
  padding: 32px;
  color: #666;
}
</style>
