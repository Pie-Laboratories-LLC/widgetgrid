// Which of the owner's push-subscribed browsers has the site on screen
// right now, so a chat alert skips exactly that device and still reaches
// the others (a locked phone, a background tab, another computer).
// presenceBus.js answers a different question -- "is the site open
// anywhere" -- which suppressed the phone whenever a forgotten tab was
// open at home.
//
// Decided here, not in the service worker: a push that arrives and shows
// no notification counts as a silent push, and browsers (iOS especially)
// revoke the subscription for those (see packages/web-app/public/sw.js).
//
// Keyed by push endpoint (one per browser) and then by tab, since every
// tab of a browser shares its endpoint and one tab going hidden mustn't
// clear another that's still in front. An active report lasts
// ACTIVE_TTL_MS; the page re-reports every 10s while active (see
// widgets/main/src/activityReporter.js), so a page that froze without
// getting its "inactive" report out (a phone locking mid-request) stops
// counting within this window.
//
// In-process only, like presenceBus.js -- correct while widgetgrid-server
// runs a single replica.
export const ACTIVE_TTL_MS = 25 * 1000;

export function createDeviceActivity({ now = Date.now } = {}) {
  const devices = new Map(); // endpoint -> Map(tabId -> expiresAt)

  return {
    report(endpoint, tabId, active) {
      let tabs = devices.get(endpoint);
      if (active) {
        if (!tabs) devices.set(endpoint, (tabs = new Map()));
        tabs.set(tabId, now() + ACTIVE_TTL_MS);
      } else if (tabs) {
        tabs.delete(tabId);
        if (tabs.size === 0) devices.delete(endpoint);
      }
    },

    isActive(endpoint) {
      const tabs = devices.get(endpoint);
      if (!tabs) return false;
      const t = now();
      for (const [tabId, expiresAt] of tabs) {
        if (expiresAt <= t) tabs.delete(tabId);
      }
      if (tabs.size === 0) {
        devices.delete(endpoint);
        return false;
      }
      return true;
    },
  };
}
