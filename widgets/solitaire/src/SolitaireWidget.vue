<template>
  <!-- position:relative: .overlay .dialog (solitaire.css) is
       position:absolute with no positioned ancestor of its own, so without
       this it resolves against the viewport and lands under the page's
       fixed topbar instead of within the game area. Latent in the
       standalone demo too (nothing there provides one either), just never
       visible since nothing else on that page overlaps the viewport top. -->
  <div id="solitaire" ref="container" class="widget widget-solitaire" style="position: relative">
    <div class="canvas-container">
      <canvas class="solitaire"></canvas>
    </div>
    <div class="controls">
      <button type="button" @click="dispatch('fini')">FINI</button>
      <button type="button" @click="dispatch('forfeit')">FORFEIT</button>
      <button type="button" @click="dispatch('reset')">RESET</button>
      <button type="button" @click="dispatch('help')">HELP</button>
    </div>
    <div class="credits">
      <dl>
        <dt>Card Back</dt>
        <dd>By John Opie - Tate Britain, Public Domain, <a href="https://commons.wikimedia.org/w/index.php?curid=2358904">Wikimedia Commons</a></dd>
        <dt>Card Faces</dt>
        <dd><a href="http://svg-cards.sourceforge.net/">svg-cards on sourceforge</a> by David Bellot</dd>
      </dl>
    </div>
    <div class="overlay game-dialog" style="display:none">
      <div class="dialog">
        <div class="x-bar"></div>
        <div class="content"></div>
      </div>
    </div>
    <div class="overlay error-dialog" style="display:none">
      <div class="dialog">
        <div class="x-bar"></div>
        <div class="content"></div>
      </div>
    </div>
  </div>
</template>

<script>
// Wraps ~/GIT/solitaire (a separate repo/toolchain -- vanilla JS, webpack,
// no Vue) rather than reimplementing it: the markup above is the exact
// structure its loader expects (see that repo's solitaire-index.html and
// README), vendored in at build time by scripts/vendor-solitaire.mjs.
// solitaire.css's selectors are scoped to #solitaire, hence the plain
// (non-scoped) <link> below and the id on the root element instead of
// this component's own <style scoped>.
const VENDOR_BASE = '/widgets/solitaire-vendor/';
const CSS_LINK_ID = 'solitaire-vendor-css';

export default {
  name: 'SolitaireWidget',
  props: {
    data: { type: Object, required: true },
    title: { type: String, default: '' },
  },
  mounted() {
    this.loadCss();
    import(/* @vite-ignore */ `${VENDOR_BASE}solitaire.js`).then((mod) => {
      mod.mount(this.$refs.container);
    });
  },
  methods: {
    loadCss() {
      if (document.getElementById(CSS_LINK_ID)) return;
      const link = document.createElement('link');
      link.id = CSS_LINK_ID;
      link.rel = 'stylesheet';
      link.href = `${VENDOR_BASE}solitaire.css`;
      document.head.appendChild(link);
    },
    // Matches the CustomEvent shape solitaire-loader.js's #solitaireEvent
    // listens for (see ~/GIT/solitaire/solitaire-index.html's inline
    // onclick handlers, which do the same thing) -- bubbles up to the
    // #solitaire container the loader attached its listener to.
    dispatch(type) {
      this.$refs.container.dispatchEvent(new CustomEvent('solitaire', { detail: { type }, bubbles: true }));
    },
  },
};
</script>
