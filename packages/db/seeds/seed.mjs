#!/usr/bin/env node
// Demo data: a "home" page (top bar + main content + right rail) and a
// "splash" page, so the whole pipeline is demoable end to end without an
// authoring UI. Idempotent -- safe to re-run (each page's slug upsert
// short-circuits if it already exists; a page's layout tree is only
// inserted alongside its own newly-created page, so re-running never
// duplicates it) -- EXCEPT "home", which resets itself to this canonical
// layout on every run (see seedHomePage) since there's no authoring UI yet
// for anyone to have made real edits worth preserving.
import { getPool, closePool } from '../src/pool.js';
import * as pagesRepo from '../src/pagesRepo.js';
import * as widgetsRepo from '../src/widgetsRepo.js';
import * as layoutNodesRepo from '../src/layoutNodesRepo.js';

async function main() {
  const pool = getPool();

  await seedHomePage(pool);
  await seedSplashPage(pool);
}

// Resets "home" to this canonical layout every run, rather than skipping
// if it already exists like seedSplashPage does: this replaced an earlier,
// unrelated placeholder layout (intro/scores/sidebar demo content), and
// with no authoring UI yet there's no real edited state to protect against
// clobbering.
async function seedHomePage(pool) {
  const existing = await pagesRepo.findBySlug(pool, 'home');
  if (existing) {
    const oldRows = await layoutNodesRepo.getLayoutRows(pool, existing.id);
    const oldWidgetIds = oldRows.map((r) => r.widget_id).filter(Boolean);
    await pagesRepo.remove(pool, 'home'); // cascades layout_nodes
    await widgetsRepo.remove(pool, oldWidgetIds);
  }

  const page = await pagesRepo.upsert(pool, { slug: 'home', title: 'Pie Laboratories LLC' });

  const topbarWidget = await widgetsRepo.insert(pool, { type: 'topbar', content: {} });
  // 'main', not 'blog': widgets/main is what the page layout actually
  // places here now -- it internally switches between the blog widget and
  // (eventually) solitaire based on which topbar icon was clicked, rather
  // than the layout hardcoding one or the other. See MainWidget.vue.
  const mainWidget = await widgetsRepo.insert(pool, { type: 'main', content: {} });
  const rightrailWidget = await widgetsRepo.insert(pool, {
    type: 'rightrail',
    content: {
      links: {
        youtube: 'https://www.youtube.com/@PieLaboratoriesLLC',
        github: 'https://github.com/Pie-Laboratories-LLC',
        nuget: 'https://www.nuget.org/profiles/PieLaboratoriesLLC',
      },
    },
  });

  const rootId = await layoutNodesRepo.insert(pool, {
    pageId: page.id, nodeType: 'row', bootstrapClasses: 'container-fluid p-0', sortOrder: 0,
  });
  await layoutNodesRepo.insert(pool, {
    pageId: page.id, parentId: rootId, nodeType: 'col', bootstrapClasses: 'col-12',
    sortOrder: 0, widgetId: topbarWidget.id,
  });
  const bodyRowId = await layoutNodesRepo.insert(pool, {
    pageId: page.id, parentId: rootId, nodeType: 'row', bootstrapClasses: 'row g-0', sortOrder: 1,
  });
  // col (no number) flex-grows to fill whatever's left; col-auto shrinks to
  // the rail widget's own intrinsic width -- not a fixed-fraction split,
  // since the rail's width is really owned by RightRailWidget.vue's own
  // CSS (icon size + padding), not by the grid.
  await layoutNodesRepo.insert(pool, {
    pageId: page.id, parentId: bodyRowId, nodeType: 'col', bootstrapClasses: 'col',
    sortOrder: 0, widgetId: mainWidget.id,
  });
  await layoutNodesRepo.insert(pool, {
    pageId: page.id, parentId: bodyRowId, nodeType: 'col', bootstrapClasses: 'col-auto',
    sortOrder: 1, widgetId: rightrailWidget.id,
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
