import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseEmailList, parseAssignedUsernames } from './siteAccounts.js';

test('parseEmailList lowercases, trims and drops blanks', () => {
  assert.deepEqual(parseEmailList(' A@x.com, ,b@Y.org '), ['a@x.com', 'b@y.org']);
  assert.deepEqual(parseEmailList(undefined), []);
});

test('parseAssignedUsernames maps both ways, keeping the name as written', () => {
  const a = parseAssignedUsernames('pielabs=Webmaster@Example.com, webmaster = me@example.org, broken, =x@y.z');
  assert.equal(a.forEmail('webmaster@example.com'), 'pielabs');
  assert.equal(a.forEmail(' ME@example.org'), 'webmaster');
  assert.equal(a.ownerOf('PIELABS'), 'webmaster@example.com');
  assert.equal(a.ownerOf('nobody'), null);
  assert.equal(a.forEmail('stranger@example.com'), null);
});
