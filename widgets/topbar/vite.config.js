import { defineConfig } from 'vite';
import { defineWidgetConfig } from '@widgetgrid/vite-widget-lib';

const widgetConfig = defineWidgetConfig({
  widgetType: 'topbar',
  entry: 'src/index.js',
  root: import.meta.dirname,
});

export default defineConfig({
  ...widgetConfig,
  build: {
    ...widgetConfig.build,
    // scripts/copy-assets.mjs copies the logo into dist/topbar-assets/
    // (predev + postbuild -- see package.json, and widgets/splash's
    // vite.config.js for why this can't just be a normal Vite asset
    // import: build.lib mode base64-inlines every imported asset
    // regardless of size, which would send the same 130KB image over the
    // wire on every navigation instead of letting the browser cache it
    // once). emptyOutDir:false so `vite build --watch`'s first pass
    // doesn't wipe out predev's copy before the watcher settles.
    emptyOutDir: false,
  },
});
