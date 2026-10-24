// The site's feature flags: which unfinished things may be shown. They
// live in Consul (config/widgetgrid, from the pielabs-configuration repo --
// see packages/server/src/siteConfig.js)
// and change without a deploy; the server hands the browser just the flags
// (proto/widgetgrid/v1/config.proto).
//
// Bundled into each widget that asks, like @widgetgrid/auth-web, but
// fetched once per page load: the request is kept on window, where every
// bundle's copy finds it. A failed fetch counts as every flag off (and is
// tried again on the next ask).
import { GetSiteConfigRequest } from '@widgetgrid/proto-gen-web/widgetgrid/v1/config_pb.js';
import { ConfigServicePromiseClient } from '@widgetgrid/proto-gen-web/widgetgrid/v1/config_grpc_web_pb.js';

const GRPC_WEB_ORIGIN = import.meta.env.VITE_GRPC_WEB_ORIGIN ?? '';
const SHARED = '__widgetgridFeatureFlags';

// -> { [flag]: true|false }; a flag that isn't there is off.
export function featureFlags() {
  window[SHARED] ??= (async () => {
    try {
      const request = new GetSiteConfigRequest();
      request.setRequestedAtMs(Date.now());
      const response = await new ConfigServicePromiseClient(GRPC_WEB_ORIGIN).getSiteConfig(request, {});
      const flags = {};
      response.getFeatureFlagsMap().forEach((on, name) => { flags[name] = on; });
      return flags;
    } catch (err) {
      console.error('feature flags unavailable:', err);
      window[SHARED] = null;
      return {};
    }
  })();
  return window[SHARED];
}

export async function isEnabled(flag) {
  return (await featureFlags())[flag] === true;
}
