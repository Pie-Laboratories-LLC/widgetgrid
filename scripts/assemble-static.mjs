#!/usr/bin/env node
// Produces the single dist-static/ tree packages/static-server serves (and
// that Envoy's non-gRPC route ultimately points at). Two things worth
// knowing:
//
// 1. packages/web-app/dist/ is already self-contained (its own predev/
//    prebuild scripts copy the vendored Vue and each widget's dist/*.js
//    into public/ before `vite build`, so they end up under dist/ too) --
//    copying it wholesale here would already work.
// 2. This script re-copies widgets/*/dist/*.js on top anyway, directly from
//    each widget package's own dist/ -- not through web-app at all. That's
//    deliberate: it means a widget can be rebuilt and redeployed (this
//    script re-run) without rebuilding the main SPA, which is the whole
//    point of widgets being independently-built bundles in the first
//    place. Re-running this after only a widget changed keeps dist-static/
//    correct without touching packages/web-app/dist/.
import { access, cp, mkdir, readdir, rm } from 'node:fs/promises';
import path from 'node:path';

const REPO_ROOT = path.resolve(import.meta.dirname, '..');
const WEB_APP_DIST = path.join(REPO_ROOT, 'packages/web-app/dist');
const WIDGETS_ROOT = path.join(REPO_ROOT, 'widgets');
const OUT_DIR = path.join(REPO_ROOT, 'dist-static');

async function main() {
  if (!(await exists(WEB_APP_DIST))) {
    throw new Error(`${WEB_APP_DIST} not found -- run \`npm run build:web\` first.`);
  }

  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });
  await cp(WEB_APP_DIST, OUT_DIR, { recursive: true });

  const widgetsOut = path.join(OUT_DIR, 'widgets');
  await mkdir(widgetsOut, { recursive: true });
  const widgetDirs = await readdir(WIDGETS_ROOT, { withFileTypes: true });
  let widgetsCopied = 0;
  for (const entry of widgetDirs) {
    if (!entry.isDirectory()) continue;
    const distDir = path.join(WIDGETS_ROOT, entry.name, 'dist');
    if (!(await exists(distDir))) {
      console.warn(`skipping ${entry.name}: no dist/ (run \`npm run build:widgets\` first)`);
      continue;
    }
    await cp(distDir, widgetsOut, { recursive: true });
    widgetsCopied += 1;
  }

  console.log(`assembled ${OUT_DIR} (web-app + ${widgetsCopied} widget package(s), freshly re-copied)`);
}

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exitCode = 1;
});
