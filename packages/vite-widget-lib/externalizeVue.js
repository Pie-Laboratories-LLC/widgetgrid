// Every widget bundle and the host app must resolve to the SAME Vue module
// instance at runtime (via the import map declared in web-app/index.html --
// see web-app's README), or component interop across the host/widget
// boundary silently breaks -- not just visibly (e.g. scoped CSS's
// __scopeId depends on Vue's internal currentInstance tracking, which is
// per-module-instance state) but also reactivity, provide/inject, etc.
// `build.rollupOptions.external` alone only covers `vite build`; this
// plugin's `resolveId` hook is what also covers `vite dev` (widgets never
// actually run in dev/serve mode themselves -- their own "dev" script is
// `vite build --watch`, still build-mode -- so this only matters for the
// host app's `vite dev`).
//
// The `serve` branch below resolves to the literal PUBLIC URL
// (/vendor/vue.esm-browser.prod.js), not a filesystem path: an earlier
// version returned an absolute fs path, which worked (content loaded fine)
// but Vite served it at /public/vendor/vue.esm-browser.prod.js -- a
// DIFFERENT URL than the one the page's <script type="importmap"> points
// bare "vue" imports at (widget bundles, loaded via native browser
// import(), resolve through that import map). Two different module URLs
// for the same file means two separate module instances, silently
// defeating the whole point of this plugin. Returning the exact public URL
// string here, with no `external` flag, lets Vite's own request-serving
// fall through to its normal public-dir static handling for that URL --
// also sidesteps a Vite 8/Rolldown regression where resolveId returning
// `external: true` breaks the dev server's loadAndTransform step
// (https://github.com/vitejs/vite/issues/11633 -- "Failed to load url vue
// ... Does the file exist?").
export function externalizeVue() {
  let command;
  return {
    name: 'externalize-vue-for-importmap',
    enforce: 'pre',
    configResolved(config) {
      command = config.command;
    },
    resolveId(id) {
      if (id !== 'vue') return null;
      if (command === 'build') return { id, external: true };
      return '/vendor/vue.esm-browser.prod.js';
    },
  };
}
