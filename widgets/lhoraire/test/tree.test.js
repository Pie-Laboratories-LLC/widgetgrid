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

test('drop planning: before, after, child, and the refusals with reasons', async () => {
  const { planDrop } = await import('../src/tree.js');
  // P (open) > [a (open), b (open), c (closed)]; Q (closed root); R (open root)
  const list = [
    { id: 'P', key: 'x-1', parentId: '', siblingRank: 'A', number: 1 },
    { id: 'a', key: 'x-2', parentId: 'P', siblingRank: 'A', number: 2 },
    { id: 'b', key: 'x-3', parentId: 'P', siblingRank: 'B', number: 3 },
    { id: 'c', key: 'x-4', parentId: 'P', siblingRank: 'C', number: 4 },
    { id: 'Q', key: 'x-5', parentId: '', siblingRank: 'B', number: 5 },
    { id: 'R', key: 'x-6', parentId: '', siblingRank: 'C', number: 6 },
  ];
  const closed = new Set(['c', 'Q']);
  const isClosed = (i) => closed.has(i.id);
  const plan = (d, t, p) => planDrop(list, isClosed, d, t, p);

  assert.deepEqual(plan('b', 'a', 'before'), { ok: true, newParentId: 'P', afterSiblingId: '' }, 'to the front');
  assert.deepEqual(plan('a', 'b', 'after'), { ok: true, newParentId: 'P', afterSiblingId: 'b' });
  assert.deepEqual(plan('R', 'b', 'before'), { ok: true, newParentId: 'P', afterSiblingId: 'a' }, 're-parent between siblings');
  assert.deepEqual(plan('a', 'R', 'child'), { ok: true, newParentId: 'R', afterSiblingId: '' });
  assert.deepEqual(plan('R', 'P', 'child'), { ok: true, newParentId: 'P', afterSiblingId: 'b' }, 'after the last open child, above the closed');
  assert.deepEqual(plan('a', 'P', 'after'), { ok: true, newParentId: '', afterSiblingId: 'P' }, 'out to top level');

  assert.match(plan('P', 'a', 'child').reason, /can't move under itself/);
  assert.match(plan('a', 'Q', 'child').reason, /x-5 is closed/);
  assert.match(plan('a', 'c', 'after').reason, /creation order/, 'next to a closed sibling');
  assert.match(plan('c', 'a', 'before').reason, /creation order/, 'reordering a closed issue');
  assert.deepEqual(plan('c', 'R', 'before'), { ok: true, newParentId: '', afterSiblingId: 'R' }, 'a closed issue can still change parent (lands after the last open root)');
  assert.match(plan('a', 'a', 'child').reason, /somewhere else/);
});
