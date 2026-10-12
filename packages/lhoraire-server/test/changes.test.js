import { test, before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import pg from 'pg';
import grpc from '@grpc/grpc-js';
import { getTestPool, resetData, testAuthContext, USERS } from '../test-support/harness.js';
import { mappings } from '../test-support/harness.js';
import { createHandlers } from '../src/grpc.js';
import { createProjectHandlers } from '../src/services/projectService.js';
import { createIssueTypeHandlers } from '../src/services/issueTypeService.js';
import { createIssueHandlers } from '../src/services/issueService.js';
import { createActivityHandlers } from '../src/services/activityService.js';
import { createChangeHandlers, pruneChanges } from '../src/services/changeService.js';
import { createChangeHub } from '../src/changeHub.js';
import { invoke } from '../test-support/harness.js';

let pool;
let hub;
let raw;
before(async () => {
  pool = await getTestPool();
  hub = createChangeHub({ connect: () => new pg.Client({ connectionString: pool.options.connectionString }), reconnectDelayMs: 50, log: { error: () => {} } });
  await hub.start();
  raw = {
    projects: createProjectHandlers({ pool }),
    types: createIssueTypeHandlers({ pool }),
    issues: { ...createIssueHandlers({ pool }), ...createActivityHandlers({ pool }) },
    changes: createChangeHandlers({ pool, hub, heartbeatMs: 100 }),
  };
});
beforeEach(() => resetData(pool));
after(async () => {
  await hub.stop();
  await pool.end();
});

// A server-streaming call as grpc-js would hand it to the handler.
function openStream(method, request, user = 'owner') {
  const call = new EventEmitter();
  call.request = request;
  call.metadata = { get: (k) => (k === 'test-user' && user ? [user] : []) };
  call.events = [];
  call.write = (e) => call.events.push(e);
  call.done = createHandlers(testAuthContext, raw.changes)[method](call);
  call.end = () => call.emit('cancelled');
  call.kinds = () => call.events.filter((e) => e.kind !== 'heartbeat').map((e) => e.kind);
  return call;
}

async function until(fn, what) {
  for (let i = 0; i < 100; i += 1) {
    if (fn()) return;
    await new Promise((r) => setTimeout(r, 20));
  }
  assert.fail(`timed out waiting for ${what}`);
}

async function setup() {
  const p = (await invoke(raw.projects, 'CreateProject', { key: 'ffdb', name: 'ffdb', color: '' })).project;
  const { issueType } = await invoke(raw.types, 'CreateIssueType', { projectId: '', name: 'Bug', icon: '', color: '', copyWorkflowFromTypeId: '' });
  const create = async (req = {}) => (await invoke(raw.issues, 'CreateIssue', {
    projectId: p.id, parentId: '', issueTypeId: issueType.id, summary: 'x', description: '', severity: '', assigneeId: USERS.owner.userId, ...req,
  })).issue;
  return { p, issueType, create };
}

test('a project stream says hello, then pushes that project\'s changes as they commit', async () => {
  const { p, create } = await setup();
  const other = (await invoke(raw.projects, 'CreateProject', { key: 'abc', name: 'abc', color: '' })).project;
  const s = openStream('SubscribeProject', { projectId: p.id, afterSeq: 0 });
  await s.done;
  assert.equal(s.events[0].kind, 'hello');
  assert.ok(s.events[0].seq > 0);

  const issue = await create();
  await invoke(raw.projects, 'UpdateProject', { id: other.id, name: 'not mine', color: '' });
  await invoke(raw.types, 'CreateIssueType', { projectId: '', name: 'Global change', icon: '', color: '', copyWorkflowFromTypeId: '' });
  await until(() => s.kinds().length >= 3, 'two changes');
  assert.deepEqual(s.kinds(), ['hello', 'issue_created', 'issue_type_changed'], 'other projects\' changes are filtered out');
  assert.equal(s.events.find((e) => e.kind === 'issue_created').issueId, issue.id);
  s.end();
});

test('reconnecting with after_seq replays exactly what was missed', async () => {
  const { p, create } = await setup();
  const first = openStream('SubscribeProject', { projectId: p.id, afterSeq: 0 });
  await first.done;
  const seen = first.events[0].seq;
  first.end();

  const a = await create();
  await invoke(raw.issues, 'UpdateIssue', { id: a.id, version: 1, summary: 'edited', stateIdInNewType: '' });

  const again = openStream('SubscribeProject', { projectId: p.id, afterSeq: seen });
  await again.done;
  assert.deepEqual(again.kinds(), ['hello', 'issue_created', 'issue_updated']);
  const seqs = again.events.slice(1).map((e) => e.seq);
  assert.ok(seqs[0] > seen && seqs[1] > seqs[0], 'in order, after what was seen');

  await create();
  await until(() => again.kinds().length === 4, 'the next live change');
  again.end();
});

test('a replay window that is gone, or a seq from elsewhere, asks for a resync', async () => {
  const { p, create } = await setup();
  await create();
  await pool.query("UPDATE lhoraire.changes SET at = now() - interval '30 days'");
  await create();
  await pruneChanges(pool);
  const stale = openStream('SubscribeProject', { projectId: p.id, afterSeq: 1 });
  await stale.done;
  assert.deepEqual(stale.kinds(), ['hello', 'resync_required']);
  stale.end();

  const future = openStream('SubscribeProject', { projectId: p.id, afterSeq: 10_000_000 });
  await future.done;
  assert.deepEqual(future.kinds(), ['hello', 'resync_required']);
  future.end();
});

test('an issue stream gets that issue\'s changes, both ends of links, and bulk changes', async () => {
  const { p, create, issueType } = await setup();
  const mine = await create();
  const other = await create();
  const s = openStream('SubscribeIssue', { issueId: mine.id, afterSeq: 0 });
  await s.done;

  await invoke(raw.issues, 'UpdateIssue', { id: other.id, version: 1, summary: 'not mine', stateIdInNewType: '' });
  await invoke(raw.issues, 'AddComment', { issueId: mine.id, body: 'hello' });
  await invoke(raw.issues, 'AddLink', { issueId: other.id, kind: 'depends_on', otherIssueId: mine.id, otherIssueKey: '' });
  await invoke(raw.types, 'UpdateWorkflow', {
    issueTypeId: issueType.id,
    states: (await invoke(raw.types, 'GetIssueType', { id: issueType.id })).workflow.states.map((st) => ({ id: st.id, name: st.name, isInitial: st.isInitial, isTerminal: st.isTerminal })),
    transitions: [],
    stateMappings: mappings({}),
  });
  await until(() => s.kinds().length >= 4, 'three changes');
  assert.deepEqual(s.kinds(), ['hello', 'comments_changed', 'links_changed', 'workflow_changed']);
  assert.ok(p.id);
  s.end();
});

test('streams keep idle connections alive and stop when the client goes', async () => {
  const { p } = await setup();
  const s = openStream('SubscribeProject', { projectId: p.id, afterSeq: 0 });
  await s.done;
  await until(() => s.events.some((e) => e.kind === 'heartbeat'), 'a heartbeat');
  s.end();
  const count = s.events.length;
  await new Promise((r) => setTimeout(r, 250));
  assert.equal(s.events.length, count, 'nothing written after cancel');
});

test('if the listener connection drops, open streams are told to resync and changes resume', async () => {
  const { p, create } = await setup();
  const s = openStream('SubscribeProject', { projectId: p.id, afterSeq: 0 });
  await s.done;
  const killed = await pool.query("SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE query = 'LISTEN lhoraire_changes' AND datname = current_database()");
  assert.equal(killed.rowCount, 1, 'found the listener connection');
  await until(() => s.kinds().includes('resync_required'), 'a resync after reconnecting');
  await create();
  await until(() => s.kinds().includes('issue_created'), 'live changes again');
  s.end();
});

test('streams need the admin group, and an existing project', async () => {
  const { p } = await setup();
  const denied = openStream('SubscribeProject', { projectId: p.id, afterSeq: 0 }, 'member');
  const errors = [];
  denied.on('error', (e) => errors.push(e));
  await denied.done;
  assert.equal(errors[0].code, grpc.status.PERMISSION_DENIED);
  assert.equal(denied.events.length, 0);

  const missing = openStream('SubscribeProject', { projectId: '00000000-0000-4000-8000-0000000000ff', afterSeq: 0 });
  const missingErrors = [];
  missing.on('error', (e) => missingErrors.push(e));
  await missing.done;
  assert.equal(missingErrors[0].code, grpc.status.NOT_FOUND);
});
