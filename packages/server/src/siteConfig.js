// The site's runtime configuration: a JSON document in Consul's key/value
// store (CONFIG_KEY, "config/widgetgrid"), so it can change without a
// deploy. Its source is the widgetgrid/ folder of the pielabs-configuration
// repo (~/GIT/pielabs-configuration: defaults plus a file per environment,
// written to Consul by its apply.sh); locally it can also be flipped in
// the Consul UI. Each environment's cluster has its own Consul, so kind,
// dev and prod each have their own copy.
//
//   { "featureFlags": { "wgtgrd-4": false } }
//
// Read at startup, then watched with Consul's blocking queries: each
// request waits until the key changes (or WAIT passes), so an edit lands
// within a second or two, with no polling in between.
//
// Anything wrong -- Consul unreachable, the key missing, JSON that won't
// parse -- keeps the last good value; before there is one, every flag is
// off. A hiccup can hide a feature, never reveal one.

export const CONFIG_KEY = 'config/widgetgrid';
const WAIT = '5m';
const RETRY_MS = 5_000;

export const EMPTY_CONFIG = Object.freeze({ featureFlags: Object.freeze({}) });

// Only booleans count as flags; anything else in featureFlags is ignored.
export function normalizeConfig(raw) {
  const flags = {};
  for (const [name, on] of Object.entries(raw?.featureFlags ?? {})) {
    if (typeof on === 'boolean') flags[name] = on;
  }
  return { featureFlags: flags };
}

// consulAddr: e.g. http://consul-server.consul.svc:8500. Without one
// (a server run outside a cluster), the configuration stays empty.
export function createSiteConfig({ consulAddr, key = CONFIG_KEY, fetch = globalThis.fetch, retryMs = RETRY_MS }) {
  let current = EMPTY_CONFIG;
  let stopped = false;
  let controller = null;

  async function watch() {
    let index = 0;
    while (!stopped) {
      controller = new AbortController();
      try {
        const query = index ? `?index=${index}&wait=${WAIT}` : '';
        const response = await fetch(`${consulAddr}/v1/kv/${key}${query}`, { signal: controller.signal });
        const nextIndex = Number(response.headers.get('x-consul-index')) || 0;
        if (response.status === 404) {
          if (index === 0) console.log(`[siteConfig] ${key} isn't in Consul yet: every flag is off`);
        } else if (!response.ok) {
          throw new Error(`Consul answered ${response.status}`);
        } else {
          const [entry] = await response.json();
          const value = Buffer.from(entry?.Value ?? '', 'base64').toString('utf8');
          try {
            const next = normalizeConfig(JSON.parse(value));
            if (JSON.stringify(next) !== JSON.stringify(current)) {
              console.log(`[siteConfig] ${key}: ${JSON.stringify(next)}`);
            }
            current = next;
          } catch {
            console.error(`[siteConfig] ${key} isn't valid JSON; keeping what was there`);
          }
        }
        // An index that goes backwards (Consul restored, its data reset)
        // means start over; Consul's own advice for blocking queries.
        index = nextIndex > index ? nextIndex : 0;
        if (nextIndex <= 0) await sleep(retryMs);
      } catch (err) {
        if (stopped) return;
        console.error(`[siteConfig] reading ${key} from Consul failed:`, err.message);
        index = 0;
        await sleep(retryMs);
      }
    }
  }

  return {
    get: () => current,
    start() {
      if (!consulAddr) {
        console.log('[siteConfig] no CONSUL_HTTP_ADDR: every flag is off');
        return;
      }
      watch();
    },
    stop() {
      stopped = true;
      controller?.abort();
    },
  };
}

function sleep(ms) {
  return new Promise((resolve) => { setTimeout(resolve, ms).unref?.(); });
}
