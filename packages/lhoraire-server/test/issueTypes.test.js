import { test, before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import grpc from '@grpc/grpc-js';
import { getTestPool, resetData, invoke, insertIssue } from '../test-support/harness.js';
import { mappings } from '../test-support/harness.js';
import { createProjectHandlers } from '../src/services/projectService.js';
import { createIssueTypeHandlers } from '../src/services/issueTypeService.js';

let pool;
let projects;
let types;
before(async () => {
  pool = await getTestPool();
  projects = createProjectHandlers({ pool });
  types = createIssueTypeHandlers({ pool });
});
beforeEach(() => resetData(pool));
after(() => pool.end());

const project = async (key) => (await invoke(projects, 'CreateProject', { key, name: key, color: '' })).project;
const createType = (req) => invoke(types, 'CreateIssueType', { projectId: '', name: 'Bug', icon: '', color: '', copyWorkflowFromTypeId: '', ...req });
const stateByName = (workflow, name) => workflow.states.find((s) => s.name === name);
const FAILED = { code: grpc.status.FAILED_PRECONDITION };
const INVALID = { code: grpc.status.INVALID_ARGUMENT };

// Workflow as name-level pairs, for comparing shapes regardless of ids.
function shape(workflow) {
  const name = new Map(workflow.states.map((s) => [s.id, s.name]));
  return {
    states: workflow.states.map((s) => `${s.name}${s.isInitial ? '*' : ''}${s.isTerminal ? '!' : ''}`),
    transitions: workflow.transitions.map((t) => `${name.get(t.fromStateId)}>${name.get(t.toStateId)}`).sort(),
  };
}

test('a new type gets the default New/Underway/Paused/Closed workflow', async () => {
  const { issueType, workflow } = await createType({ name: 'Task2', icon: 'bolt', color: '#123456' });
  assert.equal(issueType.projectId, '');
  assert.equal(issueType.icon, 'bolt');
  assert.deepEqual(shape(workflow), {
    states: ['New*', 'Underway', 'Paused', 'Closed!'],
    transitions: ['New>Underway', 'Paused>Closed', 'Paused>Underway', 'Underway>Closed', 'Underway>Paused'],
  });
});

test('listing: global only, a project\'s own, or a project\'s with globals', async () => {
  const p = await project('ffdb');
  await createType({ name: 'Global' });
  await createType({ name: 'Local', projectId: p.id });
  const names = async (req) => (await invoke(types, 'ListIssueTypes', { projectId: '', includeGlobal: false, ...req })).issueTypes.map((t) => t.name);
  assert.deepEqual(await names({}), ['Global']);
  assert.deepEqual(await names({ projectId: p.id }), ['Local']);
  assert.deepEqual(await names({ projectId: p.id, includeGlobal: true }), ['Global', 'Local']);
});

test('names may not repeat wherever two types would be offered together', async () => {
  const a = await project('aaa');
  const b = await project('bbb');
  await createType({ name: 'Bug' });
  await assert.rejects(createType({ name: 'bug' }), FAILED, 'duplicate global');
  await assert.rejects(createType({ name: 'BUG', projectId: a.id }), FAILED, 'project type named like a global');
  await createType({ name: 'Story', projectId: a.id });
  await createType({ name: 'Story', projectId: b.id }); // fine: never offered together
  await assert.rejects(createType({ name: 'Story' }), FAILED, 'global named like a project type');
});

test('copying a workflow: from globals always, from the same project only', async () => {
  const a = await project('aaa');
  const b = await project('bbb');
  const global = await createType({ name: 'G' });
  const inA = await createType({ name: 'A1', projectId: a.id });
  const copy = await createType({ name: 'A2', projectId: a.id, copyWorkflowFromTypeId: inA.issueType.id });
  assert.deepEqual(shape(copy.workflow), shape(inA.workflow));
  assert.notEqual(copy.workflow.states[0].id, inA.workflow.states[0].id, 'a copy, not shared states');
  await createType({ name: 'A3', projectId: a.id, copyWorkflowFromTypeId: global.issueType.id });
  await assert.rejects(createType({ name: 'B1', projectId: b.id, copyWorkflowFromTypeId: inA.issueType.id }), INVALID);
  await assert.rejects(createType({ name: 'G2', copyWorkflowFromTypeId: inA.issueType.id }), INVALID);
});

test('project -> global is blocked by a name collision, otherwise allowed', async () => {
  const a = await project('aaa');
  const b = await project('bbb');
  const local = await createType({ name: 'Story', projectId: a.id });
  await createType({ name: 'Story', projectId: b.id });
  await assert.rejects(invoke(types, 'MoveIssueTypeScope', { id: local.issueType.id, targetProjectId: '' }), FAILED);
  const unique = await createType({ name: 'Epic', projectId: a.id });
  const moved = await invoke(types, 'MoveIssueTypeScope', { id: unique.issueType.id, targetProjectId: '' });
  assert.equal(moved.issueType.projectId, '');
});

test('global -> project is blocked while other projects use it', async () => {
  const a = await project('aaa');
  const b = await project('bbb');
  const { issueType, workflow } = await createType({ name: 'Bug' });
  await insertIssue(pool, { projectId: a.id, typeId: issueType.id, stateId: workflow.states[0].id });
  await insertIssue(pool, { projectId: b.id, typeId: issueType.id, stateId: workflow.states[0].id });
  await assert.rejects(invoke(types, 'MoveIssueTypeScope', { id: issueType.id, targetProjectId: a.id }), (err) => {
    assert.equal(err.code, grpc.status.FAILED_PRECONDITION);
    assert.match(err.message, /bbb \(1\)/);
    return true;
  });
  await pool.query('DELETE FROM lhoraire.issues WHERE project_id = $1', [b.id]);
  const moved = await invoke(types, 'MoveIssueTypeScope', { id: issueType.id, targetProjectId: a.id });
  assert.equal(moved.issueType.projectId, a.id);
});

test('a project type can only move via global', async () => {
  const a = await project('aaa');
  const b = await project('bbb');
  const local = await createType({ name: 'Story', projectId: a.id });
  await assert.rejects(invoke(types, 'MoveIssueTypeScope', { id: local.issueType.id, targetProjectId: b.id }), INVALID);
});

test('usage counts issues, per state, and what deleting with subtrees would remove', async () => {
  const p = await project('ffdb');
  const bug = await createType({ name: 'Bug' });
  const task = await createType({ name: 'Task2' });
  const newState = stateByName(bug.workflow, 'New').id;
  const parent = await insertIssue(pool, { projectId: p.id, typeId: bug.issueType.id, stateId: newState });
  const child = await insertIssue(pool, { projectId: p.id, typeId: task.issueType.id, stateId: task.workflow.states[0].id, parentId: parent });
  await insertIssue(pool, { projectId: p.id, typeId: task.issueType.id, stateId: task.workflow.states[0].id, parentId: child });
  const usage = await invoke(types, 'GetIssueTypeUsage', { id: bug.issueType.id });
  assert.equal(usage.issueCount, 1);
  assert.equal(usage.deletedWithSubtreesCount, 3);
  assert.deepEqual(usage.issuesPerState, { [newState]: 1 });
});

test('deleting a type: free when unused, otherwise reassign or delete with subtrees', async () => {
  const p = await project('ffdb');
  const unused = await createType({ name: 'Unused' });
  await invoke(types, 'DeleteIssueType', { id: unused.issueType.id, mode: 'MODE_UNSPECIFIED', reassignToTypeId: '', stateMappings: mappings({}) });

  const bug = await createType({ name: 'Bug' });
  const task = await createType({ name: 'Task2' });
  const parent = await insertIssue(pool, { projectId: p.id, typeId: bug.issueType.id, stateId: bug.workflow.states[0].id });
  await insertIssue(pool, { projectId: p.id, typeId: task.issueType.id, stateId: task.workflow.states[0].id, parentId: parent });
  const del = (req) => invoke(types, 'DeleteIssueType', { id: bug.issueType.id, reassignToTypeId: '', stateMappings: mappings({}), ...req });

  await assert.rejects(del({ mode: 'MODE_UNSPECIFIED' }), FAILED, 'must choose when issues exist');
  const result = await del({ mode: 'DELETE_ISSUES' });
  assert.equal(result.issuesDeleted, 2, 'the child of another type goes with its parent');
  const { rows } = await pool.query('SELECT count(*)::int AS n FROM lhoraire.issues');
  assert.equal(rows[0].n, 0);
});

test('reassigning a deleted type maps states, records history, and refuses bad mappings', async () => {
  const a = await project('aaa');
  const b = await project('bbb');
  const bug = await createType({ name: 'Bug' });
  const task = await createType({ name: 'Task2' });
  const s = (wf, n) => stateByName(wf, n).id;
  const open = await insertIssue(pool, { projectId: a.id, typeId: bug.issueType.id, stateId: s(bug.workflow, 'Underway') });
  await pool.query(
    "INSERT INTO lhoraire.issues (project_id, number, sibling_rank, issue_type_id, state_id, summary, created_by, modified_by, end_reason, end_description) SELECT $1, 999, 'z', $2, $3, 'done', created_by, created_by, 'completed', 'shipped' FROM lhoraire.issues WHERE id = $4",
    [a.id, bug.issueType.id, s(bug.workflow, 'Closed'), open],
  );
  const del = (stateMapping, extra = {}) => invoke(types, 'DeleteIssueType', {
    id: bug.issueType.id, mode: 'REASSIGN', reassignToTypeId: task.issueType.id, stateMappings: mappings(stateMapping), ...extra,
  });

  await assert.rejects(del({ [s(bug.workflow, 'Underway')]: s(task.workflow, 'Underway') }), INVALID, 'Closed not mapped');
  await assert.rejects(del({
    [s(bug.workflow, 'Underway')]: s(task.workflow, 'Closed'),
    [s(bug.workflow, 'Closed')]: s(task.workflow, 'Closed'),
  }), INVALID, 'open issue may not close by being moved');

  const localOnly = await createType({ name: 'OnlyB', projectId: b.id });
  await assert.rejects(del({}, { reassignToTypeId: localOnly.issueType.id }), INVALID, 'target must exist in the issues\' project');

  const result = await del({
    [s(bug.workflow, 'Underway')]: s(task.workflow, 'Paused'),
    [s(bug.workflow, 'Closed')]: s(task.workflow, 'Closed'),
  });
  assert.equal(result.issuesReassigned, 2);
  const moved = await pool.query('SELECT issue_type_id, state_id, version FROM lhoraire.issues WHERE id = $1', [open]);
  assert.equal(moved.rows[0].issue_type_id, task.issueType.id);
  assert.equal(moved.rows[0].state_id, s(task.workflow, 'Paused'));
  assert.equal(moved.rows[0].version, 2);
  const history = await pool.query("SELECT old_value, new_value FROM lhoraire.issue_events WHERE issue_id = $1 AND field = 'issue_type'", [open]);
  assert.deepEqual(history.rows[0], { old_value: 'Bug', new_value: 'Task2' });
  const gone = await pool.query('SELECT 1 FROM lhoraire.issue_types WHERE id = $1', [bug.issueType.id]);
  assert.equal(gone.rows.length, 0);
});

test('workflow editing: rename, swap names, move the initial flag, add states and transitions', async () => {
  const { issueType, workflow } = await createType({ name: 'Bug' });
  const [n, u, p, c] = ['New', 'Underway', 'Paused', 'Closed'].map((name) => stateByName(workflow, name).id);
  const { workflow: next } = await invoke(types, 'UpdateWorkflow', {
    issueTypeId: issueType.id,
    states: [
      { id: 'new:triage', name: 'Triage', isInitial: true, isTerminal: false },
      { id: n, name: 'Underway', isInitial: false, isTerminal: false }, // swapped names
      { id: u, name: 'New', isInitial: false, isTerminal: false },
      { id: p, name: 'Paused', isInitial: false, isTerminal: false },
      { id: c, name: 'Done', isInitial: false, isTerminal: true },
    ],
    transitions: [
      { fromStateId: 'new:triage', toStateId: n },
      { fromStateId: n, toStateId: c },
    ],
    stateMappings: mappings({}),
  });
  assert.deepEqual(shape(next), {
    states: ['Triage*', 'Underway', 'New', 'Paused', 'Done!'],
    transitions: ['Triage>Underway', 'Underway>Done'],
  });
  assert.equal(stateByName(next, 'Underway').id, n, 'existing states keep their ids');
});

test('workflow editing refuses invalid shapes', async () => {
  const { issueType, workflow } = await createType({ name: 'Bug' });
  const [n, , , c] = workflow.states.map((s) => s.id);
  const update = (states, transitions = []) => invoke(types, 'UpdateWorkflow', { issueTypeId: issueType.id, states, transitions, stateMappings: mappings({}) });
  const st = (id, name, isInitial = false, isTerminal = false) => ({ id, name, isInitial, isTerminal });

  await assert.rejects(update([st(n, 'A'), st(c, 'B', false, true)]), INVALID, 'no initial state');
  await assert.rejects(update([st(n, 'A', true), st(c, 'B', true)]), INVALID, 'two initial states');
  await assert.rejects(update([st(n, 'A', true, true)]), INVALID, 'initial and terminal');
  await assert.rejects(update([st(n, 'A', true), st(c, 'a')]), INVALID, 'duplicate names');
  await assert.rejects(update([st(n, 'A', true), st(c, 'B', false, true)], [{ fromStateId: c, toStateId: n }]), INVALID, 'out of a terminal state');
  await assert.rejects(update([st(n, 'A', true), st('00000000-0000-4000-8000-0000000000ff', 'X')]), INVALID, 'foreign state id');
});

test('removing or re-flagging states that hold issues needs care', async () => {
  const proj = await project('ffdb');
  const { issueType, workflow } = await createType({ name: 'Bug' });
  const [n, u, p, c] = workflow.states.map((s) => s.id);
  const issue = await insertIssue(pool, { projectId: proj.id, typeId: issueType.id, stateId: p });
  const st = (id, name, isInitial = false, isTerminal = false) => ({ id, name, isInitial, isTerminal });
  const update = (states, stateMapping = {}) => invoke(types, 'UpdateWorkflow', { issueTypeId: issueType.id, states, transitions: [], stateMappings: mappings(stateMapping) });

  await assert.rejects(update([st(n, 'New', true), st(u, 'Underway'), st(c, 'Closed', false, true)]), INVALID, 'Paused removed without a mapping');
  await assert.rejects(update([st(n, 'New', true), st(u, 'Underway'), st(c, 'Closed', false, true)], { [p]: c }), INVALID, 'mapped to a terminal state');
  await assert.rejects(update([st(n, 'New', true), st(u, 'Underway'), st(p, 'Paused', false, true), st(c, 'Closed', false, true)]), FAILED, 'occupied state turned terminal');

  await update([st(n, 'New', true), st(u, 'Underway'), st(c, 'Closed', false, true)], { [p]: u });
  const { rows } = await pool.query('SELECT state_id FROM lhoraire.issues WHERE id = $1', [issue]);
  assert.equal(rows[0].state_id, u);
  const history = await pool.query("SELECT old_value, new_value FROM lhoraire.issue_events WHERE issue_id = $1 AND field = 'state'", [issue]);
  assert.deepEqual(history.rows[0], { old_value: 'Paused', new_value: 'Underway' });
});
