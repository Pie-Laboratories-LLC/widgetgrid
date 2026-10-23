#!/usr/bin/env node
// Copies The Last Naming's own build output into
// dist/the-last-naming-vendor/. The game (~/GIT/the-last-naming, private)
// is a separate repo with its own npm workspaces and Vite build, not a
// widgetgrid workspace -- same vendoring boundary as
// widgets/embuscade/scripts/vendor-embuscade.mjs. Its packages/client
// `npm run build` must already have been run: that produces
// dist/the-last-naming.js (ES module exporting mount()),
// dist/the-last-naming.css and dist/assets/ (the packed glTF, which the
// bundle loads from beside itself -- so they must travel together).
import { access, cp, mkdir } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dest = path.join(root, 'dist/the-last-naming-vendor');

// Sibling of ~/GIT/widgetgrid by default -- override via env var for any
// other layout (packages/static-server/Dockerfile points it at a staged
// copy).
const repoDir = process.env.LASTNAMING_REPO_DIR
  ?? path.resolve(root, '../../../the-last-naming');
const clientDistDir = path.join(repoDir, 'packages/client/dist');

if (!(await exists(path.join(clientDistDir, 'the-last-naming.js')))) {
  throw new Error(
    `${clientDistDir}/the-last-naming.js not found -- run \`npm run build\` in ${repoDir} first `
    + '(or set LASTNAMING_REPO_DIR if that repo lives somewhere else on this machine).',
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
