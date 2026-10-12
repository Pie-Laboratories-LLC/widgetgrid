// The workflow editor's working copy, as plain data (unit-tested in
// test/workflowDraft.test.js). A draft is
//   { states: [{ ref, name, isInitial, isTerminal }], transitions: Set('fromRef>toRef') }
// where ref is an existing state's id or "new:<n>" for states added here --
// exactly what UpdateWorkflow accepts.

let counter = 0;
const newRef = () => `new:${(counter += 1)}`;
const pair = (from, to) => `${from}>${to}`;

export function fromWorkflow(workflow) {
  return {
    states: workflow.states.map((s) => ({ ref: s.id, name: s.name, isInitial: s.isInitial, isTerminal: s.isTerminal })),
    transitions: new Set(workflow.transitions.map((t) => pair(t.fromStateId, t.toStateId))),
  };
}

// A copy of another type's workflow, as all-new states.
export function copyOf(workflow) {
  const refs = new Map(workflow.states.map((s) => [s.id, newRef()]));
  return {
    states: workflow.states.map((s) => ({ ref: refs.get(s.id), name: s.name, isInitial: s.isInitial, isTerminal: s.isTerminal })),
    transitions: new Set(workflow.transitions.map((t) => pair(refs.get(t.fromStateId), refs.get(t.toStateId)))),
  };
}

export function addState(draft, name = 'New state') {
  return { ...draft, states: [...draft.states, { ref: newRef(), name, isInitial: false, isTerminal: false }] };
}

// Removing a state drops its transitions too.
export function removeState(draft, ref) {
  return {
    states: draft.states.filter((s) => s.ref !== ref),
    transitions: new Set([...draft.transitions].filter((p) => !p.split('>').includes(ref))),
  };
}

export function moveState(draft, ref, delta) {
  const states = [...draft.states];
  const at = states.findIndex((s) => s.ref === ref);
  const to = at + delta;
  if (at < 0 || to < 0 || to >= states.length) return draft;
  [states[at], states[to]] = [states[to], states[at]];
  return { ...draft, states };
}

export function setInitial(draft, ref) {
  return { ...draft, states: draft.states.map((s) => ({ ...s, isInitial: s.ref === ref, isTerminal: s.ref === ref ? false : s.isTerminal })) };
}

// Terminal states are final: making one terminal drops its outgoing transitions.
export function setTerminal(draft, ref, isTerminal) {
  return {
    states: draft.states.map((s) => (s.ref === ref ? { ...s, isTerminal, isInitial: isTerminal ? false : s.isInitial } : s)),
    transitions: isTerminal ? new Set([...draft.transitions].filter((p) => p.split('>')[0] !== ref)) : draft.transitions,
  };
}

export function toggleTransition(draft, from, to) {
  const transitions = new Set(draft.transitions);
  const key = pair(from, to);
  if (transitions.has(key)) transitions.delete(key);
  else transitions.add(key);
  return { ...draft, transitions };
}

// Same rules as lhoraire-server's validateWorkflow; [] when valid.
export function problems(draft) {
  const out = [];
  if (draft.states.length === 0) out.push('A workflow needs at least one state.');
  const names = new Map();
  for (const s of draft.states) {
    const key = s.name.trim().toLowerCase();
    if (!key) out.push('Every state needs a name.');
    else if (names.has(key)) out.push(`Two states are called "${s.name.trim()}".`);
    names.set(key, true);
  }
  const initial = draft.states.filter((s) => s.isInitial).length;
  if (draft.states.length && initial !== 1) out.push('Mark exactly one state as the starting state.');
  return [...new Set(out)];
}

// Original states that are gone from the draft but still hold issues --
// each needs a target state before saving. usage: stateId -> issue count.
export function removedOccupied(draft, original, usage) {
  const kept = new Set(draft.states.map((s) => s.ref));
  return original.states.filter((s) => !kept.has(s.id) && (usage[s.id] ?? 0) > 0)
    .map((s) => ({ ...s, issues: usage[s.id] }));
}

// Draft states a removed state's issues may move to: same open/closed.
export function mappingTargets(draft, removedState) {
  return draft.states.filter((s) => s.isTerminal === removedState.isTerminal);
}

// stateMapping: { removedStateId: targetRef } -> the request's StateMapping list.
export function toRequest(draft, issueTypeId, stateMapping) {
  return {
    issueTypeId,
    states: draft.states.map((s) => ({ id: s.ref, name: s.name.trim(), isInitial: s.isInitial, isTerminal: s.isTerminal })),
    transitions: [...draft.transitions].map((p) => {
      const [fromStateId, toStateId] = p.split('>');
      return { fromStateId, toStateId };
    }),
    stateMappings: Object.entries(stateMapping).map(([fromStateId, toStateId]) => ({ fromStateId, toStateId })),
  };
}
