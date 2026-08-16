// Real grpc-js server + real grpc-js client talking over an actual socket --
// proves the wire plumbing (binding, service registration, request/response
// serialization) works end to end, independent of Postgres (which isn't
// available in this environment -- see the plan's verification section).
// Fake in-memory repos stand in for @widgetgrid/db here; index.js wires the
// real ones. This intentionally bypasses Envoy too (grpc-js talks its
// native protocol directly, no grpc-web framing involved) -- that half of
// the stack needs a real Envoy instance to verify, per the plan.
import assert from 'node:assert/strict';
import grpc from '@grpc/grpc-js';
import { loadProto } from './loadProto.js';
import { createPageService } from './services/pageService.js';
import { createWidgetService } from './services/widgetService.js';

const TEST_PORT = 50151;

const fakePage = { id: 'p1', slug: 'home', title: 'Welcome' };
const fakeRows = [
  { id: 'root', parent_id: null, node_type: 'row', bootstrap_classes: 'container-fluid', sort_order: 0, widget_id: null, widget_type: null },
  { id: 'col-1', parent_id: 'root', node_type: 'col', bootstrap_classes: 'col-12', sort_order: 0, widget_id: 'w1', widget_type: 'richtext' },
];
const fakeWidgets = new Map([
  ['w1', { id: 'w1', type: 'richtext', title: 'Intro', content: { html: '<p>hi</p>' } }],
]);

const pagesRepo = { async findBySlug(_pool, slug) { return slug === fakePage.slug ? fakePage : null; } };
const layoutNodesRepo = { async getLayoutRows(_pool, _pageId) { return fakeRows; } };
const widgetsRepo = {
  async findByIds(_pool, ids) { return new Map(ids.filter((id) => fakeWidgets.has(id)).map((id) => [id, fakeWidgets.get(id)])); },
};

const proto = loadProto();

function startTestServer() {
  const server = new grpc.Server();
  server.addService(proto.PageService.service, createPageService({ pool: null, pagesRepo, layoutNodesRepo }));
  server.addService(proto.WidgetService.service, createWidgetService({ pool: null, widgetsRepo }));
  return new Promise((resolve, reject) => {
    server.bindAsync(`127.0.0.1:${TEST_PORT}`, grpc.ServerCredentials.createInsecure(), (err) => {
      if (err) reject(err); else resolve(server);
    });
  });
}

const server = await startTestServer();
console.log(`test server listening on 127.0.0.1:${TEST_PORT}`);

const pageClient = new proto.PageService(`127.0.0.1:${TEST_PORT}`, grpc.credentials.createInsecure());
const widgetClient = new proto.WidgetService(`127.0.0.1:${TEST_PORT}`, grpc.credentials.createInsecure());

try {
  const layoutResponse = await new Promise((resolve, reject) => {
    pageClient.GetPageLayout({ slug: 'home' }, (err, resp) => (err ? reject(err) : resolve(resp)));
  });
  assert.equal(layoutResponse.pageId, 'p1');
  assert.equal(layoutResponse.root.children.length, 1);
  assert.deepEqual(layoutResponse.widgets, [{ widgetId: 'w1', widgetType: 'richtext' }]);
  console.log('OK: PageService.GetPageLayout over real gRPC wire');

  const contentResponse = await new Promise((resolve, reject) => {
    widgetClient.GetWidgetContent({ widgetIds: ['w1'] }, (err, resp) => (err ? reject(err) : resolve(resp)));
  });
  assert.equal(contentResponse.widgets.length, 1);
  assert.deepEqual(JSON.parse(contentResponse.widgets[0].contentJson), { html: '<p>hi</p>' });
  console.log('OK: WidgetService.GetWidgetContent over real gRPC wire');

  const notFoundErr = await new Promise((resolve) => {
    pageClient.GetPageLayout({ slug: 'nope' }, (err) => resolve(err));
  });
  assert.equal(notFoundErr.code, grpc.status.NOT_FOUND);
  console.log('OK: NOT_FOUND propagates correctly over the wire');
} finally {
  pageClient.close();
  widgetClient.close();
  await new Promise((resolve) => server.tryShutdown(resolve));
}

console.log('e2e client test passed');
