import { defineConfig } from 'vite';
import { defineWidgetConfig } from '@widgetgrid/vite-widget-lib';

const widgetConfig = defineWidgetConfig({
  widgetType: 'lastnaming',
  entry: 'src/index.js',
  root: import.meta.dirname,
});

export default defineConfig({
  ...widgetConfig,
  build: {
    ...widgetConfig.build,
    // Same reason as widgets/embuscade's: scripts/vendor-lastnaming.mjs
    // writes dist/the-last-naming-vendor/ (predev + postbuild), which a
    // `vite build --watch` first pass would otherwise wipe.
    emptyOutDir: false,
  },
});
