// Tells the server whether this page is in front of the owner right now,
// so chat alerts skip this browser while it is and still reach the
// owner's other devices (packages/server/src/deviceActivity.js). Only
// does anything for the signed-in owner in a browser that has enabled
// push -- the push subscription's endpoint is what identifies the device.
//
// Active = visible and focused. Hidden covers a locked phone, a background
// tab and a minimised window; unfocused covers a desktop window behind
// another app.
import { ReportActivityRequest } from '@widgetgrid/proto-gen-web/widgetgrid/v1/push_pb.js';
import { PushServicePromiseClient } from '@widgetgrid/proto-gen-web/widgetgrid/v1/push_grpc_web_pb.js';
import { authMetadata, getIdentity } from '@widgetgrid/auth-web';

const GRPC_WEB_ORIGIN = import.meta.env.VITE_GRPC_WEB_ORIGIN ?? '';
const client = new PushServicePromiseClient(GRPC_WEB_ORIGIN);

// Well inside the server's 25s ACTIVE_TTL_MS, so one lost heartbeat
// doesn't drop an active page.
const HEARTBEAT_MS = 10 * 1000;

// Returns a stop function.
export function startActivityReporter() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return () => {};

  const tabId = crypto.randomUUID();
  let reportedActive = false;
  let heartbeat = null;
  // Sends go out one at a time: an "active" heartbeat that lands after
  // the "inactive" it was queued before would mark a hidden page active
  // again until it expired.
  let queue = Promise.resolve();

  async function send(active) {
    if (getIdentity()?.role !== 'owner') return;
    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration?.pushManager.getSubscription();
    if (!subscription) return;
    const request = new ReportActivityRequest();
    request.setEndpoint(subscription.endpoint);
    request.setTabId(tabId);
    request.setActive(active);
    await client.reportActivity(request, await authMetadata());
  }

  function report(active) {
    reportedActive = active;
    queue = queue.then(() => send(active)).catch(() => {}); // best effort; the server's TTL covers a lost "inactive"
  }

  function update() {
    const active = document.visibilityState === 'visible' && document.hasFocus();
    if (active) {
      report(true);
      if (!heartbeat) heartbeat = setInterval(() => report(true), HEARTBEAT_MS);
    } else {
      clearInterval(heartbeat);
      heartbeat = null;
      if (reportedActive) report(false);
    }
  }

  function onPageHide() {
    clearInterval(heartbeat);
    heartbeat = null;
    if (reportedActive) report(false);
  }

  // Sign-in, sign-out, or push just enabled here (PushControls.vue) all
  // change whether there's anything to report.
  function onIdentityOrPushChanged() {
    reportedActive = false;
    update();
  }

  document.addEventListener('visibilitychange', update);
  window.addEventListener('focus', update);
  window.addEventListener('blur', update);
  window.addEventListener('pageshow', update);
  window.addEventListener('pagehide', onPageHide);
  window.addEventListener('widgetgrid:identity-changed', onIdentityOrPushChanged);
  window.addEventListener('widgetgrid:push-changed', onIdentityOrPushChanged);
  update();

  return () => {
    document.removeEventListener('visibilitychange', update);
    window.removeEventListener('focus', update);
    window.removeEventListener('blur', update);
    window.removeEventListener('pageshow', update);
    window.removeEventListener('pagehide', onPageHide);
    window.removeEventListener('widgetgrid:identity-changed', onIdentityOrPushChanged);
    window.removeEventListener('widgetgrid:push-changed', onIdentityOrPushChanged);
    onPageHide();
  };
}
