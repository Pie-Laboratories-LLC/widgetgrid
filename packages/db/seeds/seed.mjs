#!/usr/bin/env node
// Demo data: one "home" page with a nested row/col tree and 3 widgets across
// the 2 example widget types, so the whole pipeline is demoable end to end
// without an authoring UI. Idempotent -- safe to re-run (pages.slug upsert
// short-circuits if "home" already exists; the layout tree is only inserted
// alongside a newly-created page, so re-running never duplicates it).
import { getPool, closePool } from '../src/pool.js';
import * as pagesRepo from '../src/pagesRepo.js';
import * as widgetsRepo from '../src/widgetsRepo.js';
import * as layoutNodesRepo from '../src/layoutNodesRepo.js';

async function main() {
  const pool = getPool();

  const existing = await pagesRepo.findBySlug(pool, 'home');
  if (existing) {
    console.log(`page "home" already exists (id=${existing.id}), nothing to seed`);
    return;
  }

  const page = await pagesRepo.upsert(pool, { slug: 'home', title: 'Welcome' });

  const introWidget = await widgetsRepo.insert(pool, {
    type: 'richtext',
    title: 'Introduction',
    content: { html: '<p>Welcome to WidgetGrid -- this page is entirely database-driven.</p>' },
  });
  const scoresWidget = await widgetsRepo.insert(pool, {
    type: 'table',
    title: 'Scores',
    content: {
      columns: ['Player', 'Score'],
      rows: [['Ada', '42'], ['Grace', '37'], ['Alan', '55']],
    },
  });
  const sidebarWidget = await widgetsRepo.insert(pool, {
    type: 'richtext',
    title: 'Sidebar',
    content: { html: '<p>This sidebar and the table beside it loaded in the same pass-2 batch.</p>' },
  });

  const rootId = await layoutNodesRepo.insert(pool, {
    pageId: page.id, nodeType: 'row', bootstrapClasses: 'container-fluid', sortOrder: 0,
  });
  await layoutNodesRepo.insert(pool, {
    pageId: page.id, parentId: rootId, nodeType: 'col', bootstrapClasses: 'col-12',
    sortOrder: 0, widgetId: introWidget.id,
  });
  const nestedRowId = await layoutNodesRepo.insert(pool, {
    pageId: page.id, parentId: rootId, nodeType: 'row', bootstrapClasses: 'row', sortOrder: 1,
  });
  await layoutNodesRepo.insert(pool, {
    pageId: page.id, parentId: nestedRowId, nodeType: 'col', bootstrapClasses: 'col-md-6',
    sortOrder: 0, widgetId: scoresWidget.id,
  });
  await layoutNodesRepo.insert(pool, {
    pageId: page.id, parentId: nestedRowId, nodeType: 'col', bootstrapClasses: 'col-md-6',
    sortOrder: 1, widgetId: sidebarWidget.id,
  });

  console.log(`seeded page "home" (id=${page.id}) with 3 widgets`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(closePool);
