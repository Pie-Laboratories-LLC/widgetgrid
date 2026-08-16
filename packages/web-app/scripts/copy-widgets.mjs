#!/usr/bin/env node
// Copies each widgets/*/dist/*.js into public/widgets/, so
// import(`/widgets/${type}.js`) (widgetLoader.js) resolves identically in
// `vite dev` and in the assembled production static tree
// (scripts/assemble-static.mjs does the equivalent copy for prod). Requires
// each widget package to have already been built (`npm run build:widgets`
// at the repo root) -- this only copies existing dist/ output, it doesn't
// trigger a build itself.
import { cp, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';

const widgetsRoot = path.resolve(import.meta.dirname, '../../../widgets');
const destDir = path.resolve(import.meta.dirname, '../public/widgets');

await mkdir(destDir, { recursive: true });

const widgetDirs = await readdir(widgetsRoot, { withFileTypes: true });
let copied = 0;
for (const entry of widgetDirs) {
  if (!entry.isDirectory()) continue;
  const distDir = path.join(widgetsRoot, entry.name, 'dist');
  try {
    await cp(distDir, destDir, { recursive: true });
    copied += 1;
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
    console.warn(`skipping ${entry.name}: no dist/ yet (run its build first)`);
  }
}
console.log(`copied dist/ output from ${copied} widget package(s) into ${destDir}`);
