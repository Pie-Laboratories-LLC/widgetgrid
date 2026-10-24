// ConfigService -- see proto/widgetgrid/v1/config.proto. The browser's
// view of siteConfig.js: the feature flags, nothing else.
export function createConfigService({ siteConfig }) {
  return {
    GetSiteConfig: (_call, callback) => {
      callback(null, { featureFlags: siteConfig.get().featureFlags });
    },
  };
}
