<template>
  <header class="widget widget-topbar" :class="{ 'topbar-collapsed': collapsed }">
    <!-- One <img>, src swapped via binding rather than v-if/v-else between
         two elements: CSS transitions the display height (below), but
         swapping DOM elements would recreate the node each time and reset
         that transition mid-flight. width/height attrs are just accurate
         intrinsic-size hints for each asset -- actual displayed size is
         CSS-driven so it can animate. -->
    <!-- The logo and the name both go to "/" (not /blog, where the Home
         icon goes). display: contents on the link, so the <img> itself
         stays the flex item that shrinks/trims (see .topbar-logo). -->
    <a class="topbar-home-link" href="/" @click="goRoot">
      <img
        :src="collapsed ? assetUrl('logo-h64.png') : assetUrl('logo-h255.png')"
        :width="collapsed ? 85 : 339" :height="collapsed ? 64 : 255"
        :alt="data?.alt || 'Pie Laboratories LLC'"
        class="topbar-logo"
      />
    </a>
    <!-- The webmaster address lives in the blog's contact panel now
         (BlogWidget.vue), not here. -->
    <a class="topbar-brand" href="/" @click="goRoot">Pie Laboratories, LLC.</a>
    <nav class="topbar-menu-slot">
      <!-- Active = outline ("empty"), inactive = filled -- the user's own
           convention, not the more common filled-means-active. -->
      <button type="button" class="topbar-icon" title="Home" aria-label="Home" @click="onHomeClick">
        <svg v-if="activeSection === 'blog'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M5 12l-2 0l9 -9l9 9l-2 0" />
          <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" />
          <path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6" />
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12.707 2.293l9 9c.63 .63 .184 1.707 -.707 1.707h-1v6a3 3 0 0 1 -3 3h-1v-7a3 3 0 0 0 -2.824 -2.995l-.176 -.005h-2a3 3 0 0 0 -3 3v7h-1a3 3 0 0 1 -3 -3v-6h-1c-.89 0 -1.337 -1.077 -.707 -1.707l9 -9a1 1 0 0 1 1.414 0m.293 11.707a1 1 0 0 1 1 1v7h-4v-7a1 1 0 0 1 .883 -.993l.117 -.007z" />
        </svg>
        <span v-if="hasNewPost" class="topbar-badge" aria-hidden="true">!</span>
      </button>
      <!-- Inside a section, its icon shows where: the game being played, or
           l'horaire / the message boards. Always the outline form there,
           since the section is active. -->
      <button type="button" class="topbar-icon" title="Games" aria-label="Games" @click="go('games')">
        <svg v-if="activeView === 'solitaire'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M3.604 7.197l7.138 -3.109a.96 .96 0 0 1 1.27 .527l4.924 11.902a1 1 0 0 1 -.514 1.304l-7.137 3.109a.96 .96 0 0 1 -1.271 -.527l-4.924 -11.903a1 1 0 0 1 .514 -1.304l0 .001" />
          <path d="M15 4h1a1 1 0 0 1 1 1v3.5" />
          <path d="M20 6c.264 .112 .52 .217 .768 .315a1 1 0 0 1 .53 1.311l-2.298 5.374" />
        </svg>
        <svg v-else-if="activeView === 'embuscade'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M5.5 13h13a3.5 3.5 0 0 1 0 7h-13a3.5 3.5 0 0 1 0 -7z" />
          <path d="M7 13v-2a2 2 0 0 1 2 -2h5a2 2 0 0 1 2 2v2" />
          <path d="M16 10.5h5" />
        </svg>
        <!-- The Last Naming: the valley under its mountains. -->
        <svg v-else-if="activeView === 'lastnaming'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M3 20h18l-6.921 -14.612a2.3 2.3 0 0 0 -4.158 0l-6.921 14.612z" />
          <path d="M7.5 11l2 2.5l2.5 -2.5l2 3l2.5 -2" />
        </svg>
        <svg v-else-if="activeSection === 'games'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M6 7h12a4 4 0 0 1 4 4v2a4 4 0 0 1 -4 4h-1.5l-2 -2h-5l-2 2h-1.5a4 4 0 0 1 -4 -4v-2a4 4 0 0 1 4 -4z" />
          <path d="M5.5 12h4" />
          <path d="M7.5 10v4" />
          <path d="M16 10.5h.01" />
          <path d="M18 13h.01" />
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="currentColor" fill-rule="evenodd" aria-hidden="true">
          <path d="M6 7h12a4 4 0 0 1 4 4v2a4 4 0 0 1 -4 4h-1.5l-2 -2h-5l-2 2h-1.5a4 4 0 0 1 -4 -4v-2a4 4 0 0 1 4 -4z
                   M6.75 9.75h1.5v1.5h1.5v1.5h-1.5v1.5h-1.5v-1.5h-1.5v-1.5h1.5z
                   M14.9 10.5a1.1 1.1 0 1 0 2.2 0a1.1 1.1 0 1 0 -2.2 0z
                   M16.9 13a1.1 1.1 0 1 0 2.2 0a1.1 1.1 0 1 0 -2.2 0z" />
        </svg>
      </button>
      <button type="button" class="topbar-icon" title="Site" aria-label="Site" @click="go('site')">
        <svg v-if="activeView === 'lhoraire'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="9.5" y="4.75" width="11" height="2.5" rx="1.25" />
          <rect x="12.5" y="10.75" width="8" height="2.5" rx="1.25" />
          <rect x="15.5" y="16.75" width="5" height="2.5" rx="1.25" />
          <circle cx="5" cy="6" r="1.75" />
          <circle cx="8" cy="12" r="1.75" />
          <circle cx="11" cy="18" r="1.75" />
        </svg>
        <!-- Message boards: l'horaire's cascade (each row further in, as
             replies indent) with plus signs for bullets. -->
        <svg v-else-if="activeView === 'messages'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="9.5" y="4.75" width="11" height="2.5" rx="1.25" />
          <rect x="12.5" y="10.75" width="8" height="2.5" rx="1.25" />
          <rect x="15.5" y="16.75" width="5" height="2.5" rx="1.25" />
          <path d="M3.5 6h3M5 4.5v3" />
          <path d="M6.5 12h3M8 10.5v3" />
          <path d="M9.5 18h3M11 16.5v3" />
        </svg>
        <svg v-else-if="activeSection === 'site'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
          <path d="M3.6 9h16.8" />
          <path d="M3.6 15h16.8" />
          <path d="M11.5 3a17 17 0 0 0 0 18" />
          <path d="M12.5 3a17 17 0 0 1 0 18" />
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <!-- Solid globe with its grid lines cut out (mask), the filled
               counterpart to the outline globe above. -->
          <mask id="topbar-site-mask">
            <rect width="24" height="24" fill="#fff" />
            <g fill="none" stroke="#000" stroke-width="1.6" stroke-linecap="round">
              <path d="M2 9h20" />
              <path d="M2 15h20" />
              <path d="M11.5 2.2a17 17 0 0 0 0 19.6" />
              <path d="M12.5 2.2a17 17 0 0 1 0 19.6" />
            </g>
          </mask>
          <circle cx="12" cy="12" r="10" mask="url(#topbar-site-mask)" />
        </svg>
      </button>
      <button
        type="button" class="topbar-icon" title="Chat with management" aria-label="Chat with management"
        @click="go('chat')"
      >
        <svg v-if="activeSection === 'chat'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
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
import { getIdentity, IDENTITY_CHANGED_EVENT } from '@widgetgrid/auth-web';
import {
  currentSiteRoute, viewChrome, sectionOf, sitePath, navigate, ROUTE_EVENT,
} from '@widgetgrid/site-routes';

