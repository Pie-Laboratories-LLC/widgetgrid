// widgetgrid-server's seams: implementations picked by feature flag (see
// @widgetgrid/feature-registry), against the flags in Consul as they are
// right now (siteConfig.js). A flag edited in Consul changes what the
// next resolve() gives out -- so resolve where the work happens, per call,
// not once when a service is built:
//
//   features.provide('server/BlueskyPoster', { flag: 'wgtgrd-9', on: ThreadPoster, off: BlueskyPoster });
//   ...
//   const Poster = features.resolve('server/BlueskyPoster');
//
// index.js makes the one registry; a service with a seam takes it as
// `features`, like it takes pool.
import { createFeatureRegistry } from '@widgetgrid/feature-registry';

export function createServerFeatures({ siteConfig }) {
  return createFeatureRegistry({ isEnabled: (flag) => siteConfig.get().featureFlags[flag] === true });
}
