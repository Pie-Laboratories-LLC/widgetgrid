import { invalid } from './grpc.js';

// The workflow a new issue type gets unless it copies another type's
// (same as the "Task" type seeded by migration 9).
export const DEFAULT_WORKFLOW = {
  states: [
    { ref: 'new', name: 'New', isInitial: true, isTerminal: false },
    { ref: 'underway', name: 'Underway', isInitial: false, isTerminal: false },
    { ref: 'paused', name: 'Paused', isInitial: false, isTerminal: false },
    { ref: 'closed', name: 'Closed', isInitial: false, isTerminal: true },
  ],
  transitions: [
    { from: 'new', to: 'underway' },
    { from: 'underway', to: 'paused' },
    { from: 'underway', to: 'closed' },
    { from: 'paused', to: 'underway' },
    { from: 'paused', to: 'closed' },
  ],
};

export async function loadWorkflow(db, issueTypeId) {
  const states = await db.query(
    'SELECT id, name, position, is_initial, is_terminal FROM lhoraire.workflow_states WHERE issue_type_id = $1 ORDER BY position, name',
    [issueTypeId],
  );
  const transitions = await db.query(
    'SELECT from_state_id, to_state_id FROM lhoraire.workflow_transitions WHERE issue_type_id = $1',
    [issueTypeId],
  );
  return {
    states: states.rows.map((s) => ({
      id: s.id, name: s.name, position: s.position, isInitial: s.is_initial, isTerminal: s.is_terminal,
    })),
    transitions: transitions.rows.map((t) => ({ fromStateId: t.from_state_id, toStateId: t.to_state_id })),
  };
}

// Checks a workflow's shape before it's written. states: [{ ref, name,
// isInitial, isTerminal }]; transitions: [{ from, to }] referring to refs.
export function validateWorkflow({ states, transitions }) {
  if (states.length === 0) throw invalid('A workflow needs at least one state.');
  const names = new Set();
  for (const s of states) {
    const key = s.name.trim().toLowerCase();
    if (!key) throw invalid('Every state needs a name.');
    if (names.has(key)) throw invalid(`Two states are called "${s.name.trim()}".`);
    names.add(key);
    if (s.isInitial && s.isTerminal) throw invalid(`"${s.name.trim()}" can't be both the starting state and a terminal state.`);
  }
  const initial = states.filter((s) => s.isInitial);
  if (initial.length !== 1) throw invalid('Mark exactly one state as the starting state.');
  const refs = new Set(states.map((s) => s.ref));
  const pairs = new Set();
  for (const t of transitions) {
    if (!refs.has(t.from) || !refs.has(t.to)) throw invalid('A transition refers to a state that is not in the workflow.');
    if (t.from === t.to) throw invalid('A state cannot transition to itself.');
    const pair = `${t.from}->${t.to}`;
    if (pairs.has(pair)) throw invalid('The same transition is listed twice.');
    pairs.add(pair);
  }
  const terminal = new Set(states.filter((s) => s.isTerminal).map((s) => s.ref));
  if (transitions.some((t) => terminal.has(t.from))) {
    throw invalid('Terminal states are final: no transitions out of them.');
  }
}

// Writes a validated workflow for a type that currently has none. Returns
// a map of ref -> new state id.
export async function insertWorkflow(client, issueTypeId, { states, transitions }) {
  validateWorkflow({ states, transitions });
  const ids = new Map();
  for (const [position, s] of states.entries()) {
    const { rows } = await client.query(
      `INSERT INTO lhoraire.workflow_states (issue_type_id, name, position, is_initial, is_terminal)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [issueTypeId, s.name.trim(), position, s.isInitial, s.isTerminal],
    );
    ids.set(s.ref, rows[0].id);
  }
  for (const t of transitions) {
    await client.query(
      'INSERT INTO lhoraire.workflow_transitions (issue_type_id, from_state_id, to_state_id) VALUES ($1, $2, $3)',
      [issueTypeId, ids.get(t.from), ids.get(t.to)],
    );
  }
  return ids;
}

// A stored workflow re-expressed in insertWorkflow's input shape (refs are
// the old state ids), for copying it to another type.
export function asTemplate(workflow) {
  return {
    states: workflow.states.map((s) => ({ ref: s.id, name: s.name, isInitial: s.isInitial, isTerminal: s.isTerminal })),
    transitions: workflow.transitions.map((t) => ({ from: t.fromStateId, to: t.toStateId })),
  };
}
