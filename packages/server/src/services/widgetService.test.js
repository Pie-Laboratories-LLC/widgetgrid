import { test } from 'node:test';
import assert from 'node:assert/strict';
import grpc from '@grpc/grpc-js';
import { createWidgetService } from './widgetService.js';

const fakeWidgets = new Map([
  ['w1', { id: 'w1', type: 'richtext', title: 'Intro', content: { html: '<p>hi</p>' } }],
  ['w2', { id: 'w2', type: 'table', title: 'Scores', content: { rows: [] } }],
]);

function fakeDeps() {
  return {
    pool: {},
    widgetsRepo: {
      async findByIds(_pool, ids) {
        return new Map(ids.filter((id) => fakeWidgets.has(id)).map((id) => [id, fakeWidgets.get(id)]));
      },
    },
  };
}

test('GetWidgetContent returns content for known ids and reports missing ones', async () => {
  const service = createWidgetService(fakeDeps());
  const result = await new Promise((resolve, reject) => {
    service.GetWidgetContent({ request: { widgetIds: ['w1', 'w2', 'w-missing'] } }, (err, response) => (err ? reject(err) : resolve(response)));
  });
  assert.equal(result.widgets.length, 2);
  assert.equal(result.widgets[0].widgetId, 'w1');
  assert.deepEqual(result.notFoundWidgetIds, ['w-missing']);
});

test('GetWidgetContent handles an empty id list', async () => {
  const service = createWidgetService(fakeDeps());
  const result = await new Promise((resolve, reject) => {
    service.GetWidgetContent({ request: { widgetIds: [] } }, (err, response) => (err ? reject(err) : resolve(response)));
  });
  assert.deepEqual(result.widgets, []);
  assert.deepEqual(result.notFoundWidgetIds, []);
});

test('SubscribeWidgetUpdates emits UNIMPLEMENTED', () => {
  const service = createWidgetService(fakeDeps());
  const events = [];
  const fakeCall = { emit: (event, payload) => events.push([event, payload]) };
  service.SubscribeWidgetUpdates(fakeCall);
  assert.equal(events.length, 1);
  assert.equal(events[0][0], 'error');
  assert.equal(events[0][1].code, grpc.status.UNIMPLEMENTED);
});
