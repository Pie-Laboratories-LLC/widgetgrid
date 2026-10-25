import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { createConfigService } from './configService.js';

function fakeSiteConfig(initial) {
  let current = initial;
  const listeners = new Set();
  return {
    get: () => current,
    onChange: (listener) => { listeners.add(listener); return () => listeners.delete(listener); },
    set(next) { current = next; for (const l of listeners) l(next); },
    listeners,
  };
}

test('GetSiteConfig gives the flags and nothing else', async () => {
  const siteConfig = fakeSiteConfig({ featureFlags: { 'wgtgrd-4': true }, secret: 'x' });
  const service = createConfigService({ siteConfig });
  const response = await new Promise((resolve) => { service.GetSiteConfig({}, (_err, res) => resolve(res)); });
  assert.deepEqual(response, { featureFlags: { 'wgtgrd-4': true } });
});

test('WatchSiteConfig sends now, then each change, until the page goes', () => {
  const siteConfig = fakeSiteConfig({ featureFlags: { 'wgtgrd-4': false } });
  const service = createConfigService({ siteConfig });
  const call = new EventEmitter();
  const written = [];
  call.write = (message) => written.push(message.featureFlags['wgtgrd-4']);
  service.WatchSiteConfig(call);
  siteConfig.set({ featureFlags: { 'wgtgrd-4': true } });
  assert.deepEqual(written, [false, true]);
  call.emit('cancelled');
  assert.equal(siteConfig.listeners.size, 0);
});
