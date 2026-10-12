import { test } from 'node:test';
import assert from 'node:assert/strict';
import { visibleRows, ancestorIds, subtreeIds, childrenIndex, lastOpenChild } from '../src/tree.js';

// root A (rank V) with children A1 (V), A2 (W); A1 has A1a; root B (U, so first).
const issues = [
  { id: 'A', parentId: '', siblingRank: 'V' },
  { id: 'A2', parentId: 'A', siblingRank: 'W' },
  { id: 'A1', parentId: 'A', siblingRank: 'V' },
  { id: 'A1a', parentId: 'A1', siblingRank: 'V' },
  { id: 'B', parentId: '', siblingRank: 'U' },
];
const show = (rows) => rows.map((r) => `${'  '.repeat(r.depth)}${r.issue.id}${r.hasChildren ? (r.expanded ? ' v' : ' >') : ''}`);

test('parents start collapsed: only roots, in rank order', () => {
  assert.deepEqual(show(visibleRows(issues, new Set())), ['B', 'A >']);
});

test('expanding shows children in rank order, nested by depth', () => {
  assert.deepEqual(show(visibleRows(issues, new Set(['A']))), ['B', 'A v', '  A1 >', '  A2']);
  assert.deepEqual(show(visibleRows(issues, new Set(['A', 'A1']))), ['B', 'A v', '  A1 v', '    A1a', '  A2']);
});

test('an expanded flag under a collapsed parent stays hidden', () => {
  assert.deepEqual(show(visibleRows(issues, new Set(['A1']))), ['B', 'A >']);
});

test('ancestors nearest first, and subtrees', () => {
  assert.deepEqual(ancestorIds(issues, 'A1a'), ['A1', 'A']);
  assert.deepEqual(ancestorIds(issues, 'B'), []);
  assert.deepEqual(subtreeIds(issues, 'A').sort(), ['A', 'A1', 'A1a', 'A2']);
});

test('ranks compare as bytes, not locale order', () => {
  const index = childrenIndex([
    { id: 'lower', parentId: '', siblingRank: 'a' },
    { id: 'upper', parentId: '', siblingRank: 'Z' },
  ]);
  assert.deepEqual(index.get('').map((i) => i.id), ['upper', 'lower']);
});

test('closed issues sink below open siblings, in creation order', () => {
  const siblings = [
    { id: 'open-late', parentId: '', siblingRank: 'Z', number: 1 },
    { id: 'closed-new', parentId: '', siblingRank: 'A', number: 9 },
    { id: 'open-early', parentId: '', siblingRank: 'B', number: 5 },
    { id: 'closed-old', parentId: '', siblingRank: 'C', number: 2 },
  ];
  const closed = new Set(['closed-new', 'closed-old']);
  const isClosed = (i) => closed.has(i.id);
  assert.deepEqual(visibleRows(siblings, new Set(), isClosed).map((r) => r.issue.id), ['open-early', 'open-late', 'closed-old', 'closed-new']);
  assert.equal(lastOpenChild(siblings, '', isClosed).id, 'open-late');
  assert.equal(lastOpenChild(siblings, '', isClosed, 'open-late').id, 'open-early');
  assert.equal(lastOpenChild([], '', isClosed), null);
});
