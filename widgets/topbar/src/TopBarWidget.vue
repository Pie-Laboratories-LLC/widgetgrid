<template>
  <header class="widget widget-topbar" :class="{ 'topbar-collapsed': collapsed }">
    <!-- One <img>, src swapped via binding rather than v-if/v-else between
         two elements: CSS transitions the display height (below), but
         swapping DOM elements would recreate the node each time and reset
         that transition mid-flight. width/height attrs are just accurate
         intrinsic-size hints for each asset -- actual displayed size is
         CSS-driven so it can animate. -->
    <img
      :src="collapsed ? assetUrl('logo-h64.png') : assetUrl('logo-h255.png')"
      :width="collapsed ? 85 : 339" :height="collapsed ? 64 : 255"
      :alt="data?.alt || 'Pie Laboratories LLC'"
      class="topbar-logo"
      @click="onLogoClick"
    />
    <div class="topbar-brand">
      <span class="topbar-brand-name">Pie Laboratories, LLC.</span>
      <a class="topbar-brand-email" href="mailto:webmaster@pie-laboratories.com">webmaster@pie-laboratories.com</a>
    </div>
    <nav class="topbar-menu-slot">
      <!-- Active = outline ("empty"), inactive = filled -- the user's own
           convention, not the more common filled-means-active. -->
      <button type="button" class="topbar-icon" title="Home" aria-label="Home" @click="onHomeClick">
        <svg v-if="activeView === 'blog'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M5 12l-2 0l9 -9l9 9l-2 0" />
          <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" />
          <path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6" />
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12.707 2.293l9 9c.63 .63 .184 1.707 -.707 1.707h-1v6a3 3 0 0 1 -3 3h-1v-7a3 3 0 0 0 -2.824 -2.995l-.176 -.005h-2a3 3 0 0 0 -3 3v7h-1a3 3 0 0 1 -3 -3v-6h-1c-.89 0 -1.337 -1.077 -.707 -1.707l9 -9a1 1 0 0 1 1.414 0m.293 11.707a1 1 0 0 1 1 1v7h-4v-7a1 1 0 0 1 .883 -.993l.117 -.007z" />
        </svg>
        <span v-if="hasNewPost" class="topbar-badge" aria-hidden="true">!</span>
      </button>
      <button type="button" class="topbar-icon" title="Solitaire" aria-label="Solitaire" @click="navigate('solitaire')">
        <svg v-if="activeView === 'solitaire'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M3.604 7.197l7.138 -3.109a.96 .96 0 0 1 1.27 .527l4.924 11.902a1 1 0 0 1 -.514 1.304l-7.137 3.109a.96 .96 0 0 1 -1.271 -.527l-4.924 -11.903a1 1 0 0 1 .514 -1.304l0 .001" />
          <path d="M15 4h1a1 1 0 0 1 1 1v3.5" />
          <path d="M20 6c.264 .112 .52 .217 .768 .315a1 1 0 0 1 .53 1.311l-2.298 5.374" />
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M10.348 3.169l-7.15 3.113a2 2 0 0 0 -1.03 2.608l4.92 11.895a1.96 1.96 0 0 0 2.59 1.063l7.142 -3.11a2.002 2.002 0 0 0 1.036 -2.611l-4.92 -11.894a1.96 1.96 0 0 0 -2.588 -1.064z" />
          <path d="M16 3a2 2 0 0 1 1.995 1.85l.005 .15v3.5a1 1 0 0 1 -1.993 .117l-.007 -.117v-3.5h-1a1 1 0 0 1 -.117 -1.993l.117 -.007h1z" />
          <path d="M19.08 5.61a1 1 0 0 1 1.31 -.53c.257 .108 .505 .21 .769 .314a2 2 0 0 1 1.114 2.479l-.056 .146l-2.298 5.374a1 1 0 0 1 -1.878 -.676l.04 -.11l2.296 -5.371l-.366 -.148l-.402 -.167a1 1 0 0 1 -.53 -1.312z" />
        </svg>
      </button>
      <button
        type="button" class="topbar-icon" title="Chat with management" aria-label="Chat with management"
        @click="navigate('chat')"
      >
        <svg v-if="activeView === 'chat'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M8 9h8" />
          <path d="M8 13h6" />
          <path d="M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12" />
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18 3a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-4.724l-4.762 2.857a1 1 0 0 1 -1.508 -.743l-.006 -.114v-2h-1a4 4 0 0 1 -3.995 -3.8l-.005 -.2v-8a4 4 0 0 1 4 -4zm-4 9h-6a1 1 0 0 0 0 2h6a1 1 0 0 0 0 -2m2 -4h-8a1 1 0 1 0 0 2h8a1 1 0 0 0 0 -2" />
        </svg>
        <span v-if="hasNewChatMessage" class="topbar-badge" aria-hidden="true">!</span>
      </button>
      <component :is="loginComponent" v-if="loginComponent" :data="{}" title="" />
    </nav>
  </header>
