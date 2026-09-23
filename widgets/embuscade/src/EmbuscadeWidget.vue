<template>
  <!-- Empty on purpose: the game's mount() renders its own markup into
       this element (unlike SolitaireWidget.vue, which has to reproduce the
       solitaire repo's expected markup here). -->
  <div ref="container" class="widget widget-embuscade"></div>
</template>

<script>
// Wraps ~/GIT/bolo-server's game client (a separate repo/toolchain --
// vanilla JS, no Vue), vendored in at build time by
// scripts/vendor-embuscade.mjs. Its contract: mount(container, { wsUrl })
// renders the game and returns unmount(), which closes the game's
// WebSocket and removes its window/document listeners. MainWidget.vue
// unmounts this component whenever the view switches away (v-else-if),
// so leaving the view ends the connection; the game server's own
// sessionToken reconnect grace (60s) is what lets a player come back to a
// game in progress.
const VENDOR_BASE = '/widgets/embuscade-vendor/';
const CSS_LINK_ID = 'embuscade-vendor-css';

// Same-origin by default: Envoy routes /embuscade-ws to the game server
// (see infra/envoy/envoy.yaml). VITE_EMBUSCADE_WS_URL overrides it for
// local-k8s/ testing, where the SPA dev server (:5173) and the gateway
// (:8080) are different origins -- same idea as VITE_GRPC_WEB_ORIGIN, and
// read from the same repo-root .env.local (see vite-widget-lib's envDir).
function gameWsUrl() {
  if (import.meta.env.VITE_EMBUSCADE_WS_URL) return import.meta.env.VITE_EMBUSCADE_WS_URL;
  const scheme = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${scheme}//${window.location.host}/embuscade-ws`;
}

export default {
  name: 'EmbuscadeWidget',
  props: {
    data: { type: Object, required: true },
    title: { type: String, default: '' },
  },
  created() {
    window.addEventListener('widgetgrid:before-navigate', this.onBeforeNavigate);
    window.addEventListener('beforeunload', this.onBeforeUnload);
  },
  mounted() {
    this.loadCss();
    import(/* @vite-ignore */ `${VENDOR_BASE}embuscade.js`).then((mod) => {
      // The view can switch away while the import is still in flight --
      // mounting then would open a socket nothing ever closes.
      if (this.isUnmounted) return;
      this.unmountGame = mod.mount(this.$refs.container, { wsUrl: gameWsUrl() });
    });
  },
  beforeUnmount() {
    window.removeEventListener('widgetgrid:before-navigate', this.onBeforeNavigate);
    window.removeEventListener('beforeunload', this.onBeforeUnload);
    this.isUnmounted = true;
    this.unmountGame?.();
  },
  methods: {
    // Leaving the view unmounts the game and drops its connection (see the
    // comment at the top), so ask first. TopBarWidget.vue fires this
    // (cancelable) before switching views.
    onBeforeNavigate(event) {
      if (!window.confirm('Leave Embuscade? You\'ll be disconnected from the game.')) {
        event.preventDefault();
      }
    },
    // Tab close/reload/typed URL -- browsers only show their own generic
    // "leave site?" prompt here, never custom text.
    onBeforeUnload(event) {
      event.preventDefault();
      event.returnValue = ''; // Safari still needs the legacy form
    },
    loadCss() {
      if (document.getElementById(CSS_LINK_ID)) return;
      const link = document.createElement('link');
      link.id = CSS_LINK_ID;
      link.rel = 'stylesheet';
      link.href = `${VENDOR_BASE}embuscade.css`;
      document.head.appendChild(link);
    },
  },
};
</script>

<style scoped>
/* The game's own root (.embuscade) is height:100%, so this has to give it
   MainWidget's full scroll-container height to fill. */
.widget-embuscade {
  height: 100%;
}
</style>
