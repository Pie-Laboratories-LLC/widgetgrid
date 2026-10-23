<template>
  <!-- Empty on purpose: the game's mount() renders its own canvas into
       this element. -->
  <div ref="container" class="widget widget-lastnaming"></div>
</template>

<script>
// Wraps ~/GIT/the-last-naming's client (a separate, private repo --
// vanilla JS and three.js, no Vue), vendored in at build time by
// scripts/vendor-lastnaming.mjs. Its contract: mount(container) renders
// the scene and returns unmount(), which stops its frame loop and frees
// its GPU resources. MainWidget.vue unmounts this component whenever the
// view switches away (v-else-if), so nothing keeps rendering behind
// another view. It loads its glTF from beside its own bundle
// (/widgets/the-last-naming-vendor/assets/). ?explore in the address
// (/games/the-last-naming?explore) turns on its walk-about mode -- the
// owner's tool for looking at things, not linked from anywhere.
const VENDOR_BASE = '/widgets/the-last-naming-vendor/';
const CSS_LINK_ID = 'the-last-naming-vendor-css';

export default {
  name: 'LastNamingWidget',
  props: {
    data: { type: Object, required: true },
    title: { type: String, default: '' },
  },
  mounted() {
    this.loadCss();
    import(/* @vite-ignore */ `${VENDOR_BASE}the-last-naming.js`).then((mod) => {
      // The view can switch away while the import is still in flight --
      // mounting then would start a render loop nothing ever stops.
      if (this.isUnmounted) return;
      const explore = new URLSearchParams(window.location.search).has('explore');
      this.unmountGame = mod.mount(this.$refs.container, { explore });
    });
  },
  beforeUnmount() {
    this.isUnmounted = true;
    this.unmountGame?.();
  },
  methods: {
    loadCss() {
      if (document.getElementById(CSS_LINK_ID)) return;
      const link = document.createElement('link');
      link.id = CSS_LINK_ID;
      link.rel = 'stylesheet';
      link.href = `${VENDOR_BASE}the-last-naming.css`;
      document.head.appendChild(link);
    },
  },
};
</script>

<style scoped>
/* The game's own root (.tln-root) is height:100%, so this has to give it
   MainWidget's full scroll-container height to fill. */
.widget-lastnaming {
  height: 100%;
}
</style>
