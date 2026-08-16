<template>
  <section class="widget widget-splash">
    <div class="splash-stage">
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
  background: radial-gradient(ellipse at center, #2e1250 0%, #150a2e 45%, #050208 100%);
}

/* Aspect ratio matches the logo (1024x769) so the overlay -- sized to the
   same viewBox -- lines up with it at every breakpoint without JS. */
.splash-stage {
  position: relative;
  width: 100%;
  max-width: 1024px;
  aspect-ratio: 1024 / 769;
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
