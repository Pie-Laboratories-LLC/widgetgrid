import { defineConfig } from 'vite';
import { defineWidgetConfig } from '@widgetgrid/vite-widget-lib';

export default defineConfig(defineWidgetConfig({
  widgetType: 'board',
  entry: 'src/index.js',
  root: import.meta.dirname,
}));
