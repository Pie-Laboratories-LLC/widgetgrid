// Verifies proto-loader resolves both services from our .proto files, and
// exercises the actual wire round-trip (not just object shape) for the
// fields the server will really send, including the content_json passthrough
// (see widget.proto for why this is JSON.stringify/parse rather than
// google.protobuf.Struct -- Struct was tried first and confirmed empirically
// not to round-trip through proto-loader's dynamic serialize/deserialize).
import assert from 'node:assert/strict';
import { loadProto } from './loadProto.js';

const proto = loadProto();

assert.ok(proto.PageService, 'PageService should be defined');
assert.ok(proto.WidgetService, 'WidgetService should be defined');
assert.ok(proto.GetPageLayoutResponse, 'GetPageLayoutResponse message type should be defined');
assert.ok(proto.WidgetContent, 'WidgetContent message type should be defined');
console.log('OK: both services + message types resolved');

const sampleJsContent = {
  columns: ['Player', 'Score'],
  rows: [['Ada', '42'], ['Grace', '37']],
  nested: { ok: true, count: 2 },
};

const sent = {
  widgetId: 'test-id',
  widgetType: 'table',
  title: 'Scores',
  contentJson: JSON.stringify(sampleJsContent),
};

const buf = proto.WidgetContent.serialize(sent);
const received = proto.WidgetContent.deserialize(buf);

assert.equal(received.widgetId, sent.widgetId);
assert.equal(received.widgetType, sent.widgetType);
assert.equal(received.title, sent.title);
assert.deepEqual(JSON.parse(received.contentJson), sampleJsContent);
console.log('OK: WidgetContent round-trips through serialize/deserialize, including content_json');

// Also exercise the recursive LayoutNode shape pass-1 depends on.
const layoutNode = {
  id: 'root',
  nodeType: 'row',
  bootstrapClasses: 'container-fluid',
  sortOrder: 0,
  children: [
    { id: 'child-1', nodeType: 'col', bootstrapClasses: 'col-12', sortOrder: 0, widgetId: 'w1', widgetType: 'richtext', children: [] },
  ],
  widgetId: '',
  widgetType: '',
};
const layoutBuf = proto.GetPageLayoutResponse.serialize({
  pageId: 'p1', title: 'Welcome', root: layoutNode, widgets: [{ widgetId: 'w1', widgetType: 'richtext' }],
});
const layoutBack = proto.GetPageLayoutResponse.deserialize(layoutBuf);
assert.equal(layoutBack.root.children.length, 1);
assert.equal(layoutBack.root.children[0].widgetId, 'w1');
assert.equal(layoutBack.widgets[0].widgetType, 'richtext');
console.log('OK: recursive LayoutNode round-trips through serialize/deserialize');
