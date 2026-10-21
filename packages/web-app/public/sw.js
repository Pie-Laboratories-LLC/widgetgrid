// Service worker: shows Web Push notifications (owner chat alerts sent by
// packages/server/src/pushSender.js) and opens its path (e.g. /chat) when one is
// tapped. Registered by packages/web-app/src/main.js. Deliberately does no
// caching -- the site works exactly as it does without a service worker.

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data?.text() ?? '' };
  }
  // Every push must show a notification: browsers (iOS especially) revoke
  // push permission from sites that receive pushes silently.
  event.waitUntil(self.registration.showNotification(data.title || 'Pie Laboratories', {
    body: data.body || '',
    // Same tag replaces the earlier notification instead of stacking --
    // one entry per chat conversation.
    tag: data.tag || 'widgetgrid',
    renotify: true,
    icon: '/icons/icon-192.png',
    data: { url: data.url || '/' },
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || '/', self.location.origin);
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const open = windows.find((w) => new URL(w.url).origin === self.location.origin);
    if (open) {
      // Already open: switch it to the path instead of loading a second copy.
      await open.focus();
      open.postMessage({ type: 'navigate', path: url.pathname + url.search });
      return;
    }
    await self.clients.openWindow(url.href);
  })());
});
