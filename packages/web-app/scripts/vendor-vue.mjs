#!/usr/bin/env node
// Copies the browser ESM build of the pinned `vue` dependency to
// public/vendor/, where it's served at /vendor/vue.esm-browser.prod.js and
// resolved via the import map in index.html -- the single Vue module
// instance the host app AND every dynamically-loaded widget bundle share.
// Runs as a predev/prebuild hook so it's always in sync with package.json's
// pinned vue version; not committed (see .gitignore).
import { copyFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const src = require.resolve('vue/dist/vue.esm-browser.prod.js');
const destDir = path.resolve(import.meta.dirname, '../public/vendor');
const dest = path.join(destDir, 'vue.esm-browser.prod.js');

await mkdir(destDir, { recursive: true });
await copyFile(src, dest);
console.log(`vendored ${src} -> ${dest}`);
