import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadDotenv } from 'dotenv';
import pg from 'pg';

const { Pool } = pg;

// Every consumer of getPool() (packages/server, packages/db/seeds/seed.mjs,
// node-pg-migrate via its own --envPath flag) needs DATABASE_URL, so it's
// loaded once here rather than duplicated at each entry point. Resolved by
// file location, not cwd, since callers invoke this from different working
// directories (a workspace-scoped npm script vs. a root-level one). Silently
// does nothing if the file doesn't exist and never overwrites an
// already-set var -- both correct for containers/k8s, where env comes from
// the orchestrator and there is no .env file at all.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
loadDotenv({ path: path.resolve(__dirname, '../../../.env'), quiet: true });

let pool;

// Lazily created and shared: the server process only ever needs one pool,
// and creating it at import time would fail fast (and confusingly) before
// DATABASE_URL is even loaded, e.g. under `node --test`.
export function getPool() {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

export async function closePool() {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}
