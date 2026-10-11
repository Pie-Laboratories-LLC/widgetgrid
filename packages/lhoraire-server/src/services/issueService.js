import { invalid, notFound, conflict, stale, withTransaction } from '../grpc.js';
import { recordChange } from '../changes.js';
import { addEvent } from '../events.js';
import { rankAfter, rankBetween } from '../ranks.js';
import { loadWorkflow, insertWorkflow, asTemplate } from '../workflow.js';

export const SEVERITIES = ['na', 'minor', 'normal', 'serious', 'blocker'];
const KEY_PATTERN = /^([a-z][a-z0-9]{1,9})-(\d+)$/;
const SELECT_ISSUE = `SELECT i.*, p.key AS project_key FROM lhoraire.issues i JOIN lhoraire.projects p ON p.id = i.project_id`;

const has = (request, field) => Object.hasOwn(request, field);
const issueKey = (projectKey, number) => `${projectKey}-${number}`;

export function toProtoIssue(row, { withDescription = false } = {}) {
  return {
    id: row.id,
    projectId: row.project_id,
    key: issueKey(row.project_key, row.number),
    number: row.number,
    parentId: row.parent_id ?? '',
    siblingRank: row.sibling_rank,
    issueTypeId: row.issue_type_id,
    stateId: row.state_id,
    summary: row.summary,
    description: withDescription ? row.description : '',
    severity: row.severity,
    assigneeId: row.assignee_id ?? '',
    endReason: row.end_reason ?? '',
    endDescription: row.end_description ?? '',
    createdAt: row.created_at.toISOString(),
    createdBy: row.created_by,
    modifiedAt: row.modified_at.toISOString(),
    modifiedBy: row.modified_by,
    version: row.version,
  };
}

export async function loadIssue(db, id, { lock = false } = {}) {
  const { rows } = await db.query(`${SELECT_ISSUE} WHERE i.id = $1${lock ? ' FOR UPDATE OF i' : ''}`, [id]);
  if (!rows[0]) throw notFound('That issue no longer exists.');
  return rows[0];
}

// Current key first, then keys the issue had before moving project.
export async function findIssueIdByKey(db, key) {
  const normalized = key.trim().toLowerCase();
  const match = KEY_PATTERN.exec(normalized);
  if (!match) throw invalid(`"${key}" doesn't look like an issue key (like ffdb-1).`);
  const current = await db.query(
    'SELECT i.id FROM lhoraire.issues i JOIN lhoraire.projects p ON p.id = i.project_id WHERE p.key = $1 AND i.number = $2',
    [match[1], Number(match[2])],
  );
  if (current.rows[0]) return current.rows[0].id;
  const alias = await db.query('SELECT issue_id FROM lhoraire.issue_key_aliases WHERE key = $1', [normalized]);
  if (alias.rows[0]) return alias.rows[0].issue_id;
  throw notFound(`No issue ${normalized}.`);
}

export async function getState(db, stateId) {
  const { rows } = await db.query('SELECT * FROM lhoraire.workflow_states WHERE id = $1', [stateId]);
  return rows[0];
}

async function assertTypeAvailable(db, typeId, projectId) {
  const { rows } = await db.query('SELECT * FROM lhoraire.issue_types WHERE id = $1', [typeId]);
  const type = rows[0];
  if (!type) throw notFound('That issue type no longer exists.');
  if (type.project_id && type.project_id !== projectId) throw invalid(`"${type.name}" belongs to another project.`);
  return type;
}

// A new or moved child needs a parent in the same project that isn't
// closed: terminal issues are final, children included.
async function assertParentAcceptsChildren(db, parentId, projectId) {
  const { rows } = await db.query(
    `SELECT i.project_id, i.number, p.key, s.is_terminal FROM lhoraire.issues i
     JOIN lhoraire.projects p ON p.id = i.project_id JOIN lhoraire.workflow_states s ON s.id = i.state_id
     WHERE i.id = $1`,
    [parentId],
  );
  const parent = rows[0];
  if (!parent) throw notFound('The parent issue no longer exists.');
  if (parent.project_id !== projectId) throw invalid('The parent issue is in another project.');
  if (parent.is_terminal) throw conflict(`${issueKey(parent.key, parent.number)} is closed, so it can't take new children.`);
}

