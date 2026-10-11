import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getVisitorId } from './authContext.js';

function call(headers = {}) {
  return { metadata: { get: (k) => (k in headers ? [headers[k]] : []) } };
}

test('visitor-id is read independently of authorization', () => {
  assert.equal(getVisitorId(call({ 'visitor-id': 'v-1', authorization: 'Bearer x' })), 'v-1');
  assert.equal(getVisitorId(call()), null);
});
