#!/usr/bin/env node
// Copies the solitaire game's own built output into dist/solitaire-vendor/.
// That project (https://github.com/ -- er, ~/GIT/solitaire) is a separate
// repo with its own webpack/babel toolchain, not a widgetgrid workspace --
// this is the vendoring boundary between the two, same idea as
// scripts/vendor-vue.mjs, just pointed at a sibling git repo's dist/
// instead of a node_modules package. Requires that repo's own `npm run
// build` to have already been run (see its README for what dist/
// contains and why).
import { access, cp, mkdir } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dest = path.join(root, 'dist/solitaire-vendor');

// Sibling directory by default (~/GIT/solitaire next to ~/GIT/widgetgrid,
// which is how this machine actually has them laid out) -- override via
// env var for any other layout.
const solitaireRepoDir = process.env.SOLITAIRE_REPO_DIR
  ?? path.resolve(root, '../../../solitaire');
const solitaireDistDir = path.join(solitaireRepoDir, 'dist');
const solitaireCssPath = path.join(solitaireRepoDir, 'solitaire.css');

if (!(await exists(solitaireDistDir))) {
  throw new Error(
    `${solitaireDistDir} not found -- run \`npm run build\` in ${solitaireRepoDir} first `
    + '(or set SOLITAIRE_REPO_DIR if that repo lives somewhere else on this machine).',
  );
}

await mkdir(dest, { recursive: true });
await cp(solitaireDistDir, dest, { recursive: true });
await cp(solitaireCssPath, path.join(dest, 'solitaire.css'));
console.log(`vendored ${solitaireDistDir} (+ solitaire.css) -> ${dest}`);

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}
