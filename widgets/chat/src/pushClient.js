// Browser side of Web Push for the owner: subscribe this browser with its
// push service and register the subscription with PushService (see
// packages/server/src/services/pushService.js). The service worker that
// shows the notifications is packages/web-app/public/sw.js.
import {
  GetPushConfigRequest,
  RegisterPushSubscriptionRequest,
  RemovePushSubscriptionRequest,
  SendTestPushRequest,
} from '@widgetgrid/proto-gen-web/widgetgrid/v1/push_pb.js';
import { PushServicePromiseClient } from '@widgetgrid/proto-gen-web/widgetgrid/v1/push_grpc_web_pb.js';
import { authMetadata } from '@widgetgrid/auth-web';

const GRPC_WEB_ORIGIN = import.meta.env.VITE_GRPC_WEB_ORIGIN ?? '';
const client = new PushServicePromiseClient(GRPC_WEB_ORIGIN);

function isIos() {
  return /iPhone|iPad|iPod/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); // iPadOS reports as a Mac
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
}

// 'supported' | 'needs-home-screen' (iOS in a browser tab: Web Push only
// exists once the site is added to the Home Screen) | 'unsupported'
export function pushSupport() {
  const has = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  if (has) return 'supported';
  return isIos() && !isStandalone() ? 'needs-home-screen' : 'unsupported';
}

function urlBase64ToUint8Array(base64) {
  const padded = (base64 + '='.repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
}

export async function isEnabledHere() {
  if (Notification.permission !== 'granted') return false;
  const registration = await navigator.serviceWorker.ready;
  return !!(await registration.pushManager.getSubscription());
}

// Must be called straight from a click/tap: iOS only shows the permission
// prompt in response to a user gesture.
export async function enablePush() {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error(permission === 'denied' ? 'blocked' : 'dismissed');

  const configRequest = new GetPushConfigRequest();
  configRequest.setRequestedAtMs(Date.now());
  const key = (await client.getPushConfig(configRequest, {})).getVapidPublicKey();
  if (!key) throw new Error('not-configured');

  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(key),
    });
  }
  const { endpoint, keys } = subscription.toJSON();
  const request = new RegisterPushSubscriptionRequest();
  request.setEndpoint(endpoint);
  request.setP256dh(keys.p256dh);
  request.setAuth(keys.auth);
  request.setUserAgent(navigator.userAgent);
  await client.registerPushSubscription(request, await authMetadata());
}

export async function disablePush() {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return;
  const request = new RemovePushSubscriptionRequest();
  request.setEndpoint(subscription.endpoint);
  await client.removePushSubscription(request, await authMetadata());
  await subscription.unsubscribe();
}

// Returns how many of the owner's browsers the push services accepted it for.
export async function sendTestPush() {
  const request = new SendTestPushRequest();
  request.setRequestedAtMs(Date.now());
  return (await client.sendTestPush(request, await authMetadata())).getDelivered();
}
