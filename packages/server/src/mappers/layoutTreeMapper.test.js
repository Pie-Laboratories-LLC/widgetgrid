import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildTree, derivePlaceholders } from './layoutTreeMapper.js';

const sampleRows = [
  { id: 'root', parent_id: null, node_type: 'row', bootstrap_classes: 'container-fluid', sort_order: 0, widget_id: null, widget_type: null },
  { id: 'col-1', parent_id: 'root', node_type: 'col', bootstrap_classes: 'col-12', sort_order: 0, widget_id: 'w-intro', widget_type: 'richtext' },
  { id: 'nested-row', parent_id: 'root', node_type: 'row', bootstrap_classes: 'row', sort_order: 1, widget_id: null, widget_type: null },
  { id: 'col-2', parent_id: 'nested-row', node_type: 'col', bootstrap_classes: 'col-md-6', sort_order: 0, widget_id: 'w-scores', widget_type: 'table' },
  { id: 'col-3', parent_id: 'nested-row', node_type: 'col', bootstrap_classes: 'col-md-6', sort_order: 1, widget_id: 'w-sidebar', widget_type: 'richtext' },
];

test('buildTree assembles a nested tree from flat rows', () => {
  const tree = buildTree(sampleRows);
  assert.equal(tree.id, 'root');
  assert.equal(tree.children.length, 2);
  assert.equal(tree.children[0].widgetId, 'w-intro');
  assert.equal(tree.children[1].id, 'nested-row');
  assert.equal(tree.children[1].children.length, 2);
  assert.equal(tree.children[1].children[0].widgetId, 'w-scores');
  assert.equal(tree.children[1].children[1].widgetType, 'richtext');
});

test('buildTree throws on zero or multiple roots', () => {
  assert.throws(() => buildTree([]));
  assert.throws(() => buildTree([
    { id: 'a', parent_id: null, node_type: 'row', bootstrap_classes: '', sort_order: 0, widget_id: null, widget_type: null },
    { id: 'b', parent_id: null, node_type: 'row', bootstrap_classes: '', sort_order: 1, widget_id: null, widget_type: null },
  ]));
});

test('derivePlaceholders returns only widget-bearing nodes, from the same row set', () => {
  const placeholders = derivePlaceholders(sampleRows);
  assert.deepEqual(placeholders, [
    { widgetId: 'w-intro', widgetType: 'richtext' },
    { widgetId: 'w-scores', widgetType: 'table' },
    { widgetId: 'w-sidebar', widgetType: 'richtext' },
  ]);
});
