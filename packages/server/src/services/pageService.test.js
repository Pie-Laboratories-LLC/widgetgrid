import { test } from 'node:test';
import assert from 'node:assert/strict';
import grpc from '@grpc/grpc-js';
import { createPageService } from './pageService.js';

const fakeRows = [
  { id: 'root', parent_id: null, node_type: 'row', bootstrap_classes: 'container-fluid', sort_order: 0, widget_id: null, widget_type: null },
  { id: 'col-1', parent_id: 'root', node_type: 'col', bootstrap_classes: 'col-12', sort_order: 0, widget_id: 'w-intro', widget_type: 'richtext' },
];

function fakeDeps({ page = { id: 'p1', slug: 'home', title: 'Welcome' }, rows = fakeRows } = {}) {
  return {
    pool: {}, // never touched directly -- passed straight through to the fake repos below
    pagesRepo: { async findBySlug(_pool, slug) { return slug === page.slug ? page : null; } },
    layoutNodesRepo: { async getLayoutRows(_pool, _pageId) { return rows; } },
  };
}

test('GetPageLayout returns the tree + flattened placeholders for a known slug', async () => {
  const service = createPageService(fakeDeps());
  const result = await new Promise((resolve, reject) => {
    service.GetPageLayout({ request: { slug: 'home' } }, (err, response) => (err ? reject(err) : resolve(response)));
  });
  assert.equal(result.pageId, 'p1');
  assert.equal(result.title, 'Welcome');
  assert.equal(result.root.id, 'root');
  assert.deepEqual(result.widgets, [{ widgetId: 'w-intro', widgetType: 'richtext' }]);
});

test('GetPageLayout returns NOT_FOUND for an unknown slug', async () => {
  const service = createPageService(fakeDeps());
  const err = await new Promise((resolve) => {
    service.GetPageLayout({ request: { slug: 'does-not-exist' } }, (err) => resolve(err));
  });
  assert.equal(err.code, grpc.status.NOT_FOUND);
});
