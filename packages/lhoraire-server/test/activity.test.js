import { test, before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import grpc from '@grpc/grpc-js';
import { getTestPool, resetData, invoke, USERS } from '../test-support/harness.js';
import { createProjectHandlers } from '../src/services/projectService.js';
import { createIssueTypeHandlers } from '../src/services/issueTypeService.js';
import { createIssueHandlers } from '../src/services/issueService.js';
import { createActivityHandlers } from '../src/services/activityService.js';

let pool;
let projects;
let types;
let issues;
before(async () => {
  pool = await getTestPool();
  projects = createProjectHandlers({ pool });
  types = createIssueTypeHandlers({ pool });
  issues = { ...createIssueHandlers({ pool }), ...createActivityHandlers({ pool }) };
});
beforeEach(() => resetData(pool));
after(() => pool.end());

const INVALID = { code: grpc.status.INVALID_ARGUMENT };
const FAILED = { code: grpc.status.FAILED_PRECONDITION };

async function setup() {
  const p = (await invoke(projects, 'CreateProject', { key: 'ffdb', name: 'ffdb', color: '' })).project;
  const { issueType, workflow } = await invoke(types, 'CreateIssueType', { projectId: '', name: 'Bug', icon: '', color: '', copyWorkflowFromTypeId: '' });
  const s = Object.fromEntries(workflow.states.map((st) => [st.name, st.id]));
  const create = async (req = {}) => (await invoke(issues, 'CreateIssue', {
    projectId: p.id, parentId: '', issueTypeId: issueType.id, summary: 'Something', description: '', severity: '', assigneeId: USERS.owner.userId, ...req,
  })).issue;
  const get = async (issue) => (await invoke(issues, 'GetIssue', { id: issue.id, key: '' })).issue;
  const move = async (issue, toState, extra = {}) => (await invoke(issues, 'TransitionIssue', {
    id: issue.id, version: (await get(issue)).version, toStateId: s[toState], endReason: '', endDescription: '', ...extra,
  })).issue;
  const closeIt = (issue) => move(issue, 'Closed', { endReason: 'completed', endDescription: 'Shipped it' });
  return { p, s, create, get, move, closeIt };
}

test('transitions follow the workflow and need an assignee', async () => {
  const { s, create, move } = await setup();
  const unassigned = await create({ assigneeId: '' });
  await assert.rejects(move(unassigned, 'Underway'), FAILED, 'unassigned');

  const issue = await create();
  await assert.rejects(move(issue, 'Paused'), FAILED, 'New -> Paused is not a transition');
  const underway = await move(issue, 'Underway');
  assert.equal(underway.stateId, s.Underway);
  assert.equal(underway.version, 2);
  await move(issue, 'Paused');
  await move(issue, 'Underway');
});

test('a stale version is rejected', async () => {
  const { s, create } = await setup();
  const issue = await create();
  await invoke(issues, 'UpdateIssue', { id: issue.id, version: 1, summary: 'edited', stateIdInNewType: '' });
  await assert.rejects(invoke(issues, 'TransitionIssue', { id: issue.id, version: 1, toStateId: s.Underway, endReason: '', endDescription: '' }), { code: grpc.status.ABORTED });
});

test('closing needs an end reason and a description, and is final', async () => {
  const { create, move, closeIt } = await setup();
  const issue = await create();
  await move(issue, 'Underway');
  await assert.rejects(move(issue, 'Closed'), INVALID, 'no reason');
  await assert.rejects(move(issue, 'Closed', { endReason: 'bored', endDescription: 'x' }), INVALID, 'unknown reason');
  await assert.rejects(move(issue, 'Closed', { endReason: 'obsolete', endDescription: '   ' }), INVALID, 'no description');
  await assert.rejects(move(issue, 'Paused', { endReason: 'obsolete', endDescription: 'x' }), INVALID, 'reason on an open state');

  const closed = await closeIt(issue);
  assert.equal(closed.endReason, 'completed');
  assert.equal(closed.endDescription, 'Shipped it');
  await assert.rejects(move(issue, 'Underway'), FAILED, 'terminal is final');
});

test('a parent closes only after all its children are closed', async () => {
  const { create, move, closeIt } = await setup();
  const parent = await create();
  const a = await create({ parentId: parent.id });
  const b = await create({ parentId: parent.id });
  await move(parent, 'Underway');
  await assert.rejects(closeIt(parent), (err) => {
    assert.equal(err.code, grpc.status.FAILED_PRECONDITION);
    assert.match(err.message, /ffdb-2, ffdb-3/);
    return true;
  });
  for (const child of [a, b]) {
    await move(child, 'Underway');
    await closeIt(child);
  }
  await closeIt(parent);
});

test('transitions are recorded in history with the end reason', async () => {
  const { create, move, closeIt } = await setup();
  const issue = await create();
  await move(issue, 'Underway');
  await closeIt(issue);
  const { events } = await invoke(issues, 'GetIssueHistory', { issueId: issue.id });
  assert.deepEqual(events.map((e) => [e.kind, JSON.parse(e.oldValueJson), JSON.parse(e.newValueJson)]), [
    ['created', null, null],
    ['transition', 'New', 'Underway'],
    ['transition', 'Underway', { state: 'Closed', endReason: 'completed', endDescription: 'Shipped it' }],
  ]);
  assert.equal(events[1].actorEmail, 'owner@example.com');
});

test('comments: any number, any length, editable, with edits tracked', async () => {
  const { create } = await setup();
  const issue = await create();
  const long = 'word '.repeat(5000);
  const first = (await invoke(issues, 'AddComment', { issueId: issue.id, body: long })).comment;
  await invoke(issues, 'AddComment', { issueId: issue.id, body: 'second' }, 'admin2');
  await assert.rejects(invoke(issues, 'AddComment', { issueId: issue.id, body: '  ' }), INVALID);

  const edited = (await invoke(issues, 'EditComment', { id: first.id, body: 'shorter now' }, 'admin2')).comment;
  assert.equal(edited.body, 'shorter now');
  assert.equal(edited.editedBy, USERS.admin2.userId);
  assert.equal(edited.createdBy, USERS.owner.userId);
  assert.ok(edited.editedAt);

  const { comments } = await invoke(issues, 'ListComments', { issueId: issue.id });
  assert.deepEqual(comments.map((c) => c.body), ['shorter now', 'second']);
  assert.equal(comments[1].editedAt, '', 'never edited');

  const { events } = await invoke(issues, 'GetIssueHistory', { issueId: issue.id });
  const edit = events.find((e) => e.kind === 'comment_edited');
  assert.equal(JSON.parse(edit.oldValueJson).body, long);
  assert.equal(edit.actorEmail, 'admin2@example.com');
});

test('depends on / required by: one link, seen from both sides, removed together', async () => {
  const { create } = await setup();
  const a = await create({ summary: 'A' });
  const b = await create({ summary: 'B' });
  const { link } = await invoke(issues, 'AddLink', { issueId: b.id, kind: 'required_by', otherIssueId: '', otherIssueKey: 'ffdb-1' });
  assert.equal(link.kind, 'required_by');
  assert.equal(link.otherIssueKey, 'ffdb-1');

  const fromA = (await invoke(issues, 'ListLinks', { issueId: a.id })).links;
  assert.deepEqual(fromA.map((l) => [l.kind, l.otherIssueKey, l.otherIssueSummary]), [['depends_on', 'ffdb-2', 'B']]);

  await assert.rejects(invoke(issues, 'AddLink', { issueId: a.id, kind: 'depends_on', otherIssueId: b.id, otherIssueKey: '' }), { code: grpc.status.ALREADY_EXISTS }, 'same link again from the other side');
  await assert.rejects(invoke(issues, 'AddLink', { issueId: b.id, kind: 'depends_on', otherIssueId: a.id, otherIssueKey: '' }), (err) => {
    assert.equal(err.code, grpc.status.FAILED_PRECONDITION);
    assert.equal(err.message, 'ffdb-1 already depends on ffdb-2.');
    return true;
  });

  await invoke(issues, 'RemoveLink', { id: link.id });
  assert.equal((await invoke(issues, 'ListLinks', { issueId: a.id })).links.length, 0);
  assert.equal((await invoke(issues, 'ListLinks', { issueId: b.id })).links.length, 0);

  const kinds = async (issue) => (await invoke(issues, 'GetIssueHistory', { issueId: issue.id })).events
    .filter((e) => e.kind.startsWith('link')).map((e) => `${e.kind}:${JSON.parse(e.newValueJson ?? 'null')?.kind ?? JSON.parse(e.oldValueJson).kind}`);
  assert.deepEqual(await kinds(a), ['link_added:depends_on', 'link_removed:depends_on']);
  assert.deepEqual(await kinds(b), ['link_added:required_by', 'link_removed:required_by']);
});

test('duplicates and relates to; across projects; never to itself', async () => {
  const { create } = await setup();
  const a = await create();
  const b = await create();
  const other = (await invoke(projects, 'CreateProject', { key: 'abc', name: 'abc', color: '' })).project;
  const { issueTypes } = await invoke(types, 'ListIssueTypes', { projectId: '', includeGlobal: false });
  const c = (await invoke(issues, 'CreateIssue', {
    projectId: other.id, parentId: '', issueTypeId: issueTypes[0].id, summary: 'elsewhere', description: '', severity: '', assigneeId: '',
  })).issue;

  await invoke(issues, 'AddLink', { issueId: a.id, kind: 'duplicated_by', otherIssueId: b.id, otherIssueKey: '' });
  assert.deepEqual((await invoke(issues, 'ListLinks', { issueId: b.id })).links.map((l) => l.kind), ['duplicates']);

  await invoke(issues, 'AddLink', { issueId: c.id, kind: 'relates_to', otherIssueId: a.id, otherIssueKey: '' });
  await assert.rejects(invoke(issues, 'AddLink', { issueId: a.id, kind: 'relates_to', otherIssueId: c.id, otherIssueKey: '' }), { code: grpc.status.ALREADY_EXISTS }, 'symmetric');
  assert.deepEqual((await invoke(issues, 'ListLinks', { issueId: a.id })).links.map((l) => [l.kind, l.otherIssueKey]), [['duplicated_by', 'ffdb-2'], ['relates_to', 'abc-1']]);

  await assert.rejects(invoke(issues, 'AddLink', { issueId: a.id, kind: 'relates_to', otherIssueId: a.id, otherIssueKey: '' }), INVALID);
  await assert.rejects(invoke(issues, 'AddLink', { issueId: a.id, kind: 'blocks', otherIssueId: b.id, otherIssueKey: '' }), INVALID);
});

test('deleting an issue removes its links from the other side too', async () => {
  const { create } = await setup();
  const a = await create();
  const b = await create();
  await invoke(issues, 'AddLink', { issueId: a.id, kind: 'depends_on', otherIssueId: b.id, otherIssueKey: '' });
  await invoke(issues, 'DeleteIssues', { issueIds: [b.id] });
  assert.equal((await invoke(issues, 'ListLinks', { issueId: a.id })).links.length, 0);
});
