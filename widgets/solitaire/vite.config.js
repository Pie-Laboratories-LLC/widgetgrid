import { defineConfig } from 'vite';
import { defineWidgetConfig } from '@widgetgrid/vite-widget-lib';

const widgetConfig = defineWidgetConfig({
  widgetType: 'solitaire',
  entry: 'src/index.js',
  root: import.meta.dirname,
});

export default defineConfig({
  ...widgetConfig,
  build: {
    ...widgetConfig.build,
    // scripts/vendor-solitaire.mjs copies the solitaire game's own build
    // (a separate repo/toolchain -- see that script's comment) into
    // dist/solitaire-vendor/ (predev + postbuild -- see package.json).
    // emptyOutDir:false so `vite build --watch`'s first pass doesn't wipe
    // that out from under predev's copy before the watcher settles.
    emptyOutDir: false,
  },
});
