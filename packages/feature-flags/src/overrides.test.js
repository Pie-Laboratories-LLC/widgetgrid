import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readOverrides } from './overrides.js';

test('reads the flags from raw or URI-encoded JSON', () => {
  const json = '{"featureFlags":{"wgtgrd-4":true,"wgtgrd-9":false}}';
  assert.deepEqual(readOverrides(`a=1; WidgetGrid-config=${json}; b=2`), { 'wgtgrd-4': true, 'wgtgrd-9': false });
  assert.deepEqual(readOverrides(`WidgetGrid-config=${encodeURIComponent(json)}`), { 'wgtgrd-4': true, 'wgtgrd-9': false });
});

test('no cookie, a bad one, or non-boolean values override nothing', () => {
  assert.deepEqual(readOverrides('a=1'), {});
  assert.deepEqual(readOverrides(''), {});
  assert.deepEqual(readOverrides('WidgetGrid-config=nope'), {});
  assert.deepEqual(readOverrides('WidgetGrid-config={"featureFlags":{"x":"yes","y":true}}'), { y: true });
  // A cookie whose name merely starts the same isn't it.
  assert.deepEqual(readOverrides('WidgetGrid-configX={"featureFlags":{"y":true}}'), {});
});
