import { defineConfig } from 'vite';
import { defineWidgetConfig } from '@widgetgrid/vite-widget-lib';

const widgetConfig = defineWidgetConfig({
  widgetType: 'splash',
  entry: 'src/index.js',
  root: import.meta.dirname,
});

export default defineConfig({
  ...widgetConfig,
  build: {
    ...widgetConfig.build,
    // scripts/copy-assets.mjs copies the logo/overlay images into
    // dist/splash-assets/ (predev + postbuild -- see package.json).
    // emptyOutDir would wipe that out from under `vite build --watch`'s
    // first pass otherwise (predev's copy runs, then this build immediately
    // empties dist/ again before the watcher settles).
    emptyOutDir: false,
  },
});
