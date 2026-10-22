import { defineConfig } from 'vite';
import { defineWidgetConfig } from '@widgetgrid/vite-widget-lib';

export default defineConfig(defineWidgetConfig({
  widgetType: 'author',
  entry: 'src/index.js',
  root: import.meta.dirname,
}));
