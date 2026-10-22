import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decide } from './moderation.js';

test('confident explicit content is refused outright', () => {
  assert.equal(decide([{ name: 'Explicit Nudity', confidence: 97 }]), 'rejected');
  assert.equal(decide([{ name: 'Hate Symbols', confidence: 91 }]), 'rejected');
});

test('the unsure middle, and milder categories, go to a person', () => {
  assert.equal(decide([{ name: 'Explicit Nudity', confidence: 75 }]), 'held');
  assert.equal(decide([{ name: 'Suggestive', confidence: 95 }]), 'held');
});

test('low scores and harmless labels pass', () => {
  assert.equal(decide([]), 'ok');
  assert.equal(decide([{ name: 'Suggestive', confidence: 55 }]), 'ok');
  assert.equal(decide([{ name: 'Alcohol', confidence: 99 }]), 'ok');
});