async function assertUser(db, userId) {
  const { rows } = await db.query('SELECT email FROM public.users WHERE id = $1', [userId]);
  if (!rows[0]) throw invalid('That person has never signed in, so they can\'t be assigned.');
  return rows[0].email;
}

async function userEmail(db, userId) {
  if (!userId) return null;
  const { rows } = await db.query('SELECT email FROM public.users WHERE id = $1', [userId]);
  return rows[0]?.email ?? userId;
}

function checkSummary(summary) {
  const trimmed = summary.trim();
  if (!trimmed) throw invalid('Give the issue a summary.');
  if (trimmed.length > 256) throw invalid(`Summaries are at most 256 characters (this one is ${trimmed.length}).`);
  return trimmed;
}

function checkSeverity(severity) {
  if (!SEVERITIES.includes(severity)) throw invalid(`Severity must be one of: ${SEVERITIES.join(', ')}.`);
  return severity;
}

function checkVersion(issue, version) {
  if (issue.version !== version) throw stale();
}

async function siblingRanks(db, projectId, parentId, excludeId = null) {
  const { rows } = await db.query(
    `SELECT id, sibling_rank FROM lhoraire.issues
     WHERE project_id = $1 AND parent_id IS NOT DISTINCT FROM $2 AND id IS DISTINCT FROM $3
     ORDER BY sibling_rank`,
    [projectId, parentId, excludeId],
  );
  return rows;
}

