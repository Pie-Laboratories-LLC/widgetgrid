import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeLayoutResponse, normalizeLayoutNode, normalizeWidgetContentResponse } from './normalize.js';

// Shapes below match protoc-gen-grpc-web's actual generated .toObject()
// output verbatim (confirmed by inspecting packages/proto-gen-web's
// generated page_pb.js/widget_pb.js) -- List-suffixed keys for repeated
// fields is the real quirk being normalized away here, not a guess.

test('normalizeLayoutNode renames childrenList to children, recursively', () => {
  const grpcWebShape = {
    id: 'root', nodeType: 'row', bootstrapClasses: 'container-fluid', sortOrder: 0,
    widgetId: '', widgetType: '',
    childrenList: [
      { id: 'c1', nodeType: 'col', bootstrapClasses: 'col-12', sortOrder: 0, widgetId: 'w1', widgetType: 'richtext', childrenList: [] },
    ],
  };
  const result = normalizeLayoutNode(grpcWebShape);
  assert.equal(result.children.length, 1);
  assert.equal(result.children[0].widgetId, 'w1');
  assert.deepEqual(result.children[0].children, []);
  assert.ok(!('childrenList' in result), 'should not leak the List-suffixed key');
});

test('normalizeLayoutResponse renames widgetsList to widgets and normalizes root', () => {
  const grpcWebShape = {
    pageId: 'p1', title: 'Welcome',
    root: { id: 'root', nodeType: 'row', bootstrapClasses: '', sortOrder: 0, widgetId: '', widgetType: '', childrenList: [] },
    widgetsList: [{ widgetId: 'w1', widgetType: 'richtext' }],
  };
  const result = normalizeLayoutResponse(grpcWebShape);
  assert.deepEqual(result.widgets, [{ widgetId: 'w1', widgetType: 'richtext' }]);
  assert.equal(result.root.id, 'root');
});

test('normalizeWidgetContentResponse renames both List-suffixed fields', () => {
  const grpcWebShape = {
    widgetsList: [{ widgetId: 'w1', widgetType: 'richtext', title: '', contentJson: '{}' }],
    notFoundWidgetIdsList: ['w-missing'],
  };
  const result = normalizeWidgetContentResponse(grpcWebShape);
  assert.equal(result.widgets.length, 1);
  assert.deepEqual(result.notFoundWidgetIds, ['w-missing']);
});
