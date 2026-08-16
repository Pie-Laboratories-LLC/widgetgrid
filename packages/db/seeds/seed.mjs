#!/usr/bin/env node
// Demo data: a "home" page with a nested row/col tree and 3 widgets across
// the 2 example widget types, plus a "splash" page, so the whole pipeline is
// demoable end to end without an authoring UI. Idempotent -- safe to re-run
// (each page's slug upsert short-circuits if it already exists; a page's
// layout tree is only inserted alongside its own newly-created page, so
// re-running never duplicates it).
import { getPool, closePool } from '../src/pool.js';
import * as pagesRepo from '../src/pagesRepo.js';
import * as widgetsRepo from '../src/widgetsRepo.js';
import * as layoutNodesRepo from '../src/layoutNodesRepo.js';

async function main() {
  const pool = getPool();

  await seedHomePage(pool);
  await seedSplashPage(pool);
}

async function seedHomePage(pool) {
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

// container-fluid p-0: full-bleed, no gutters -- the splash widget defines
// its own min-height/centering/background, so any Bootstrap container
// padding here would just add a stray border around it instead of a true
// edge-to-edge splash.
async function seedSplashPage(pool) {
  const existing = await pagesRepo.findBySlug(pool, 'splash');
  if (existing) {
    console.log(`page "splash" already exists (id=${existing.id}), nothing to seed`);
    return;
  }

  const page = await pagesRepo.upsert(pool, { slug: 'splash', title: 'Pie Laboratories LLC' });

  const splashWidget = await widgetsRepo.insert(pool, {
    type: 'splash',
    title: '',
    content: {},
  });

  const rootId = await layoutNodesRepo.insert(pool, {
    pageId: page.id, nodeType: 'row', bootstrapClasses: 'container-fluid p-0', sortOrder: 0,
  });
  await layoutNodesRepo.insert(pool, {
    pageId: page.id, parentId: rootId, nodeType: 'col', bootstrapClasses: 'col-12',
    sortOrder: 0, widgetId: splashWidget.id,
  });

  console.log(`seeded page "splash" (id=${page.id})`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(closePool);