export function createIssueHandlers({ pool }) {
  return {
    async ListUsers() {
      const { rows } = await pool.query('SELECT id, email FROM public.users ORDER BY lower(email)');
      return { users: rows };
    },

    async ListIssues({ projectId }) {
      const { rows } = await pool.query(`${SELECT_ISSUE} WHERE i.project_id = $1 ORDER BY i.parent_id NULLS FIRST, i.sibling_rank`, [projectId]);
      return { issues: rows.map((r) => toProtoIssue(r)) };
    },

    async GetIssue({ id, key }) {
      const issueId = id || (key ? await findIssueIdByKey(pool, key) : null);
      if (!issueId) throw invalid('Give an issue id or key.');
      return { issue: toProtoIssue(await loadIssue(pool, issueId), { withDescription: true }) };
    },

    async CreateIssue({ projectId, parentId, issueTypeId, summary, description, severity, assigneeId }, caller) {
      const cleanSummary = checkSummary(summary);
      const cleanSeverity = checkSeverity(severity || 'normal');
      return withTransaction(pool, async (client) => {
        // Locks the project row too, so numbers are handed out one at a time.
        const numbered = await client.query(
          `UPDATE lhoraire.projects SET next_issue_number = next_issue_number + 1
           WHERE id = $1 RETURNING next_issue_number - 1 AS number, key`,
          [projectId],
        );
        if (!numbered.rows[0]) throw notFound('That project no longer exists.');
        if (parentId) await assertParentAcceptsChildren(client, parentId, projectId);
        await assertTypeAvailable(client, issueTypeId, projectId);
        if (assigneeId) await assertUser(client, assigneeId);
        const initial = await client.query(
          'SELECT id FROM lhoraire.workflow_states WHERE issue_type_id = $1 AND is_initial',
          [issueTypeId],
        );
        const last = (await siblingRanks(client, projectId, parentId || null)).at(-1)?.sibling_rank ?? '';
        const { rows } = await client.query(
          `INSERT INTO lhoraire.issues (project_id, number, parent_id, sibling_rank, issue_type_id, state_id,
             summary, description, severity, assignee_id, created_by, modified_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $11) RETURNING id`,
          [projectId, numbered.rows[0].number, parentId || null, rankAfter(last), issueTypeId, initial.rows[0].id,
            cleanSummary, description, cleanSeverity, assigneeId || null, caller.userId],
        );
        const issueId = rows[0].id;
        await addEvent(client, { issueId, actorId: caller.userId, kind: 'created' });
        await recordChange(client, { projectId, issueId, kind: 'issue_created' });
        return { issue: toProtoIssue(await loadIssue(client, issueId), { withDescription: true }) };
      });
    },

    async UpdateIssue(request, caller) {
      return withTransaction(pool, async (client) => {
        const issue = await loadIssue(client, request.id, { lock: true });
        checkVersion(issue, request.version);
        const sets = [];
        const params = [issue.id];
        const events = [];
        const set = (column, value, field, oldValue, newValue) => {
          params.push(value);
          sets.push(`${column} = $${params.length}`);
          if (field) events.push({ field, oldValue, newValue });
        };

        if (has(request, 'summary')) {
          const summary = checkSummary(request.summary);
          if (summary !== issue.summary) set('summary', summary, 'summary', issue.summary, summary);
        }
        if (has(request, 'description') && request.description !== issue.description) {
          set('description', request.description, 'description', issue.description, request.description);
        }
        if (has(request, 'severity')) {
          const severity = checkSeverity(request.severity);
          if (severity !== issue.severity) set('severity', severity, 'severity', issue.severity, severity);
        }
        if (has(request, 'assigneeId') && (request.assigneeId || null) !== issue.assignee_id) {
          const state = await getState(client, issue.state_id);
          if (!request.assigneeId && state.is_terminal) throw conflict("A closed issue can't be unassigned.");
          const newEmail = request.assigneeId ? await assertUser(client, request.assigneeId) : null;
          set('assignee_id', request.assigneeId || null, 'assignee', await userEmail(client, issue.assignee_id), newEmail);
        }
        if (has(request, 'issueTypeId') && request.issueTypeId !== issue.issue_type_id) {
          const newType = await assertTypeAvailable(client, request.issueTypeId, issue.project_id);
          if (!request.stateIdInNewType) throw invalid(`Choose a state from "${newType.name}" for the issue.`);
          const fromState = await getState(client, issue.state_id);
          const toState = await getState(client, request.stateIdInNewType);
          if (!toState || toState.issue_type_id !== newType.id) throw invalid(`Choose a state from "${newType.name}" for the issue.`);
          if (toState.is_terminal !== fromState.is_terminal) {
            throw invalid(fromState.is_terminal
              ? 'The issue is closed: pick a terminal state of the new type.'
              : "The issue is open: pick a state of the new type that isn't terminal.");
          }
          const oldType = await client.query('SELECT name FROM lhoraire.issue_types WHERE id = $1', [issue.issue_type_id]);
          set('issue_type_id', newType.id, 'issue_type', oldType.rows[0].name, newType.name);
          set('state_id', toState.id, 'state', fromState.name, toState.name);
        }

        if (sets.length === 0) return { issue: toProtoIssue(issue, { withDescription: true }) };
        params.push(caller.userId);
        await client.query(
          `UPDATE lhoraire.issues SET ${sets.join(', ')}, version = version + 1, modified_at = now(), modified_by = $${params.length}
           WHERE id = $1`,
          params,
        );
        for (const e of events) await addEvent(client, { issueId: issue.id, actorId: caller.userId, kind: 'field', ...e });
        await recordChange(client, { projectId: issue.project_id, issueId: issue.id, kind: 'issue_updated' });
        return { issue: toProtoIssue(await loadIssue(client, issue.id), { withDescription: true }) };
      });
    },

    async MoveIssue({ id, newParentId, afterSiblingId }, caller) {
      return withTransaction(pool, async (client) => {
        const issue = await loadIssue(client, id, { lock: true });
        const parentId = newParentId || null;
        if (parentId) {
          if (parentId === issue.id) throw invalid("An issue can't be its own parent.");
          const cycle = await client.query(
            `WITH RECURSIVE sub AS (
               SELECT id FROM lhoraire.issues WHERE id = $1
               UNION SELECT i.id FROM lhoraire.issues i JOIN sub ON i.parent_id = sub.id
             ) SELECT 1 FROM sub WHERE id = $2`,
            [issue.id, parentId],
          );
          if (cycle.rows[0]) throw invalid("An issue can't move under one of its own descendants.");
          if (parentId !== issue.parent_id) await assertParentAcceptsChildren(client, parentId, issue.project_id);
        }
        const siblings = await siblingRanks(client, issue.project_id, parentId, issue.id);
        let rank;
        if (!afterSiblingId) {
          rank = rankBetween('', siblings[0]?.sibling_rank ?? null);
        } else {
          const at = siblings.findIndex((s) => s.id === afterSiblingId);
          if (at < 0) throw invalid('The issue to place it after is not under that parent.');
          rank = rankBetween(siblings[at].sibling_rank, siblings[at + 1]?.sibling_rank ?? null);
        }
        await client.query(
          `UPDATE lhoraire.issues SET parent_id = $2, sibling_rank = $3, version = version + 1, modified_at = now(), modified_by = $4
           WHERE id = $1`,
          [issue.id, parentId, rank, caller.userId],
        );
        if (parentId !== issue.parent_id) {
          const keyOf = async (pid) => (pid ? toProtoIssue(await loadIssue(client, pid)).key : null);
          await addEvent(client, {
            issueId: issue.id, actorId: caller.userId, kind: 'field', field: 'parent',
            oldValue: await keyOf(issue.parent_id), newValue: await keyOf(parentId),
          });
        }
        await recordChange(client, { projectId: issue.project_id, issueId: issue.id, kind: 'issue_moved' });
        return { issue: toProtoIssue(await loadIssue(client, issue.id)) };
      });
    },

    async DeleteIssues({ issueIds }) {
      if (!issueIds.length) return { deleted: 0 };
      return withTransaction(pool, async (client) => {
        const { rows } = await client.query(
          `WITH RECURSIVE doomed AS (
             SELECT id, project_id FROM lhoraire.issues WHERE id = ANY($1)
             UNION SELECT i.id, i.project_id FROM lhoraire.issues i JOIN doomed d ON i.parent_id = d.id
           ) SELECT count(*)::int AS n, coalesce(array_agg(DISTINCT project_id), '{}') AS projects FROM doomed`,
          [issueIds],
        );
        await client.query('DELETE FROM lhoraire.issues WHERE id = ANY($1)', [issueIds]);
        for (const projectId of rows[0].projects) await recordChange(client, { projectId, kind: 'issues_deleted' });
        return { deleted: rows[0].n };
      });
    },

    async MoveIssuesToProject({ issueIds, targetProjectId }, caller) {
      if (!issueIds.length) return { newKeys: {} };
      return withTransaction(pool, async (client) => {
        const target = await client.query('SELECT * FROM lhoraire.projects WHERE id = $1 FOR UPDATE', [targetProjectId]);
        if (!target.rows[0]) throw notFound('That project no longer exists.');
        const targetKey = target.rows[0].key;

        // Roots = selected issues with no selected ancestor; everything
        // under them comes along.
        const { rows: moving } = await client.query(
          `WITH RECURSIVE ancestors AS (
             SELECT id AS issue_id, parent_id FROM lhoraire.issues WHERE id = ANY($1)
             UNION SELECT a.issue_id, i.parent_id FROM ancestors a JOIN lhoraire.issues i ON i.id = a.parent_id
           ),
           roots AS (
             SELECT s.id FROM lhoraire.issues s WHERE s.id = ANY($1)
             AND NOT EXISTS (SELECT 1 FROM ancestors a WHERE a.issue_id = s.id AND a.parent_id = ANY($1))
           ),
           tree AS (
             SELECT i.id, true AS is_root FROM lhoraire.issues i JOIN roots r ON r.id = i.id
             UNION SELECT i.id, false FROM lhoraire.issues i JOIN tree t ON i.parent_id = t.id
           )
           SELECT i.*, p.key AS project_key, t.is_root FROM tree t
           JOIN lhoraire.issues i ON i.id = t.id JOIN lhoraire.projects p ON p.id = i.project_id
           ORDER BY p.key, i.number FOR UPDATE OF i`,
          [issueIds],
        );
        const found = new Set(moving.map((m) => m.id));
        if (issueIds.some((id) => !found.has(id))) throw notFound('Some of those issues no longer exist.');
        if (moving.some((m) => m.is_root && m.project_id === targetProjectId)) {
          throw invalid(`Some of those issues are already in ${targetKey}.`);
        }

        // Project-specific types come along as copies, unless the target
        // already has a type with that name.
        const typeIds = [...new Set(moving.map((m) => m.issue_type_id))];
        const { rows: types } = await client.query(
          'SELECT * FROM lhoraire.issue_types WHERE id = ANY($1) AND project_id IS NOT NULL',
          [typeIds],
        );
        const clashes = (await client.query(
          `SELECT name FROM lhoraire.issue_types WHERE project_id = $1 AND lower(name) = ANY($2)`,
          [targetProjectId, types.map((t) => t.name.toLowerCase())],
        )).rows.map((r) => r.name);
        if (clashes.length) {
          throw conflict(`${targetKey} already has its own type named ${clashes.map((n) => `"${n}"`).join(', ')}. Rename one, or change these issues' type first.`);
        }
        const typeMap = new Map();
        const stateMap = new Map();
        for (const type of types) {
          const copy = await client.query(
            `INSERT INTO lhoraire.issue_types (project_id, name, icon, color) VALUES ($1, $2, $3, $4) RETURNING id`,
            [targetProjectId, type.name, type.icon, type.color],
          );
          typeMap.set(type.id, copy.rows[0].id);
          const ids = await insertWorkflow(client, copy.rows[0].id, asTemplate(await loadWorkflow(client, type.id)));
          for (const [oldStateId, newStateId] of ids) stateMap.set(oldStateId, newStateId);
        }

        let next = target.rows[0].next_issue_number;
        let lastRootRank = (await siblingRanks(client, targetProjectId, null)).at(-1)?.sibling_rank ?? '';
        const newKeys = {};
        const sourceProjects = new Set();
        for (const m of moving) {
          const oldKey = issueKey(m.project_key, m.number);
          const newKey = issueKey(targetKey, next);
          sourceProjects.add(m.project_id);
          let rank = m.sibling_rank;
          if (m.is_root) {
            lastRootRank = rankAfter(lastRootRank);
            rank = lastRootRank;
          }
          await client.query(
            `UPDATE lhoraire.issues SET project_id = $2, number = $3, parent_id = $4, sibling_rank = $5,
               issue_type_id = $6, state_id = $7, version = version + 1, modified_at = now(), modified_by = $8
             WHERE id = $1`,
            [m.id, targetProjectId, next, m.is_root ? null : m.parent_id, rank,
              typeMap.get(m.issue_type_id) ?? m.issue_type_id, stateMap.get(m.state_id) ?? m.state_id, caller.userId],
          );
          await client.query('INSERT INTO lhoraire.issue_key_aliases (key, issue_id) VALUES ($1, $2)', [oldKey, m.id]);
          await addEvent(client, { issueId: m.id, actorId: caller.userId, kind: 'field', field: 'key', oldValue: oldKey, newValue: newKey });
          newKeys[oldKey] = newKey;
          next += 1;
        }
        await client.query('UPDATE lhoraire.projects SET next_issue_number = $2 WHERE id = $1', [targetProjectId, next]);
        if (types.length) await recordChange(client, { projectId: targetProjectId, kind: 'issue_type_changed' });
        for (const projectId of sourceProjects) await recordChange(client, { projectId, kind: 'issues_moved_out' });
        await recordChange(client, { projectId: targetProjectId, kind: 'issues_moved_in' });
        return { newKeys };
      });
    },
  };
}
