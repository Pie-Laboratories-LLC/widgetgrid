import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSiteConfig, normalizeConfig } from './siteConfig.js';

// A fake Consul: answers each request from `script` in turn -- a status,
// an index, and the key's value -- then holds the next request open until
// stopped, as a blocking query does.
function fakeConsul(script) {
  const requests = [];
  const fetch = async (url, { signal }) => {
    requests.push(url);
    const step = script.shift();
    if (!step) {
      return new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new Error('aborted'))));
    }
    if (step.error) throw new Error(step.error);
    const value = step.value === undefined ? null : Buffer.from(step.value).toString('base64');
    return {
      status: step.status ?? 200,
      ok: (step.status ?? 200) < 300,
      headers: new Headers({ 'x-consul-index': String(step.index ?? 0) }),
      json: async () => [{ Value: value }],
    };
  };
  return { fetch, requests };
}

const settle = () => new Promise((resolve) => { setTimeout(resolve, 20); });

test('reads the flags, then waits on the key for changes', async () => {
  const consul = fakeConsul([
    { index: 5, value: '{"featureFlags":{"wgtgrd-4":false}}' },
    { index: 9, value: '{"featureFlags":{"wgtgrd-4":true}}' },
  ]);
  const config = createSiteConfig({ consulAddr: 'http://consul:8500', fetch: consul.fetch, retryMs: 1 });
  assert.deepEqual(config.get().featureFlags, {});
  config.start();
  await settle();
  assert.deepEqual(config.get().featureFlags, { 'wgtgrd-4': true });
  assert.equal(consul.requests[0], 'http://consul:8500/v1/kv/config/widgetgrid');
  assert.equal(consul.requests[1], 'http://consul:8500/v1/kv/config/widgetgrid?index=5&wait=5m');
  assert.equal(consul.requests[2], 'http://consul:8500/v1/kv/config/widgetgrid?index=9&wait=5m');
  config.stop();
});

test('a missing key, bad JSON or an unreachable Consul never turns a flag on', async () => {
  const consul = fakeConsul([
    { status: 404, index: 3 },
    { index: 4, value: '{"featureFlags":{"wgtgrd-4":true}}' },
    { index: 6, value: 'not json' },
    { error: 'ECONNREFUSED' },
  ]);
  const config = createSiteConfig({ consulAddr: 'http://consul:8500', fetch: consul.fetch, retryMs: 1 });
  config.start();
  await settle();
  // The bad JSON and the failure kept the last good value.
  assert.deepEqual(config.get().featureFlags, { 'wgtgrd-4': true });
  config.stop();

  const missing = createSiteConfig({ consulAddr: 'http://consul:8500', fetch: fakeConsul([{ status: 404, index: 3 }]).fetch, retryMs: 1 });
  missing.start();
  await settle();
  assert.deepEqual(missing.get().featureFlags, {});
  missing.stop();
});

test('without Consul, every flag is off', () => {
  const config = createSiteConfig({ consulAddr: '' });
  config.start();
  assert.deepEqual(config.get().featureFlags, {});
});

test('only booleans are flags', () => {
  assert.deepEqual(normalizeConfig({ featureFlags: { a: true, b: 'yes', c: 1, d: false } }), { featureFlags: { a: true, d: false } });
  assert.deepEqual(normalizeConfig(null), { featureFlags: {} });
});
