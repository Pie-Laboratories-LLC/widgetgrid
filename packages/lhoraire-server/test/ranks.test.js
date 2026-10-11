import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rankBetween, rankAfter } from '../src/ranks.js';

const byteOrder = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

test('appending keeps ranks increasing and short', () => {
  const ranks = [];
  let last = '';
  for (let i = 0; i < 1000; i += 1) {
    last = rankAfter(last);
    ranks.push(last);
  }
  assert.deepEqual([...ranks].sort(byteOrder), ranks);
  assert.ok(ranks.at(-1).length <= 40, `1000 appends -> ${ranks.at(-1).length} chars`);
});

test('appended ranks still leave room in between', () => {
  const a = rankAfter('');
  const b = rankAfter(a);
  const mid = rankBetween(a, b);
  assert.ok(a < mid && mid < b);
});

test('there is always room between two ranks', () => {
  let lo = rankBetween('', null);
  const hi = rankBetween(lo, null);
  for (let i = 0; i < 200; i += 1) {
    const mid = rankBetween(lo, hi);
    assert.ok(lo < mid && mid < hi, `${lo} < ${mid} < ${hi}`);
    assert.ok(!mid.endsWith('0'));
    lo = mid;
  }
});

test('inserting before the first rank', () => {
  let first = rankBetween('', null);
  for (let i = 0; i < 100; i += 1) {
    const before = rankBetween('', first);
    assert.ok(before < first);
    first = before;
  }
});

test('refuses inverted or malformed bounds', () => {
  assert.throws(() => rankBetween('b', 'a'));
  assert.throws(() => rankBetween('a', 'a'));
  assert.throws(() => rankBetween('a0', null));
});
