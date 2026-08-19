<template>
  <section class="widget widget-splash">
    <!-- Single handler on the stage, not the logo/overlay separately: the
         overlay has pointer-events: none (see its own comment) so it never
         receives its own click, and the stage is the logo+overlay's exact
         footprint anyway, so this is "clicking the logo or svg" in
         practice without fighting that. -->
    <div class="splash-stage" @click="dismiss">
      <picture>
        <source :srcset="srcset" sizes="(min-width: 1024px) 1024px, 100vw" />
        <img :src="assetUrl('logo-1024.png')" :alt="data?.alt || 'Pie Laboratories LLC'" class="splash-logo" width="1024" height="769" />
      </picture>
      <img :src="assetUrl('overlay.svg')" alt="" class="splash-overlay" aria-hidden="true" />
    </div>
  </section>
</template>

<script>
// Asset URLs are built at runtime (assetUrl), not written as static
// src/srcset attributes: Vue's SFC compiler rewrites static asset-looking
// attribute values into ES imports at compile time, and Vite's build.lib
// mode base64-inlines every imported asset into the JS bundle regardless
// of size or assetsInlineLimit -- which would defeat the whole point of
// shipping three logo widths, since the browser would fetch every srcset
// candidate every time. A dynamic binding isn't statically analyzable, so
// the compiler leaves it alone. The actual files are copied into
// dist/splash-assets/ by a postbuild step (see package.json) so these
// resolve to real, separately-fetched files once served.
const ASSET_BASE = '/widgets/splash-assets/';

export default {
  name: 'SplashWidget',
  props: {
    data: { type: Object, required: true },
    title: { type: String, default: '' },
  },
  computed: {
    srcset() {
      return [600, 800, 1024].map((w) => `${this.assetUrl(`logo-${w}.png`)} ${w}w`).join(', ');
    },
  },
  methods: {
    assetUrl(name) {
      return ASSET_BASE + name;
    },
    // packages/web-app/src/views/PageView.vue listens for this on window --
    // this widget has no router access of its own (independently built/
    // deployed, same reasoning as every other cross-widget window event in
    // this app), so it can't just navigate to home itself.
    dismiss() {
      window.dispatchEvent(new CustomEvent('widgetgrid:splash-dismissed'));
    },
  },
};
</script>

<style scoped>
.widget-splash {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  /* True 4-corner gradient (Gravatar's default-avatar palette): top-left
     rgb(12,48,140), top-right rgb(152,50,120), bottom-left rgb(152,50,120),
     bottom-right rgb(76,33,43) -- a genuine bilinear gradient, which CSS's
     background can't express directly (linear-gradient only varies along
     one axis). Approximated as a single 135deg (top-left -> bottom-right)
     gradient through all three distinct colors, with the shared top-right/
     bottom-left color as the midpoint -- exact along the two corners that
     matter most (both ends), and since top-right and bottom-left are the
     same color here, the visible seam a true bilinear render would have
     along that anti-diagonal collapses to nothing. */
  background: linear-gradient(135deg, rgb(12, 48, 140) 0%, rgb(152, 50, 120) 50%, rgb(76, 33, 43) 100%);
}

/* Aspect ratio matches the logo (1024x769) so the overlay -- sized to the
   same viewBox -- lines up with it at every breakpoint without JS. */
.splash-stage {
  position: relative;
  width: 100%;
  max-width: 1024px;
  aspect-ratio: 1024 / 769;
  cursor: pointer;
}

.splash-stage picture,
.splash-logo {
  display: block;
  width: 100%;
  height: 100%;
}

.splash-logo {
  object-fit: contain;
}

.splash-overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