</template>

<script>
// Runtime URL string, not an ES import -- see SplashWidget.vue's <script>
// comment (same reason: Vite's build.lib mode would base64-inline this
// image into the JS bundle otherwise).
const ASSET_BASE = '/widgets/topbar-assets/';

// Icon paths are from Tabler Icons (MIT) -- "home", "cards" and "message",
// each in both outline and filled variants (see template for how they're
// used).
export default {
  name: 'TopBarWidget',
  props: {
    data: { type: Object, required: true },
    title: { type: String, default: '' },
  },
  data() {
    return {
      activeView: 'blog', collapsed: false, hasNewPost: false,
      hasNewChatMessage: false,
      loginComponent: null,
    };
  },
  created() {
    // Listens for its own dispatched events too (not just reacting to the
    // click that caused them), so this stays correct even if something
    // other than these two buttons ever triggers navigation.
    window.addEventListener('widgetgrid:navigate', this.onNavigate);
    // MainWidget.vue's own scroll container is what actually knows this --
    // see its comment for why this is a window event, not a shared store.
    window.addEventListener('widgetgrid:scroll', this.onScroll);
    // MainWidget.vue owns the actual subscription (see its comment for
    // why) and just relays "something changed" here -- this widget only
    // needs to know whether to show the badge, not what changed.
    window.addEventListener('widgetgrid:new-post', this.onNewPost);
    window.addEventListener('widgetgrid:chat-event', this.onChatEvent);

    // Preloaded like blog is in MainWidget.vue, not lazy on first click:
    // this widget needs to render a "log out" link immediately if the
    // owner's browser already holds a session (see LoginWidget.vue), not
    // just after the 5-click gesture reveals the login panel.
    import(/* @vite-ignore */ '/widgets/login.js').then((mod) => {
      this.loginComponent = mod.default ?? mod;
    });
  },
  beforeUnmount() {
    window.removeEventListener('widgetgrid:navigate', this.onNavigate);
    window.removeEventListener('widgetgrid:scroll', this.onScroll);
    window.removeEventListener('widgetgrid:new-post', this.onNewPost);
    window.removeEventListener('widgetgrid:chat-event', this.onChatEvent);
  },
  methods: {
    assetUrl(name) {
      return ASSET_BASE + name;
    },
    onNavigate(event) {
      this.activeView = event.detail.view;
      // Opening the chat view is what "reads" it, same idea as the home
      // icon's badge clearing on click.
      if (this.activeView === 'chat') this.hasNewChatMessage = false;
    },
    onScroll(event) {
      this.collapsed = event.detail.collapsed;
    },
    onNewPost() {
      this.hasNewPost = true;
    },
    // MainWidget.vue owns the actual ChatService subscription and relays
    // "something changed" here, same reasoning as onNewPost above.
    //
    // Same rule for owner and visitor now: badge only if not currently on
    // the chat page at all -- revised from an earlier "owner gets it
    // unconditionally, even while already on chat, since it might be a
    // different conversation" spec, which in practice just meant the badge
    // kept lighting up for messages the owner was already looking at (or
    // had just sent themselves). A different conversation getting a new
    // message while the owner is already on the chat page is instead
    // surfaced by that chat going bold in ChatWidget's own list (its
    // hasUnread flag, refreshed via loadChats() on every event) -- no
    // separate top-level badge needed for that case.
    onChatEvent() {
      if (this.activeView !== 'chat') this.hasNewChatMessage = true;
    },
    // LoginWidget.vue listens for this on window to run its own 5-clicks-
    // within-2-seconds detection -- it owns that state machine (and the
    // click-count reset timer), this only relays the raw click since it's
    // the widget that actually owns the logo DOM element.
    onLogoClick() {
      window.dispatchEvent(new CustomEvent('widgetgrid:logo-click'));
    },
    // widgets/main/src/MainWidget.vue listens for this on window -- see its
    // comment for why a window event, not a shared store, is what connects
    // two independently-built widgets.
    navigate(view) {
      window.dispatchEvent(new CustomEvent('widgetgrid:navigate', { detail: { view } }));
    },
    // Separate from navigate('blog') above: this one also clears the badge
    // and tells MainWidget.vue to force a fresh fetch (forceReload) --
    // needed because a plain view-change wouldn't remount BlogWidget if
    // you're already looking at the blog when a new post shows up.
    onHomeClick() {
      const forceReload = this.hasNewPost;
      this.hasNewPost = false;
      window.dispatchEvent(new CustomEvent('widgetgrid:navigate', { detail: { view: 'blog', forceReload } }));
    },
  },
};
</script>

