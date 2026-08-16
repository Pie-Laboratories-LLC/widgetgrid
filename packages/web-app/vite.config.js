import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { externalizeVue } from '@widgetgrid/vite-widget-lib/externalizeVue.js';
import path from 'node:path';

export default defineConfig({
  plugins: [vue(), externalizeVue()],
  optimizeDeps: {
    exclude: ['vue'],
    // @widgetgrid/proto-gen-web (proto/scripts/gen-web.mjs's output) is
    // CommonJS (import_style=commonjs -- google-protobuf/grpc-web's JS
    // codegen doesn't offer a native-ESM output mode), but client.js
    // imports it with native `import { X } from ...`. Vite's dev-time
    // pre-bundler normally handles CJS interop for exactly this case, but
    // skips packages resolved through a workspace symlink by default --
    // explicitly including them forces that conversion to actually run.
    include: [
      '@widgetgrid/proto-gen-web/widgetgrid/v1/page_pb.js',
      '@widgetgrid/proto-gen-web/widgetgrid/v1/page_grpc_web_pb.js',
      '@widgetgrid/proto-gen-web/widgetgrid/v1/widget_pb.js',
      '@widgetgrid/proto-gen-web/widgetgrid/v1/widget_grpc_web_pb.js',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
  },
});
