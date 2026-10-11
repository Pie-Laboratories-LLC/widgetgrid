import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { ownerConnected, isOwnerOnline, subscribePresence } from './presenceBus.js';

test('owner presence follows open connections, with a grace period before offline', () => {
  mock.timers.enable({ apis: ['setTimeout'] });
  const events = [];
  const unsubscribe = subscribePresence((online) => events.push(online));
  try {
    assert.equal(isOwnerOnline(), false);

    const closeA = ownerConnected();
    const closeB = ownerConnected();
    assert.equal(isOwnerOnline(), true);

    closeA();
    closeA(); // double close is harmless
    assert.equal(isOwnerOnline(), true);

    closeB();
    mock.timers.tick(10_000);
    assert.equal(isOwnerOnline(), true, 'still online during the grace period');

    // A reconnect inside the grace period never shows as offline.
    const closeC = ownerConnected();
    mock.timers.tick(30_000);
    assert.equal(isOwnerOnline(), true);

    closeC();
    mock.timers.tick(15_000);
    assert.equal(isOwnerOnline(), false);
    assert.deepEqual(events, [true, false]);
  } finally {
    unsubscribe();
    mock.timers.reset();
  }
});