<style scoped>
.widget-topbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  /* Higher than RightRailWidget's own z-index: 10 -- both are
     position: fixed, so each is its OWN stacking context; LoginWidget's
     login-overlay (z-index: 100) mounts as a child of this element (it's
     loaded by TopBarWidget), so its z-index only ever competes against
     other elements *inside* this stacking context, never directly against
     the rail's separate one. With both contexts tied at z-index: 10, the
     rail's icons stayed clickable underneath the overlay's visual dimming
     -- confirmed against a real report. Bumping this context above the
     rail's is what actually lets the overlay win, since the whole context
     (login-overlay included) now paints above it.  */
  z-index: 20;
  height: 255px;
  display: flex;
  align-items: center;
  padding-left: 40px;
  background: rgb(5, 5, 5);
  transition: height 0.25s ease;
}

.widget-topbar.topbar-collapsed {
  height: 64px;
}

.topbar-logo {
  display: block;
  height: 255px;
  width: auto;
  cursor: pointer;
  transition: height 0.25s ease;
}

.topbar-collapsed .topbar-logo {
  height: 64px;
}

/* No explicit vertical-centering rule needed -- .widget-topbar is already
   `display: flex; align-items: center`, so this sits centered against the
   logo (and shrinks with it) for free as a flex sibling. */
.topbar-brand {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: 16px;
  color: #f4ead9;
  line-height: 1.3;
}

.topbar-brand-name {
  font-weight: 600;
  font-size: 1rem;
}

.topbar-brand-email {
  font-size: 0.8rem;
  opacity: 0.75;
  color: inherit;
  text-decoration: none;
}

.topbar-brand-email:hover {
  opacity: 1;
  text-decoration: underline;
}

.topbar-menu-slot {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 20px;
  padding-right: 40px;
}

.topbar-icon {
  position: relative;
  background: none;
  border: none;
  padding: 6px;
  color: #f4ead9;
  cursor: pointer;
  border-radius: 6px;
  line-height: 0;
}

.topbar-icon:hover,
.topbar-icon:focus-visible {
  background: rgba(244, 234, 217, 0.12);
}

.topbar-icon svg {
  width: 30px;
  height: 30px;
}

.topbar-badge {
  position: absolute;
  bottom: 2px;
  right: 2px;
  min-width: 14px;
  height: 14px;
  padding: 0 2px;
  border-radius: 999px;
  background: #e5322d;
  color: #fff;
  font-size: 10px;
  line-height: 14px;
  font-weight: 700;
  text-align: center;
  box-shadow: 0 0 0 2px #150a2e;
}

/* Kept in sync with RightRailWidget.vue's own identical breakpoint (see
   its comment) -- the uncollapsed 255px height (matching the logo's full
   339x255 image) is sized for desktop; on a phone-width viewport it eats
   most of the screen for what's still just a banner. 128px keeps the logo
   readable without dominating the page. The already-collapsed height
   (64px, reached by scrolling) was already fine on mobile -- untouched
   here, and doesn't need its own override since this block only changes
   the uncollapsed height. padding-left dropped to 0: the logo should sit
   flush against the screen edge on a phone, where the 40px of breathing
   room desktop affords is space this layout can't spare. Applies
   regardless of collapsed state (this is the base .widget-topbar rule,
   not one scoped to .topbar-collapsed), since the logo needs to be flush
   left in both the 128px and 64px states on mobile. */
@media (max-width: 640px) {
  .widget-topbar {
    height: 128px;
    padding-left: 0;
  }

  .topbar-logo {
    height: 128px;
  }
}
</style>
