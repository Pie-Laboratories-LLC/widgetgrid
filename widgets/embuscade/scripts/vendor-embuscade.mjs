#!/usr/bin/env node
// Copies the Embuscade game client's own build output into
// dist/embuscade-vendor/. That game (~/GIT/bolo-server, the "lobo" repo) is
// a separate repo with its own npm workspaces and Vite build, not a
// widgetgrid workspace -- same vendoring boundary as
// widgets/solitaire/scripts/vendor-solitaire.mjs. Its packages/client
// `npm run build` must already have been run: that produces
// dist/embuscade.js (ES module exporting mount(), with the game's shared
// code already bundled in) and dist/embuscade.css.
import { access, cp, mkdir } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dest = path.join(root, 'dist/embuscade-vendor');

// Sibling of ~/GIT/widgetgrid by default -- override via env var for any
// other layout.
const repoDir = process.env.EMBUSCADE_REPO_DIR
  ?? path.resolve(root, '../../../bolo-server');
const clientDistDir = path.join(repoDir, 'packages/client/dist');

if (!(await exists(path.join(clientDistDir, 'embuscade.js')))) {
  throw new Error(
    `${clientDistDir}/embuscade.js not found -- run \`npm run build\` in ${repoDir}/packages/client first `
    + '(or set EMBUSCADE_REPO_DIR if that repo lives somewhere else on this machine).',
  );
}

await mkdir(dest, { recursive: true });
await cp(clientDistDir, dest, { recursive: true });
console.log(`vendored ${clientDistDir} -> ${dest}`);

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}
