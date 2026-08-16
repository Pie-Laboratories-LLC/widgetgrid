// Every widget bundle and the host app must resolve to the SAME Vue module
// instance at runtime (via the import map declared in web-app/index.html --
// see web-app's README), or component interop across the host/widget
// boundary silently breaks (separate reactivity systems, provide/inject not
// crossing the boundary, etc). `build.rollupOptions.external` alone only
// covers `vite build`; this plugin's `resolveId` hook is what also covers
// `vite dev`, where esbuild's dependency pre-bundler would otherwise still
// bundle vue's source directly.
export function externalizeVue() {
  return {
    name: 'externalize-vue-for-importmap',
    enforce: 'pre',
    resolveId(id) {
      if (id === 'vue') return { id, external: true };
      return null;
    },
  };
}
