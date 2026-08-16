#!/usr/bin/env node
// Copies src/assets/* into dist/splash-assets/ verbatim (unprocessed, not
// run through Vite's asset pipeline -- see SplashWidget.vue's <script>
// comment for why). Runs before `vite build --watch` (predev) and after
// `vite build` (postbuild) so dist/ has real image files either way.
import { cp, mkdir } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const src = path.join(root, 'src/assets');
const dest = path.join(root, 'dist/splash-assets');

await mkdir(dest, { recursive: true });
await cp(src, dest, { recursive: true });
console.log(`copied ${src} -> ${dest}`);
