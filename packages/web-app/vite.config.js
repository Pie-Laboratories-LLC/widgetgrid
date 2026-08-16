import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { externalizeVue } from '@widgetgrid/vite-widget-lib/externalizeVue.js';
import path from 'node:path';

export default defineConfig({
  plugins: [vue(), externalizeVue()],
  optimizeDeps: { exclude: ['vue'] },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
  },
});
