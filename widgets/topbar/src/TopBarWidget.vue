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
    />
    <nav class="topbar-menu-slot">
      <!-- Active = outline ("empty"), inactive = filled -- the user's own
           convention, not the more common filled-means-active. -->
      <button type="button" class="topbar-icon" title="Home" aria-label="Home" @click="navigate('blog')">
        <svg v-if="activeView === 'blog'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M5 12l-2 0l9 -9l9 9l-2 0" />
          <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" />
          <path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6" />
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12.707 2.293l9 9c.63 .63 .184 1.707 -.707 1.707h-1v6a3 3 0 0 1 -3 3h-1v-7a3 3 0 0 0 -2.824 -2.995l-.176 -.005h-2a3 3 0 0 0 -3 3v7h-1a3 3 0 0 1 -3 -3v-6h-1c-.89 0 -1.337 -1.077 -.707 -1.707l9 -9a1 1 0 0 1 1.414 0m.293 11.707a1 1 0 0 1 1 1v7h-4v-7a1 1 0 0 1 .883 -.993l.117 -.007z" />
        </svg>
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
    </nav>
  </header>
</template>

<script>
// Runtime URL string, not an ES import -- see SplashWidget.vue's <script>
// comment (same reason: Vite's build.lib mode would base64-inline this
// image into the JS bundle otherwise).
const ASSET_BASE = '/widgets/topbar-assets/';

// Icon paths are from Tabler Icons (MIT) -- "home" and "cards", each in
// both outline and filled variants (see template for how they're used).
export default {
  name: 'TopBarWidget',
  props: {
    data: { type: Object, required: true },
    title: { type: String, default: '' },
  },
  data() {
    return { activeView: 'blog', collapsed: false };
  },
  created() {
    // Listens for its own dispatched events too (not just reacting to the
    // click that caused them), so this stays correct even if something
    // other than these two buttons ever triggers navigation.
    window.addEventListener('widgetgrid:navigate', this.onNavigate);
    // MainWidget.vue's own scroll container is what actually knows this --
    // see its comment for why this is a window event, not a shared store.
    window.addEventListener('widgetgrid:scroll', this.onScroll);
  },
  beforeUnmount() {
    window.removeEventListener('widgetgrid:navigate', this.onNavigate);
    window.removeEventListener('widgetgrid:scroll', this.onScroll);
  },
  methods: {
    assetUrl(name) {
      return ASSET_BASE + name;
    },
    onNavigate(event) {
      this.activeView = event.detail.view;
    },
    onScroll(event) {
      this.collapsed = event.detail.collapsed;
    },
    // widgets/main/src/MainWidget.vue listens for this on window -- see its
    // comment for why a window event, not a shared store, is what connects
    // two independently-built widgets.
    navigate(view) {
      window.dispatchEvent(new CustomEvent('widgetgrid:navigate', { detail: { view } }));
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
  z-index: 10;
  height: 255px;
  display: flex;
  align-items: center;
  padding-left: 40px;
  background: #150a2e;
  transition: height 0.25s ease;
}

.widget-topbar.topbar-collapsed {
  height: 64px;
}

.topbar-logo {
  display: block;
  height: 255px;
  width: auto;
  transition: height 0.25s ease;
}

.topbar-collapsed .topbar-logo {
  height: 64px;
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
</style>
