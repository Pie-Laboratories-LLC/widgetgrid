import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as wf from '../src/workflowDraft.js';

const original = {
  states: [
    { id: 'n', name: 'New', isInitial: true, isTerminal: false },
    { id: 'u', name: 'Underway', isInitial: false, isTerminal: false },
    { id: 'p', name: 'Paused', isInitial: false, isTerminal: false },
    { id: 'c', name: 'Closed', isInitial: false, isTerminal: true },
  ],
  transitions: [['n', 'u'], ['u', 'p'], ['u', 'c'], ['p', 'u'], ['p', 'c']].map(([f, t]) => ({ fromStateId: f, toStateId: t })),
};

test('adding Underway -> New produces the request UpdateWorkflow expects', () => {
  const draft = wf.toggleTransition(wf.fromWorkflow(original), 'u', 'n');
  const req = wf.toRequest(draft, 'type-1', {});
  assert.equal(req.issueTypeId, 'type-1');
  assert.deepEqual(req.states.map((s) => s.id), ['n', 'u', 'p', 'c']);
  assert.ok(req.transitions.some((t) => t.fromStateId === 'u' && t.toStateId === 'n'));
  assert.equal(req.transitions.length, 6);
  assert.deepEqual(wf.toRequest(draft, 't', { p: 'u' }).stateMappings, [{ fromStateId: 'p', toStateId: 'u' }]);
});

test('removing a state drops its transitions; occupied removals need a mapping', () => {
  const draft = wf.removeState(wf.fromWorkflow(original), 'p');
  assert.ok(![...draft.transitions].some((x) => x.includes('p')));
  const pending = wf.removedOccupied(draft, original, { p: 3, n: 1 });
  assert.deepEqual(pending.map((s) => [s.id, s.issues]), [['p', 3]]);
  assert.deepEqual(wf.mappingTargets(draft, pending[0]).map((s) => s.ref), ['n', 'u'], 'only open states for an open one');
});

test('starting and terminal flags stay consistent', () => {
  let draft = wf.setInitial(wf.fromWorkflow(original), 'c');
  assert.deepEqual(draft.states.filter((s) => s.isInitial).map((s) => s.ref), ['c']);
  assert.equal(draft.states.find((s) => s.ref === 'c').isTerminal, false, 'the start can\'t be terminal');
  draft = wf.setTerminal(wf.fromWorkflow(original), 'u', true);
  assert.ok(![...draft.transitions].some((x) => x.startsWith('u>')), 'terminal states lose their way out');
});

test('problems mirror the server rules', () => {
  const base = wf.fromWorkflow(original);
  assert.deepEqual(wf.problems(base), []);
  assert.match(wf.problems({ ...base, states: base.states.map((s) => ({ ...s, isInitial: false })) })[0], /exactly one/);
  assert.match(wf.problems({ ...base, states: [...base.states, { ref: 'x', name: 'new', isInitial: false, isTerminal: false }] })[0], /Two states/);
  assert.match(wf.problems({ ...base, states: [{ ...base.states[0], name: ' ' }] })[0], /needs a name/);
});

test('a copy is all-new states with the same shape', () => {
  const copy = wf.copyOf(original);
  assert.ok(copy.states.every((s) => s.ref.startsWith('new:')));
  assert.deepEqual(copy.states.map((s) => s.name), ['New', 'Underway', 'Paused', 'Closed']);
  assert.equal(copy.transitions.size, 5);
  const names = new Map(copy.states.map((s) => [s.ref, s.name]));
  assert.ok([...copy.transitions].map((p) => p.split('>').map((r) => names.get(r)).join('>')).includes('Paused>Closed'));
  assert.equal(wf.removedOccupied(copy, original, { u: 2 })[0].id, 'u', 'replacing still asks where occupied states go');
});

test('reordering and adding', () => {
  let draft = wf.moveState(wf.fromWorkflow(original), 'c', -1);
  assert.deepEqual(draft.states.map((s) => s.ref), ['n', 'u', 'c', 'p']);
  assert.equal(wf.moveState(draft, 'n', -1), draft, 'no-op at the top');
  draft = wf.addState(draft, 'Review');
  assert.equal(draft.states.at(-1).name, 'Review');
  assert.ok(draft.states.at(-1).ref.startsWith('new:'));
});
