// The site's feature flags in the browser. They live in Consul
// (config/widgetgrid, from the pielabs-configuration repo -- see
// packages/server/src/siteConfig.js) and change without a deploy; the
// server hands the browser just the flags (proto/widgetgrid/v1/config.proto).
//
// Two ways to use one:
//
// Showing or hiding a whole thing -- in any template (featureFlagsPlugin,
// installed once by the host app, puts it on every component):
//
//   <li v-if="ffEnabled('wgtgrd-4')">The Last Naming</li>
//
// or useFeatureFlag('wgtgrd-4') for the same as a ref in code.
//
// Changing behaviour -- by implementation, not by if/else: the old one
// whole in one component or class, the new one beside it, and a seam that
// picks (see @widgetgrid/feature-registry):
//
//   provideFeature('main/GamesList', { flag: 'wgtgrd-4', on: GamesListNext, off: GamesList });
//   <component :is="resolveFeature('main/GamesList')" />
//
// Every flag is off until the server has answered: a flagged thing can
// show up a moment late, never show and then vanish.
//
// Bundled into each widget that asks, like @widgetgrid/auth-web, so the
// state lives on window, where every bundle's copy finds the same one --
// one fetch, one registry, one reactive store per page (every bundle
// shares the page's one Vue).
import { reactive, computed } from 'vue';
import { createFeatureRegistry } from '@widgetgrid/feature-registry';
import { GetSiteConfigRequest } from '@widgetgrid/proto-gen-web/widgetgrid/v1/config_pb.js';
import { ConfigServicePromiseClient } from '@widgetgrid/proto-gen-web/widgetgrid/v1/config_grpc_web_pb.js';

const GRPC_WEB_ORIGIN = import.meta.env.VITE_GRPC_WEB_ORIGIN ?? '';

function shared() {
  if (!window.__widgetgridFeatureFlags) {
    const state = reactive({ flags: {}, loaded: false });
    window.__widgetgridFeatureFlags = {
      state,
      request: null,
      registry: createFeatureRegistry({ isEnabled: (flag) => state.flags[flag] === true }),
    };
  }
  return window.__widgetgridFeatureFlags;
}

// Resolves to { [flag]: true|false } once the server has answered. A
// failed fetch leaves every flag off (and is tried again on the next ask).
export function featureFlags() {
  const page = shared();
  page.request ??= (async () => {
    try {
      const request = new GetSiteConfigRequest();
      request.setRequestedAtMs(Date.now());
      const response = await new ConfigServicePromiseClient(GRPC_WEB_ORIGIN).getSiteConfig(request, {});
      const flags = {};
      response.getFeatureFlagsMap().forEach((on, name) => { flags[name] = on; });
      page.state.flags = flags;
      page.state.loaded = true;
      return flags;
    } catch (err) {
      console.error('feature flags unavailable:', err);
      page.request = null;
      return {};
    }
  })();
  return page.request;
}

// Whether a flag is on right now -- reactive, so a template or computed
// that asks updates when the flags arrive.
export function isEnabled(flag) {
  return shared().state.flags[flag] === true;
}

// Whether the server has answered yet (until then every flag reads off).
export function flagsLoaded() {
  return shared().state.loaded;
}

export function useFeatureFlag(flag) {
  featureFlags();
  return computed(() => isEnabled(flag));
}

// The page's seams: see the header, and @widgetgrid/feature-registry.
// resolveFeature reads the flags reactively, so a template using it swaps
// implementations when they arrive.
export function provideFeature(name, implementation) {
  shared().registry.provide(name, implementation);
}

export function resolveFeature(name) {
  return shared().registry.resolve(name);
}

// Installed once, by the host app (packages/web-app/src/main.js): every
// component's template gets ffEnabled() and resolveFeature(), and the
// flags start loading with the page.
export const featureFlagsPlugin = {
  install(app) {
    app.config.globalProperties.ffEnabled = isEnabled;
    app.config.globalProperties.resolveFeature = resolveFeature;
    featureFlags();
  },
};
