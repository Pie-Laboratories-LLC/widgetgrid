import vue from '@vitejs/plugin-vue';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import { resolve } from 'node:path';
import { externalizeVue } from './externalizeVue.js';

// One URL per widget type is the contract the frontend's widgetLoader.js
// relies on (import(`/widgets/${type}.js`)) -- vite-plugin-css-injected-by-js
// inlines a widget's scoped <style> into that same .js file at runtime so a
// widget never needs a second, separately-tracked .css URL.
export function defineWidgetConfig({ widgetType, entry, root }) {
  return {
    plugins: [vue(), externalizeVue(), cssInjectedByJsPlugin()],
    optimizeDeps: { exclude: ['vue'] },
    build: {
      lib: {
        entry: resolve(root, entry),
        formats: ['es'],
        fileName: () => `${widgetType}.js`,
      },
      rollupOptions: { external: ['vue'] },
      outDir: resolve(root, 'dist'),
      emptyOutDir: true,
    },
  };
}
