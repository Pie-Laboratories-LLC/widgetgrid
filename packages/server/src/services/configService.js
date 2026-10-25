// ConfigService -- see proto/widgetgrid/v1/config.proto. The browser's
// view of siteConfig.js: the feature flags, nothing else.
const visible = (config) => ({ featureFlags: config.featureFlags });

export function createConfigService({ siteConfig }) {
  return {
    GetSiteConfig: (_call, callback) => {
      callback(null, visible(siteConfig.get()));
    },

    // Now, then on every change, until the page goes away.
    WatchSiteConfig(call) {
      call.write(visible(siteConfig.get()));
      const stop = siteConfig.onChange((config) => call.write(visible(config)));
      call.on('cancelled', stop);
      call.on('error', stop);
    },
  };
}
