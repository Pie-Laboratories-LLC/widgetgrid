import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServerFeatures } from './features.js';

test('seams follow the flags as Consul has them at each resolve', () => {
  let config = { featureFlags: { 'wgtgrd-4': false } };
  const features = createServerFeatures({ siteConfig: { get: () => config } });
  features.provide('server/Greeter', { flag: 'wgtgrd-4', on: 'new', off: 'old' });
  assert.equal(features.resolve('server/Greeter'), 'old');
  config = { featureFlags: { 'wgtgrd-4': true } };
  assert.equal(features.resolve('server/Greeter'), 'new');
});
