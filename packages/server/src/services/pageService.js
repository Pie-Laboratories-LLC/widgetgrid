import grpc from '@grpc/grpc-js';
import * as layoutTreeMapper from '../mappers/layoutTreeMapper.js';

// Dependency-injected so this can be unit/e2e tested with fake repos and a
// fake pool, without a real Postgres instance -- see pageService.test.js and
// e2eClientTest.js. index.js wires the real @widgetgrid/db repos + pool.
export function createPageService({ pool, pagesRepo, layoutNodesRepo }) {
  return {
    async GetPageLayout(call, callback) {
      try {
        const page = await pagesRepo.findBySlug(pool, call.request.slug);
        if (!page) {
          callback({ code: grpc.status.NOT_FOUND, message: `page not found: ${call.request.slug}` });
          return;
        }
        const rows = await layoutNodesRepo.getLayoutRows(pool, page.id);
        callback(null, {
          pageId: page.id,
          title: page.title,
          root: layoutTreeMapper.buildTree(rows),
          widgets: layoutTreeMapper.derivePlaceholders(rows),
        });
      } catch (err) {
        callback({ code: grpc.status.INTERNAL, message: err.message });
      }
    },
  };
}