const isLhoraireAdmin = () => !!getIdentity()?.groups.includes('anonyme admins');

// Runtime URL string, not an ES import -- see SplashWidget.vue's <script>
// comment (same reason: Vite's build.lib mode would base64-inline this
// image into the JS bundle otherwise).
const ASSET_BASE = '/widgets/topbar-assets/';

// Icon paths for "home", "message" (chat), "cards" (Solitaire) and the
// outline "world" (Site) are from Tabler Icons (MIT), in both outline and
// filled variants (see template for how they're used). The Games gamepad,
// the filled globe, the Embuscade tank and the l'horaire / message board
// bullet lists are hand-drawn in the same 24x24 style.
export default {
  name: 'TopBarWidget',
  props: {
    data: { type: Object, required: true },
    title: { type: String, default: '' },
  },
  data() {
    // Starting state from the address bar -- see RightRailWidget.vue's
    // data() for why this can't wait for MainWidget.vue's events.
    const { view } = currentSiteRoute();
    return {
      activeView: view, collapsed: viewChrome(view).topbar === 'collapsed', hasNewPost: false,
      hasNewChatMessage: false,
      loginComponent: null,
      isLhoraireAdmin: isLhoraireAdmin(),
    };
  },
  created() {
    // The host's announcement of every completed navigation, whatever
    // caused it (these icons, the back button, a notification tap) -- so
    // the active icon follows the URL, not just this widget's own clicks.
    window.addEventListener(ROUTE_EVENT, this.onRoute);
    // l'horaire is admins-only; a deep link to it from anyone else lands
    // on the blog instead (UI only -- lhoraire-server enforces it).
    if (this.activeView === 'lhoraire' && !this.isLhoraireAdmin) navigate('/', { replace: true });
    // MainWidget.vue's own scroll container is what actually knows this --
    // see its comment for why this is a window event, not a shared store.
    window.addEventListener('widgetgrid:scroll', this.onScroll);
    // MainWidget.vue owns the actual subscription (see its comment for
    // why) and just relays "something changed" here -- this widget only
    // needs to know whether to show the badge, not what changed.
    window.addEventListener('widgetgrid:new-post', this.onNewPost);
    window.addEventListener('widgetgrid:chat-event', this.onChatEvent);
    window.addEventListener(IDENTITY_CHANGED_EVENT, this.onIdentityChanged);

    // Preloaded like blog is in MainWidget.vue, not lazy on first click:
    // its "Log in" / "Log out" link is part of the bar from the start (see
    // LoginWidget.vue).
    import(/* @vite-ignore */ '/widgets/login.js').then((mod) => {
      this.loginComponent = mod.default ?? mod;
    });
  },
  beforeUnmount() {
    window.removeEventListener(ROUTE_EVENT, this.onRoute);
    window.removeEventListener('widgetgrid:scroll', this.onScroll);
    window.removeEventListener('widgetgrid:new-post', this.onNewPost);
    window.removeEventListener('widgetgrid:chat-event', this.onChatEvent);
    window.removeEventListener(IDENTITY_CHANGED_EVENT, this.onIdentityChanged);
  },
  computed: {
    // Which icon is lit: a section page and everything under it share one
    // (Games for /games and both games, Site for /site and l'horaire).
    activeSection() {
      return sectionOf(this.activeView);
    },
  },
  methods: {
    // l'horaire is only for the "anonyme admins" group (UI only;
    // lhoraire-server enforces it) -- MainWidget.vue lists it on the Site
    // page for them alone. Signing out while on that view goes home.
    onIdentityChanged() {
      this.isLhoraireAdmin = isLhoraireAdmin();
      if (!this.isLhoraireAdmin && this.activeView === 'lhoraire') navigate('/');
    },
    assetUrl(name) {
      return ASSET_BASE + name;
    },
    onRoute(event) {
      this.activeView = event.detail.view;
      if (event.detail.forceReload) this.hasNewPost = false;
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
    // A request to the host app, which owns the router (and asks the view
    // being left whether it may go -- e.g. EmbuscadeWidget.vue mid-game).
    go(view) {
      navigate(sitePath(view));
    },
    // Separate from go('blog') above: this one also clears the badge and
    // tells MainWidget.vue to force a fresh fetch (forceReload) -- needed
    // because a plain navigation wouldn't remount BlogWidget if you're
    // already looking at the blog when a new post shows up. The badge
    // clears in onRoute, once the navigation has actually happened (it
    // may be vetoed).
    goRoot(event) {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      navigate('/');
    },
    onHomeClick() {
      navigate(sitePath('blog'), { forceReload: this.hasNewPost });
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
  /* The logo is what gives way when the icons need the room -- never the
     icons, which would otherwise run off the right edge (they did, on
     every phone). Shrinking below its natural width trims the image's
     dark left/right edges (cover, centered) rather than squashing it. */
  flex-shrink: 1;
  min-width: 0;
  object-fit: cover;
  transition: height 0.25s ease;
}

.topbar-collapsed .topbar-logo {
  height: 64px;
}

/* The name. Full size, it's lettered over the bottom of the logo -- from
   760px up, where the logo is always its whole 339px (narrower, the logo
   gives way to the icons). Once the topbar shrinks (64px leaves nothing
   to letter over) it moves beside the logo, a flex sibling that
   .widget-topbar's align-items centres -- from 960px up only, since under
   that the logo, the name, the icons and log in/out don't all fit on the
   row and the icons matter more. */
.topbar-home-link {
  display: contents;
}

.topbar-brand {
  display: none;
  flex-shrink: 0;
  white-space: nowrap;
  margin-left: 16px;
  color: #f4ead9;
  font-weight: 600;
  font-size: 1rem;
  text-decoration: none;
}

.topbar-brand:hover,
.topbar-brand:focus-visible {
  text-decoration: underline;
}

.topbar-menu-slot {
  flex: 1 0 auto;
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

  /* Phone widths: four icons plus log in/out have ~205px next to the
     170px-wide logo on a 375px screen -- smaller icons, tighter gaps and
     edge padding make them fit (34px tap targets), and the logo's
     flex-shrink above covers anything narrower. */
  .topbar-menu-slot {
    gap: 4px;
    padding-right: 6px;
  }

  .topbar-icon {
    padding: 5px;
  }

  .topbar-icon svg {
    width: 24px;
    height: 24px;
  }
}

@media (min-width: 960px) {
  .topbar-brand {
    display: flex;
  }
}

@media (min-width: 760px) {
  /* Over the logo's dark lower edge, centred on it: 40px of padding plus
     half the logo's 339px. */
  .widget-topbar:not(.topbar-collapsed) .topbar-brand {
    display: flex;
    position: absolute;
    left: calc(40px + 339px / 2);
    bottom: 14px;
    transform: translateX(-50%);
    margin-left: 0;
    font-size: 1.15rem;
    letter-spacing: 0.02em;
    text-shadow: 0 1px 3px rgb(0 0 0 / 90%), 0 0 12px rgb(0 0 0 / 70%);
  }
}
</style>
