import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toWidgetContent } from './widgetMapper.js';

test('toWidgetContent JSON-encodes the content object', () => {
  const row = { id: 'w1', type: 'table', title: 'Scores', content: { columns: ['a'], rows: [[1]] } };
  const result = toWidgetContent(row);
  assert.equal(result.widgetId, 'w1');
  assert.equal(result.widgetType, 'table');
  assert.equal(result.title, 'Scores');
  assert.deepEqual(JSON.parse(result.contentJson), row.content);
});

test('toWidgetContent defaults title and content when missing', () => {
  const result = toWidgetContent({ id: 'w2', type: 'richtext', title: null, content: null });
  assert.equal(result.title, '');
  assert.equal(result.contentJson, '{}');
});
