import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createDeviceActivity, ACTIVE_TTL_MS } from './deviceActivity.js';

function clock() {
  let t = 1_000_000;
  return { now: () => t, advance: (ms) => { t += ms; } };
}

test('a device is active while one of its tabs reports active', () => {
  const c = clock();
  const activity = createDeviceActivity({ now: c.now });
  assert.equal(activity.isActive('https://phone'), false);

  activity.report('https://phone', 'tab1', true);
  assert.equal(activity.isActive('https://phone'), true);
  assert.equal(activity.isActive('https://desktop'), false, 'other devices are unaffected');

  activity.report('https://phone', 'tab1', false);
  assert.equal(activity.isActive('https://phone'), false);
});

test('one tab going inactive does not clear another tab of the same browser', () => {
  const activity = createDeviceActivity({ now: clock().now });
  activity.report('https://desktop', 'front', true);
  activity.report('https://desktop', 'back', true);
  activity.report('https://desktop', 'back', false);
  assert.equal(activity.isActive('https://desktop'), true);
});

test('an active report expires unless refreshed (a page that froze before saying so)', () => {
  const c = clock();
  const activity = createDeviceActivity({ now: c.now });
  activity.report('https://phone', 'tab1', true);

  c.advance(ACTIVE_TTL_MS - 1);
  assert.equal(activity.isActive('https://phone'), true);
  activity.report('https://phone', 'tab1', true); // heartbeat
  c.advance(ACTIVE_TTL_MS - 1);
  assert.equal(activity.isActive('https://phone'), true);

  c.advance(1);
  assert.equal(activity.isActive('https://phone'), false);
});

test('an inactive report for an unknown device is harmless', () => {
  const activity = createDeviceActivity({ now: clock().now });
  activity.report('https://never-seen', 'tab1', false);
  assert.equal(activity.isActive('https://never-seen'), false);
});
