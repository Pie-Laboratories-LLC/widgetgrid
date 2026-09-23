import { defineConfig } from 'vite';
import { defineWidgetConfig } from '@widgetgrid/vite-widget-lib';

const widgetConfig = defineWidgetConfig({
  widgetType: 'embuscade',
  entry: 'src/index.js',
  root: import.meta.dirname,
});

export default defineConfig({
  ...widgetConfig,
  build: {
    ...widgetConfig.build,
    // Same reason as widgets/solitaire's: scripts/vendor-embuscade.mjs
    // writes dist/embuscade-vendor/ (predev + postbuild), which a
    // `vite build --watch` first pass would otherwise wipe.
    emptyOutDir: false,
  },
});
