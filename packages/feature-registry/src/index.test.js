import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createFeatureRegistry, UnknownFeature } from './index.js';
import { describeContract } from './contract.js';

function setup(flags = {}) {
  const registry = createFeatureRegistry({ isEnabled: (flag) => flags[flag] === true });
  return { registry, flags };
}

class Old { greet() { return 'hello'; } }
class New { greet() { return 'hello'; } }

test('a flagged seam gives out on or off by the flag, decided at each resolve', () => {
  const { registry, flags } = setup({ 'wgtgrd-4': false });
  registry.provide('test/Greeter', { flag: 'wgtgrd-4', on: New, off: Old });
  assert.equal(registry.resolve('test/Greeter'), Old);
  flags['wgtgrd-4'] = true;
  assert.equal(registry.resolve('test/Greeter'), New);
});

test('an unknown flag is off', () => {
  const { registry } = setup();
  registry.provide('test/Greeter', { flag: 'never-heard-of-it', on: New, off: Old });
  assert.equal(registry.resolve('test/Greeter'), Old);
});

test('after the flag is removed, the seam gives out its one implementation', () => {
  const { registry } = setup();
  registry.provide('test/Greeter', New);
  assert.equal(registry.resolve('test/Greeter'), New);
  // Objects that merely have some of on/off/flag are implementations too.
  const config = { on: 1, flag: 'x' };
  registry.provide('test/Config', config);
  assert.equal(registry.resolve('test/Config'), config);
});

test('asking for something nobody provides throws', () => {
  const { registry } = setup();
  assert.throws(() => registry.resolve('test/Typo'), UnknownFeature);
  assert.throws(() => registry.provide('test/Bad', { flag: 4, on: New, off: Old }), TypeError);
});

test('describe lists every seam and its flag', () => {
  const { registry } = setup();
  registry.provide('test/A', { flag: 'wgtgrd-4', on: New, off: Old });
  registry.provide('test/B', Old);
  assert.deepEqual(registry.describe(), [{ name: 'test/A', flag: 'wgtgrd-4' }, { name: 'test/B', flag: null }]);
});

describeContract('test/Greeter', { off: Old, on: New }, (Greeter) => {
  test('greets', () => {
    assert.equal(new Greeter().greet(), 'hello');
  });
});
