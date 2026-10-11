import { invalid, notFound, conflict, withTransaction } from '../grpc.js';
import { recordChange } from '../changes.js';
import { addEvent } from '../events.js';
import { DEFAULT_WORKFLOW, loadWorkflow, insertWorkflow, asTemplate, validateWorkflow } from '../workflow.js';

const COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

export function toProtoIssueType(row) {
  return {
    id: row.id,
    projectId: row.project_id ?? '',
    name: row.name,
    icon: row.icon,
    color: row.color,
    createdAt: row.created_at.toISOString(),
    modifiedAt: row.modified_at.toISOString(),
  };
}

async function getType(db, id, { lock = false } = {}) {
  const { rows } = await db.query(`SELECT * FROM lhoraire.issue_types WHERE id = $1${lock ? ' FOR UPDATE' : ''}`, [id]);
  if (!rows[0]) throw notFound('That issue type no longer exists.');
  return rows[0];
}

async function assertProjectExists(db, projectId) {
  const { rows } = await db.query('SELECT 1 FROM lhoraire.projects WHERE id = $1', [projectId]);
  if (!rows[0]) throw notFound('That project no longer exists.');
}

// A type name may not repeat anywhere its type would be offered alongside
// another: a project type can't share a name with a global type or another
// type in its project; a global type can't share a name with any type at
// all (it appears in every project).
async function assertNameFree(db, name, { projectId, excludeId = null }) {
  const { rows } = projectId
    ? await db.query(
      `SELECT project_id FROM lhoraire.issue_types
       WHERE lower(name) = lower($1) AND (project_id = $2 OR project_id IS NULL) AND id IS DISTINCT FROM $3 LIMIT 1`,
      [name.trim(), projectId, excludeId],
    )
    : await db.query(
      `SELECT t.project_id, p.key FROM lhoraire.issue_types t LEFT JOIN lhoraire.projects p ON p.id = t.project_id
       WHERE lower(t.name) = lower($1) AND t.id IS DISTINCT FROM $2 LIMIT 1`,
      [name.trim(), excludeId],
    );
  if (!rows[0]) return;
  const where = rows[0].project_id ? (rows[0].key ? `project ${rows[0].key}` : 'this project') : 'the global types';
  throw conflict(`"${name.trim()}" is already used in ${where} -- rename one of them first.`);
}

function checkFields(name, color) {
  if (!name.trim()) throw invalid('Give the issue type a name.');
  if (color && !COLOR_PATTERN.test(color)) throw invalid('Colour must look like #4a6fa5.');
}

async function usagePerState(db, issueTypeId) {
  const { rows } = await db.query(
    'SELECT state_id, count(*)::int AS n FROM lhoraire.issues WHERE issue_type_id = $1 GROUP BY state_id',
    [issueTypeId],
  );
  return new Map(rows.map((r) => [r.state_id, r.n]));
}

