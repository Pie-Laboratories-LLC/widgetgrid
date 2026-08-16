#!/usr/bin/env node
// Copies src/assets/* into dist/topbar-assets/ verbatim -- see
// widgets/splash/scripts/copy-assets.mjs (this is the same pattern) and
// vite.config.js's comment for why.
import { cp, mkdir } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const src = path.join(root, 'src/assets');
const dest = path.join(root, 'dist/topbar-assets');

await mkdir(dest, { recursive: true });
await cp(src, dest, { recursive: true });
console.log(`copied ${src} -> ${dest}`);
