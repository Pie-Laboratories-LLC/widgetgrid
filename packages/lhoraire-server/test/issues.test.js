import { test, before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import grpc from '@grpc/grpc-js';
import { getTestPool, resetData, invoke, USERS } from '../test-support/harness.js';
import { createProjectHandlers } from '../src/services/projectService.js';
import { createIssueTypeHandlers } from '../src/services/issueTypeService.js';
import { createIssueHandlers } from '../src/services/issueService.js';

let pool;
let projects;
let types;
let issues;
before(async () => {
  pool = await getTestPool();
  projects = createProjectHandlers({ pool });
  types = createIssueTypeHandlers({ pool });
  issues = createIssueHandlers({ pool });
});
beforeEach(() => resetData(pool));
after(() => pool.end());

const INVALID = { code: grpc.status.INVALID_ARGUMENT };
const FAILED = { code: grpc.status.FAILED_PRECONDITION };

const project = async (key) => (await invoke(projects, 'CreateProject', { key, name: key, color: '' })).project;
const newType = async (name, projectId = '') =>
  invoke(types, 'CreateIssueType', { projectId, name, icon: '', color: '', copyWorkflowFromTypeId: '' });
const stateId = (workflow, name) => workflow.states.find((s) => s.name === name).id;

async function setup() {
  const p = await project('ffdb');
  const task = await newType('Bug');
  const create = async (req = {}) => (await invoke(issues, 'CreateIssue', {
    projectId: p.id, parentId: '', issueTypeId: task.issueType.id, summary: 'Something', description: '', severity: '', assigneeId: '', ...req,
  })).issue;
  return { p, task, create };
}

// Closes an issue directly (transitions arrive in slice 4).
async function close(issue, workflow) {
  await pool.query(
    "UPDATE lhoraire.issues SET state_id = $2, assignee_id = $3, end_reason = 'completed', end_description = 'done', version = version + 1 WHERE id = $1",
    [issue.id, stateId(workflow, 'Closed'), USERS.owner.userId],
  );
}

const children = async (projectId, parentId) => (await invoke(issues, 'ListIssues', { projectId })).issues
  .filter((i) => i.parentId === (parentId ?? ''))
  .sort((a, b) => (a.siblingRank < b.siblingRank ? -1 : 1))
  .map((i) => i.key);

test('issues get sequential keys per project and start in the initial state', async () => {
  const { p, task, create } = await setup();
  const a = await create();
  const b = await create();
  const other = await project('abc');
  const c = (await invoke(issues, 'CreateIssue', {
    projectId: other.id, parentId: '', issueTypeId: task.issueType.id, summary: 'x', description: '', severity: '', assigneeId: '',
  })).issue;
  assert.deepEqual([a.key, b.key, c.key], ['ffdb-1', 'ffdb-2', 'abc-1']);
  assert.equal(a.stateId, stateId(task.workflow, 'New'));
  assert.equal(a.severity, 'normal');
  assert.equal(a.version, 1);
  assert.equal(a.projectId, p.id);
  const history = await pool.query('SELECT kind FROM lhoraire.issue_events WHERE issue_id = $1', [a.id]);
  assert.deepEqual(history.rows, [{ kind: 'created' }]);
});

test('concurrent creates never share or skip a number', async () => {
  const { create } = await setup();
  const made = await Promise.all(Array.from({ length: 20 }, () => create()));
  assert.deepEqual(made.map((i) => i.number).sort((x, y) => x - y), Array.from({ length: 20 }, (_, i) => i + 1));
});

test('create validates its fields', async () => {
  const { create } = await setup();
  await assert.rejects(create({ summary: '  ' }), INVALID);
  await assert.rejects(create({ summary: 'x'.repeat(257) }), INVALID);
  await create({ summary: 'x'.repeat(256) });
  await assert.rejects(create({ severity: 'meh' }), INVALID);
  await assert.rejects(create({ assigneeId: '00000000-0000-4000-8000-0000000000ff' }), INVALID);
  const elsewhere = await project('abc');
  const foreign = await newType('Only there', elsewhere.id);
  await assert.rejects(create({ issueTypeId: foreign.issueType.id }), INVALID, 'type from another project');
});

test('children nest without limit, but never under a closed parent', async () => {
  const { task, create } = await setup();
  let parent = await create();
  for (let depth = 0; depth < 6; depth += 1) parent = await create({ parentId: parent.id });
  assert.equal(parent.key, 'ffdb-7');
  const closed = await create();
  await close(closed, task.workflow);
  await assert.rejects(create({ parentId: closed.id }), FAILED);
});

test('siblings keep creation order and can be reordered and re-parented', async () => {
  const { p, task, create } = await setup();
  const parent = await create();
  const a = await create({ parentId: parent.id });
  const b = await create({ parentId: parent.id });
  const c = await create({ parentId: parent.id });
  assert.deepEqual(await children(p.id, parent.id), ['ffdb-2', 'ffdb-3', 'ffdb-4']);

  await invoke(issues, 'MoveIssue', { id: c.id, newParentId: parent.id, afterSiblingId: '' });
  assert.deepEqual(await children(p.id, parent.id), ['ffdb-4', 'ffdb-2', 'ffdb-3'], 'moved to first');
  await invoke(issues, 'MoveIssue', { id: c.id, newParentId: parent.id, afterSiblingId: a.id });
  assert.deepEqual(await children(p.id, parent.id), ['ffdb-2', 'ffdb-4', 'ffdb-3'], 'placed after a');

  await invoke(issues, 'MoveIssue', { id: b.id, newParentId: '', afterSiblingId: parent.id });
  assert.deepEqual(await children(p.id, null), ['ffdb-1', 'ffdb-3'], 'now a root, after the old parent');
  const history = await pool.query("SELECT old_value, new_value FROM lhoraire.issue_events WHERE issue_id = $1 AND field = 'parent'", [b.id]);
  assert.deepEqual(history.rows[0], { old_value: 'ffdb-1', new_value: null });

  await assert.rejects(invoke(issues, 'MoveIssue', { id: parent.id, newParentId: a.id, afterSiblingId: '' }), INVALID, 'under its own child');
  await assert.rejects(invoke(issues, 'MoveIssue', { id: a.id, newParentId: a.id, afterSiblingId: '' }), INVALID, 'its own parent');
  const closed = await create();
  await close(closed, task.workflow);
  await assert.rejects(invoke(issues, 'MoveIssue', { id: a.id, newParentId: closed.id, afterSiblingId: '' }), FAILED, 'under a closed issue');
});

test('updates change only what is sent, record history, and reject stale versions', async () => {
  const { create } = await setup();
  const issue = await create({ summary: 'Before' });
  const update = (req) => invoke(issues, 'UpdateIssue', { id: issue.id, stateIdInNewType: '', ...req });

  const { issue: v2 } = await update({ version: 1, summary: 'After', severity: 'blocker', assigneeId: USERS.admin2.userId });
  assert.equal(v2.summary, 'After');
  assert.equal(v2.severity, 'blocker');
  assert.equal(v2.assigneeId, USERS.admin2.userId);
  assert.equal(v2.description, '', 'untouched');
  assert.equal(v2.version, 2);
  assert.equal(v2.modifiedBy, USERS.owner.userId);

  await assert.rejects(update({ version: 1, summary: 'Lost update' }), { code: grpc.status.ABORTED });

  const same = await update({ version: 2, summary: 'After' });
  assert.equal(same.issue.version, 2, 'a no-op write does not bump the version');

  const { issue: v3 } = await update({ version: 2, assigneeId: '' });
  assert.equal(v3.assigneeId, '', 'empty assignee unassigns');

  const history = await pool.query("SELECT field, old_value, new_value FROM lhoraire.issue_events WHERE issue_id = $1 AND kind = 'field' ORDER BY id", [issue.id]);
  assert.deepEqual(history.rows, [
    { field: 'summary', old_value: 'Before', new_value: 'After' },
    { field: 'severity', old_value: 'normal', new_value: 'blocker' },
    { field: 'assignee', old_value: null, new_value: 'admin2@example.com' },
    { field: 'assignee', old_value: 'admin2@example.com', new_value: null },
  ]);
});

test('a closed issue can be edited but not unassigned', async () => {
  const { task, create } = await setup();
  const issue = await create();
  await close(issue, task.workflow);
  await invoke(issues, 'UpdateIssue', { id: issue.id, version: 2, summary: 'Renamed after closing', stateIdInNewType: '' });
  await assert.rejects(invoke(issues, 'UpdateIssue', { id: issue.id, version: 3, assigneeId: '', stateIdInNewType: '' }), FAILED);
});

test('changing type moves the issue to a state of the new type, keeping open/closed', async () => {
  const { task, create } = await setup();
  const story = await newType('Story');
  const issue = await create();
  const update = (req) => invoke(issues, 'UpdateIssue', { id: issue.id, version: 1, issueTypeId: story.issueType.id, ...req });
  await assert.rejects(update({ stateIdInNewType: '' }), INVALID, 'no state chosen');
  await assert.rejects(update({ stateIdInNewType: stateId(task.workflow, 'Paused') }), INVALID, 'state of the old type');
  await assert.rejects(update({ stateIdInNewType: stateId(story.workflow, 'Closed') }), INVALID, 'open issue into a terminal state');
  const { issue: moved } = await update({ stateIdInNewType: stateId(story.workflow, 'Paused') });
  assert.equal(moved.issueTypeId, story.issueType.id);
  assert.equal(moved.stateId, stateId(story.workflow, 'Paused'));
});

test('issues are found by id, by key, and by old keys after a move', async () => {
  const { create } = await setup();
  const issue = await create({ description: 'Long text' });
  assert.equal((await invoke(issues, 'GetIssue', { id: issue.id, key: '' })).issue.description, 'Long text');
  assert.equal((await invoke(issues, 'GetIssue', { id: '', key: 'FFDB-1' })).issue.id, issue.id);
  await assert.rejects(invoke(issues, 'GetIssue', { id: '', key: 'not a key' }), INVALID);
  await assert.rejects(invoke(issues, 'GetIssue', { id: '', key: 'ffdb-99' }), { code: grpc.status.NOT_FOUND });

  const other = await project('abc');
  await invoke(issues, 'MoveIssuesToProject', { issueIds: [issue.id], targetProjectId: other.id });
  const viaOldKey = (await invoke(issues, 'GetIssue', { id: '', key: 'ffdb-1' })).issue;
  assert.equal(viaOldKey.key, 'abc-1');
});

test('deleting takes whole subtrees and counts each issue once', async () => {
  const { p, create } = await setup();
  const parent = await create();
  const child = await create({ parentId: parent.id });
  await create({ parentId: child.id });
  const keep = await create();
  const { deleted } = await invoke(issues, 'DeleteIssues', { issueIds: [parent.id, child.id] });
  assert.equal(deleted, 3);
  assert.deepEqual(await children(p.id, null), [keep.key]);
});

test('moving to another project: subtrees, new keys, aliases, numbering', async () => {
  const { p, create } = await setup();
  const other = await project('abc');
  const existing = (await invoke(issues, 'CreateIssue', {
    projectId: other.id, parentId: '', issueTypeId: (await newType('Story')).issueType.id, summary: 'already here', description: '', severity: '', assigneeId: '',
  })).issue;
  const root = await create();
  const child = await create({ parentId: root.id });
  const grandchild = await create({ parentId: child.id });
  const stays = await create();

  const { newKeys } = await invoke(issues, 'MoveIssuesToProject', { issueIds: [child.id, root.id], targetProjectId: other.id });
  assert.deepEqual(newKeys, { 'ffdb-1': 'abc-2', 'ffdb-2': 'abc-3', 'ffdb-3': 'abc-4' }, 'child selected too: moved once');
  assert.deepEqual(await children(other.id, null), [existing.key, 'abc-2'], 'roots appended at the end');
  assert.deepEqual(await children(other.id, root.id), ['abc-3'], 'children keep their parent');
  assert.deepEqual(await children(other.id, child.id), ['abc-4']);
  assert.equal((await invoke(issues, 'GetIssue', { id: grandchild.id, key: '' })).issue.version, 2);

  const aliases = await pool.query('SELECT key FROM lhoraire.issue_key_aliases ORDER BY key');
  assert.deepEqual(aliases.rows.map((r) => r.key), ['ffdb-1', 'ffdb-2', 'ffdb-3']);
  assert.equal((await create()).key, 'ffdb-5', 'numbers are never reused in the old project');
  assert.deepEqual(await children(p.id, null), [stays.key, 'ffdb-5']);

  await assert.rejects(invoke(issues, 'MoveIssuesToProject', { issueIds: [root.id], targetProjectId: other.id }), INVALID, 'already there');
});

test('moving copies project-specific types, unless the target has one with that name', async () => {
  const { p } = await setup();
  const local = await newType('Spike', p.id);
  const create = async (req) => (await invoke(issues, 'CreateIssue', {
    projectId: p.id, parentId: '', issueTypeId: local.issueType.id, summary: 'x', description: '', severity: '', assigneeId: '', ...req,
  })).issue;
  const issue = await create();
  await invoke(issues, 'UpdateIssue', { id: issue.id, version: 1, stateIdInNewType: '' });

  const clash = await project('clash');
  await newType('spike', clash.id);
  await assert.rejects(invoke(issues, 'MoveIssuesToProject', { issueIds: [issue.id], targetProjectId: clash.id }), FAILED);

  const target = await project('abc');
  await invoke(issues, 'MoveIssuesToProject', { issueIds: [issue.id], targetProjectId: target.id });
  const moved = (await invoke(issues, 'GetIssue', { id: issue.id, key: '' })).issue;
  const copied = (await invoke(types, 'ListIssueTypes', { projectId: target.id, includeGlobal: false })).issueTypes;
  assert.deepEqual(copied.map((t) => t.name), ['Spike']);
  assert.equal(moved.issueTypeId, copied[0].id);
  const copiedWorkflow = (await invoke(types, 'GetIssueType', { id: copied[0].id })).workflow;
  assert.equal(moved.stateId, stateId(copiedWorkflow, 'New'), 'state mapped to the copy\'s matching state');
  assert.equal((await invoke(types, 'GetIssueType', { id: local.issueType.id })).issueType.projectId, p.id, 'original type stays');
});

test('people who have signed in can be listed for assignment', async () => {
  await setup();
  const { users } = await invoke(issues, 'ListUsers', {});
  assert.deepEqual(users.map((u) => u.email), ['admin2@example.com', 'member@example.com', 'owner@example.com']);
});