export function createIssueTypeHandlers({ pool }) {
  return {
    async ListIssueTypes({ projectId, includeGlobal }) {
      const { rows } = projectId
        ? await pool.query(
          `SELECT * FROM lhoraire.issue_types WHERE project_id = $1 OR ($2 AND project_id IS NULL)
           ORDER BY project_id IS NOT NULL, lower(name)`,
          [projectId, includeGlobal],
        )
        : await pool.query('SELECT * FROM lhoraire.issue_types WHERE project_id IS NULL ORDER BY lower(name)');
      return { issueTypes: rows.map(toProtoIssueType) };
    },

    async GetIssueType({ id }) {
      const type = await getType(pool, id);
      return { issueType: toProtoIssueType(type), workflow: await loadWorkflow(pool, id) };
    },

    async CreateIssueType({ projectId, name, icon, color, copyWorkflowFromTypeId }) {
      checkFields(name, color);
      return withTransaction(pool, async (client) => {
        if (projectId) await assertProjectExists(client, projectId);
        await assertNameFree(client, name, { projectId });

        let template = DEFAULT_WORKFLOW;
        if (copyWorkflowFromTypeId) {
          const source = await getType(client, copyWorkflowFromTypeId);
          if (source.project_id && source.project_id !== projectId) {
            throw invalid("You can copy a workflow from a global type or from a type in the same project.");
          }
          template = asTemplate(await loadWorkflow(client, source.id));
        }

        const { rows } = await client.query(
          `INSERT INTO lhoraire.issue_types (project_id, name, icon, color)
           VALUES ($1, $2, COALESCE(NULLIF($3, ''), 'task'), COALESCE(NULLIF($4, ''), '#6b7280')) RETURNING *`,
          [projectId || null, name.trim(), icon, color],
        );
        await insertWorkflow(client, rows[0].id, template);
        await recordChange(client, { projectId: projectId || null, kind: 'issue_type_changed' });
        return { issueType: toProtoIssueType(rows[0]), workflow: await loadWorkflow(client, rows[0].id) };
      });
    },

    async UpdateIssueType({ id, name, icon, color }) {
      checkFields(name, color);
      return withTransaction(pool, async (client) => {
        const type = await getType(client, id, { lock: true });
        await assertNameFree(client, name, { projectId: type.project_id, excludeId: id });
        const { rows } = await client.query(
          `UPDATE lhoraire.issue_types
           SET name = $2, icon = COALESCE(NULLIF($3, ''), icon), color = COALESCE(NULLIF($4, ''), color), modified_at = now()
           WHERE id = $1 RETURNING *`,
          [id, name.trim(), icon, color],
        );
        await recordChange(client, { projectId: type.project_id, kind: 'issue_type_changed' });
        return { issueType: toProtoIssueType(rows[0]) };
      });
    },

    async MoveIssueTypeScope({ id, targetProjectId }) {
      return withTransaction(pool, async (client) => {
        const type = await getType(client, id, { lock: true });
        if (!targetProjectId) {
          if (!type.project_id) throw invalid('That type is already global.');
          await assertNameFree(client, type.name, { projectId: null, excludeId: id });
        } else {
          if (type.project_id) throw invalid('Make the type global first, then move it to the other project.');
          await assertProjectExists(client, targetProjectId);
          const { rows } = await client.query(
            `SELECT p.key, count(*)::int AS n FROM lhoraire.issues i JOIN lhoraire.projects p ON p.id = i.project_id
             WHERE i.issue_type_id = $1 AND i.project_id <> $2 GROUP BY p.key ORDER BY p.key`,
            [id, targetProjectId],
          );
          if (rows.length) {
            const where = rows.map((r) => `${r.key} (${r.n})`).join(', ');
            throw conflict(`Other projects still have issues of this type: ${where}. Change those issues' type first.`);
          }
          await assertNameFree(client, type.name, { projectId: targetProjectId, excludeId: id });
        }
        const { rows } = await client.query(
          'UPDATE lhoraire.issue_types SET project_id = $2, modified_at = now() WHERE id = $1 RETURNING *',
          [id, targetProjectId || null],
        );
        // Visible in more (or fewer) projects either way: a global change.
        await recordChange(client, { projectId: null, kind: 'issue_type_changed' });
        return { issueType: toProtoIssueType(rows[0]) };
      });
    },

    async GetIssueTypeUsage({ id }) {
      await getType(pool, id);
      const perState = await usagePerState(pool, id);
      const { rows } = await pool.query(
        `WITH RECURSIVE doomed AS (
           SELECT id FROM lhoraire.issues WHERE issue_type_id = $1
           UNION
           SELECT i.id FROM lhoraire.issues i JOIN doomed d ON i.parent_id = d.id
         ) SELECT count(*)::int AS n FROM doomed`,
        [id],
      );
      return {
        issueCount: [...perState.values()].reduce((a, b) => a + b, 0),
        deletedWithSubtreesCount: rows[0].n,
        issuesPerState: Object.fromEntries(perState),
      };
    },

    async DeleteIssueType({ id, mode, reassignToTypeId, stateMapping }, caller) {
      return withTransaction(pool, async (client) => {
        const type = await getType(client, id, { lock: true });
        const perState = await usagePerState(client, id);
        const issueCount = [...perState.values()].reduce((a, b) => a + b, 0);
        let issuesReassigned = 0;
        let issuesDeleted = 0;

        if (issueCount > 0 && mode === 'REASSIGN') {
          if (!reassignToTypeId || reassignToTypeId === id) throw invalid('Choose the issue type to move the issues to.');
          const target = await getType(client, reassignToTypeId);
          if (target.project_id) {
            const { rows } = await client.query(
              'SELECT 1 FROM lhoraire.issues WHERE issue_type_id = $1 AND project_id <> $2 LIMIT 1',
              [id, target.project_id],
            );
            if (rows[0]) throw invalid(`"${target.name}" only exists in one project, but some of these issues are in others.`);
          }
          const sourceStates = new Map((await loadWorkflow(client, id)).states.map((s) => [s.id, s]));
          const targetStates = new Map((await loadWorkflow(client, target.id)).states.map((s) => [s.id, s]));
          for (const [stateId, n] of perState) {
            const to = targetStates.get(stateMapping[stateId]);
            const from = sourceStates.get(stateId);
            if (!to) throw invalid(`Choose where the ${n} issue(s) in "${from.name}" should go.`);
            if (to.isTerminal !== from.isTerminal) {
              throw invalid(`"${from.name}" and "${to.name}" must both be terminal or both not: issues can't reopen or close by being moved.`);
            }
          }
          const moved = await client.query(
            `UPDATE lhoraire.issues SET issue_type_id = $2, state_id = ($3::jsonb ->> state_id::text)::uuid,
               version = version + 1, modified_at = now(), modified_by = $4
             WHERE issue_type_id = $1 RETURNING id, project_id`,
            [id, target.id, JSON.stringify(stateMapping), caller.userId],
          );
          for (const row of moved.rows) {
            await addEvent(client, {
              issueId: row.id, actorId: caller.userId, kind: 'field', field: 'issue_type',
              oldValue: type.name, newValue: target.name,
            });
          }
          for (const projectId of new Set(moved.rows.map((r) => r.project_id))) {
            await recordChange(client, { projectId, kind: 'issues_changed' });
          }
          issuesReassigned = moved.rowCount;
        } else if (issueCount > 0 && mode === 'DELETE_ISSUES') {
          const { rows } = await client.query(
            `WITH RECURSIVE doomed AS (
               SELECT id, project_id FROM lhoraire.issues WHERE issue_type_id = $1
               UNION
               SELECT i.id, i.project_id FROM lhoraire.issues i JOIN doomed d ON i.parent_id = d.id
             ) SELECT count(*)::int AS n, array_agg(DISTINCT project_id) AS projects FROM doomed`,
            [id],
          );
          await client.query('DELETE FROM lhoraire.issues WHERE issue_type_id = $1', [id]);
          for (const projectId of rows[0].projects) await recordChange(client, { projectId, kind: 'issues_changed' });
          issuesDeleted = rows[0].n;
        } else if (issueCount > 0) {
          throw conflict(`${issueCount} issue(s) use this type. Reassign them to another type, or delete them with their subtrees.`);
        }

        await client.query('DELETE FROM lhoraire.issue_types WHERE id = $1', [id]);
        await recordChange(client, { projectId: type.project_id, kind: 'issue_type_changed' });
        return { issuesReassigned, issuesDeleted };
      });
    },

    async UpdateWorkflow({ issueTypeId, states, transitions, stateMapping }, caller) {
      return withTransaction(pool, async (client) => {
        const type = await getType(client, issueTypeId, { lock: true });
        const current = new Map((await loadWorkflow(client, issueTypeId)).states.map((s) => [s.id, s]));
        const perState = await usagePerState(client, issueTypeId);

        const input = states.map((s) => ({ ref: s.id, name: s.name, isInitial: s.isInitial, isTerminal: s.isTerminal }));
        for (const s of input) {
          if (!s.ref.startsWith('new:') && !current.has(s.ref)) throw invalid('A state in the request is not part of this workflow.');
        }
        const refs = transitions.map((t) => ({ from: t.fromStateId, to: t.toStateId }));
        validateWorkflow({ states: input, transitions: refs });

        const byRef = new Map(input.map((s) => [s.ref, s]));
        for (const s of input) {
          const was = current.get(s.ref);
          if (was && was.isTerminal !== s.isTerminal && perState.get(s.ref)) {
            throw conflict(`"${was.name}" has issues in it, so it can't switch between terminal and not. Move them first.`);
          }
        }
        const removed = [...current.values()].filter((s) => !byRef.has(s.id));
        for (const s of removed) {
          const n = perState.get(s.id);
          if (!n) continue;
          const to = byRef.get(stateMapping[s.id]);
          if (!to) throw invalid(`Choose where the ${n} issue(s) in "${s.name}" should go.`);
          if (to.isTerminal !== s.isTerminal) {
            throw invalid(`"${s.name}" and "${to.name.trim()}" must both be terminal or both not: issues can't reopen or close by being moved.`);
          }
        }

        // Park existing states under unique temporary names and no initial
        // flag, so renames, swaps and a moved initial flag can't collide
        // with the uniqueness indexes partway through.
        await client.query(
          `UPDATE lhoraire.workflow_states SET name = 'tmp-' || id, is_initial = false WHERE issue_type_id = $1`,
          [issueTypeId],
        );
        const ids = new Map();
        for (const [position, s] of input.entries()) {
          if (s.ref.startsWith('new:')) {
            const { rows } = await client.query(
              `INSERT INTO lhoraire.workflow_states (issue_type_id, name, position, is_initial, is_terminal)
               VALUES ($1, $2, $3, $4, $5) RETURNING id`,
              [issueTypeId, s.name.trim(), position, s.isInitial, s.isTerminal],
            );
            ids.set(s.ref, rows[0].id);
          } else {
            ids.set(s.ref, s.ref);
          }
        }
        for (const [position, s] of input.entries()) {
          if (s.ref.startsWith('new:')) continue;
          await client.query(
            'UPDATE lhoraire.workflow_states SET name = $2, position = $3, is_initial = $4, is_terminal = $5 WHERE id = $1',
            [s.ref, s.name.trim(), position, s.isInitial, s.isTerminal],
          );
        }
        for (const s of removed) {
          if (!perState.get(s.id)) continue;
          const to = ids.get(stateMapping[s.id]);
          const moved = await client.query(
            `UPDATE lhoraire.issues SET state_id = $2, version = version + 1, modified_at = now(), modified_by = $3
             WHERE state_id = $1 RETURNING id`,
            [s.id, to, caller.userId],
          );
          for (const row of moved.rows) {
            await addEvent(client, {
              issueId: row.id, actorId: caller.userId, kind: 'field', field: 'state',
              oldValue: s.name, newValue: byRef.get(stateMapping[s.id]).name.trim(),
            });
          }
        }
        await client.query('DELETE FROM lhoraire.workflow_transitions WHERE issue_type_id = $1', [issueTypeId]);
        if (removed.length) {
          await client.query('DELETE FROM lhoraire.workflow_states WHERE id = ANY($1)', [removed.map((s) => s.id)]);
        }
        for (const t of refs) {
          await client.query(
            'INSERT INTO lhoraire.workflow_transitions (issue_type_id, from_state_id, to_state_id) VALUES ($1, $2, $3)',
            [issueTypeId, ids.get(t.from), ids.get(t.to)],
          );
        }
        await recordChange(client, { projectId: type.project_id, kind: 'workflow_changed' });
        return { workflow: await loadWorkflow(client, issueTypeId) };
      });
    },
  };
}
