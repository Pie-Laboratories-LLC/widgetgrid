<template>
  <header class="widget widget-topbar">
    <img :src="assetUrl('logo-h255.png')" :alt="data?.alt || 'Pie Laboratories LLC'" class="topbar-logo" width="339" height="255" />
    <!-- Reserved for the site menu -- not built yet. -->
    <nav class="topbar-menu-slot"></nav>
  </header>
</template>

<script>
// Runtime URL string, not an ES import -- see SplashWidget.vue's <script>
// comment (same reason: Vite's build.lib mode would base64-inline this
// image into the JS bundle otherwise).
const ASSET_BASE = '/widgets/topbar-assets/';

export default {
  name: 'TopBarWidget',
  props: {
    data: { type: Object, required: true },
    title: { type: String, default: '' },
  },
  methods: {
    assetUrl(name) {
      return ASSET_BASE + name;
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
}

.topbar-logo {
  display: block;
  height: 255px;
  width: auto;
}

.topbar-menu-slot {
  flex: 1;
}
</style>
