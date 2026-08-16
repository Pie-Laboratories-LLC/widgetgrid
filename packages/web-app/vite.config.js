import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { externalizeVue } from '@widgetgrid/vite-widget-lib/externalizeVue.js';
import path from 'node:path';
import sirv from 'sirv';

// The blog widget's rendered HTML has root-relative image URLs
// (/blog-assets/<postDir>/<file> -- see blogSource.js's rewriteImageHref),
// which the browser resolves against whatever origin actually served the
// page. In dev that's this Vite server (:5173), not the gRPC backend
// (:8080 in local-k8s/ testing) -- so this server needs to serve those
// files itself. assemble-static.mjs does the equivalent for the built
// static bundle (served by packages/static-server / Envoy in production).
function serveBlogAssets() {
  const contentBlogDir = path.resolve(import.meta.dirname, '../../content/blog');
  const serve = sirv(contentBlogDir, { dev: true });
  return {
    name: 'serve-blog-assets',
    configureServer(server) {
      server.middlewares.use('/blog-assets', (req, res, next) => serve(req, res, next));
    },
  };
}

export default defineConfig({
  plugins: [vue(), externalizeVue(), serveBlogAssets()],
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
      '@widgetgrid/proto-gen-web/widgetgrid/v1/blog_pb.js',
      '@widgetgrid/proto-gen-web/widgetgrid/v1/blog_grpc_web_pb.js',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
  },
});
