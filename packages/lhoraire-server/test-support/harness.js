// Test database + helpers for lhoraire-server's integration tests. The
// rules are mostly database rules (constraints, cascades, transactions), so
// tests run the real handlers against a real Postgres: a dedicated
// widgetgrid_test database on the local docker-compose server (override
// with LHORAIRE_TEST_DATABASE_URL), created and migrated on first use and
// emptied before each test.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import pg from 'pg';
import { runner } from 'node-pg-migrate';
import { GROUP_ADMINS, GROUP_USERS } from '@widgetgrid/auth-node';
import { createHandlers } from '../src/grpc.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.resolve(__dirname, '../../db/migrations');

function testDatabaseUrl() {
  if (process.env.LHORAIRE_TEST_DATABASE_URL) return process.env.LHORAIRE_TEST_DATABASE_URL;
  const env = readFileSync(path.resolve(__dirname, '../../../.env'), 'utf8');
  const base = env.match(/^DATABASE_URL=(.+)$/m)?.[1]?.trim();
  if (!base) throw new Error('No DATABASE_URL in .env and no LHORAIRE_TEST_DATABASE_URL');
  const url = new URL(base);
  url.pathname = '/widgetgrid_test';
  return url.toString();
}

let poolPromise;

export function getTestPool() {
  poolPromise ??= (async () => {
    const url = testDatabaseUrl();
    const admin = new pg.Client({ connectionString: url.replace(/\/widgetgrid_test(\?|$)/, '/postgres$1') });
    await admin.connect();
    const exists = await admin.query("SELECT 1 FROM pg_database WHERE datname = 'widgetgrid_test'");
    if (!exists.rows[0]) await admin.query('CREATE DATABASE widgetgrid_test');
    await admin.end();
    await runner({ databaseUrl: url, dir: MIGRATIONS_DIR, direction: 'up', migrationsTable: 'pgmigrations', log: () => {} });
    return new pg.Pool({ connectionString: url, max: 5 });
  })();
  return poolPromise;
}

export const USERS = {
  owner: { userId: '00000000-0000-4000-8000-000000000001', email: 'owner@example.com', role: 'owner', groups: [GROUP_USERS, GROUP_ADMINS] },
  admin2: { userId: '00000000-0000-4000-8000-000000000002', email: 'admin2@example.com', role: 'member', groups: [GROUP_USERS, GROUP_ADMINS] },
  member: { userId: '00000000-0000-4000-8000-000000000003', email: 'member@example.com', role: 'member', groups: [GROUP_USERS] },
};

// Empties everything and recreates the test users.
export async function resetData(pool) {
  await pool.query(`TRUNCATE lhoraire.projects, lhoraire.issue_types, lhoraire.changes, public.users CASCADE`);
  for (const [name, u] of Object.entries(USERS)) {
    await pool.query(
      'INSERT INTO public.users (id, cognito_sub, email, role) VALUES ($1, $2, $3, $4)',
      [u.userId, `sub-${name}`, u.email, u.role],
    );
  }
}

// Auth context that trusts a "test-user" metadata header instead of a JWT.
export const testAuthContext = {
  async getCaller(call) {
    const name = call.metadata.get('test-user')[0];
    return name ? { ...USERS[name], sub: `sub-${name}` } : null;
  },
};

// Inserts an issue directly (the issue API arrives in a later slice; type
// and workflow tests only need issues to exist). Returns its id.
let nextNumber = 1;
export async function insertIssue(pool, { projectId, typeId, stateId, parentId = null, summary = 'An issue', user = 'owner' }) {
  const { rows } = await pool.query(
    `INSERT INTO lhoraire.issues (project_id, number, parent_id, sibling_rank, issue_type_id, state_id, summary, created_by, modified_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8) RETURNING id`,
    [projectId, nextNumber, parentId, `a${nextNumber}`, typeId, stateId, summary, USERS[user].userId],
  );
  nextNumber += 1;
  return rows[0].id;
}

// { from: to } -> the StateMapping list requests carry.
export const mappings = (obj) => Object.entries(obj).map(([fromStateId, toStateId]) => ({ fromStateId, toStateId }));

// Calls a unary handler the way grpc-js would. Resolves with the response,
// rejects with { code, message }.
export function invoke(rawHandlers, method, request, user = 'owner') {
  const handlers = createHandlers(testAuthContext, rawHandlers);
  const call = { request, metadata: { get: (k) => (k === 'test-user' && user ? [user] : []) } };
  return new Promise((resolve, reject) => {
    handlers[method](call, (err, response) => (err ? reject(err) : resolve(response)));
  });
}
