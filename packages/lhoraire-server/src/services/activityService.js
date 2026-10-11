import { invalid, notFound, conflict, alreadyExists, withTransaction } from '../grpc.js';
import { recordChange } from '../changes.js';
import { addEvent } from '../events.js';
import { loadIssue, findIssueIdByKey, toProtoIssue } from './issueService.js';

// Link kinds as seen from one issue, and how each is stored: one row per
// link, with the pair's inverse derived when read.
const STORED = {
  depends_on: { kind: 'depends_on', reversed: false },
  required_by: { kind: 'depends_on', reversed: true },
  duplicates: { kind: 'duplicates', reversed: false },
  duplicated_by: { kind: 'duplicates', reversed: true },
  relates_to: { kind: 'relates_to', reversed: false },
};

function perspective(row, issueId) {
  if (row.kind === 'relates_to') return 'relates_to';
  const outgoing = row.from_issue_id === issueId;
  if (row.kind === 'depends_on') return outgoing ? 'depends_on' : 'required_by';
  return outgoing ? 'duplicates' : 'duplicated_by';
}

function toProtoComment(row) {
  return {
    id: row.id,
    issueId: row.issue_id,
    body: row.body,
    createdAt: row.created_at.toISOString(),
    createdBy: row.created_by,
    editedAt: row.edited_at?.toISOString() ?? '',
    editedBy: row.edited_by ?? '',
  };
}

async function loadLinkView(db, linkId, issueId) {
  const { rows } = await db.query(
    `SELECT l.*, o.id AS other_id, o.number AS other_number, o.summary AS other_summary, p.key AS other_project_key
     FROM lhoraire.issue_links l
     JOIN lhoraire.issues o ON o.id = CASE WHEN l.from_issue_id = $2 THEN l.to_issue_id ELSE l.from_issue_id END
     JOIN lhoraire.projects p ON p.id = o.project_id
     WHERE l.id = $1`,
    [linkId, issueId],
  );
  return rows[0];
}

function toProtoLink(row, issueId) {
  return {
    id: row.id,
    kind: perspective(row, issueId),
    otherIssueId: row.other_id,
    otherIssueKey: `${row.other_project_key}-${row.other_number}`,
    otherIssueSummary: row.other_summary,
    createdAt: row.created_at.toISOString(),
    createdBy: row.created_by,
  };
}

function checkBody(body) {
  if (!body.trim()) throw invalid('A comment needs some text.');
  return body;
}

export function createActivityHandlers({ pool }) {
  return {
    async ListComments({ issueId }) {
      await loadIssue(pool, issueId);
      const { rows } = await pool.query('SELECT * FROM lhoraire.comments WHERE issue_id = $1 ORDER BY created_at, id', [issueId]);
      return { comments: rows.map(toProtoComment) };
    },

    async AddComment({ issueId, body }, caller) {
      checkBody(body);
      return withTransaction(pool, async (client) => {
        const issue = await loadIssue(client, issueId);
        const { rows } = await client.query(
          'INSERT INTO lhoraire.comments (issue_id, body, created_by) VALUES ($1, $2, $3) RETURNING *',
          [issueId, body, caller.userId],
        );
        await addEvent(client, { issueId, actorId: caller.userId, kind: 'comment_added', newValue: { commentId: rows[0].id } });
        await recordChange(client, { projectId: issue.project_id, issueId, kind: 'comments_changed' });
        return { comment: toProtoComment(rows[0]) };
      });
    },

    async EditComment({ id, body }, caller) {
      checkBody(body);
      return withTransaction(pool, async (client) => {
        const before = await client.query('SELECT * FROM lhoraire.comments WHERE id = $1 FOR UPDATE', [id]);
        if (!before.rows[0]) throw notFound('That comment no longer exists.');
        if (before.rows[0].body === body) return { comment: toProtoComment(before.rows[0]) };
        const { rows } = await client.query(
          'UPDATE lhoraire.comments SET body = $2, edited_at = now(), edited_by = $3 WHERE id = $1 RETURNING *',
          [id, body, caller.userId],
        );
        const issue = await loadIssue(client, rows[0].issue_id);
        await addEvent(client, {
          issueId: issue.id, actorId: caller.userId, kind: 'comment_edited',
          oldValue: { commentId: id, body: before.rows[0].body }, newValue: { commentId: id, body },
        });
        await recordChange(client, { projectId: issue.project_id, issueId: issue.id, kind: 'comments_changed' });
        return { comment: toProtoComment(rows[0]) };
      });
    },

    async ListLinks({ issueId }) {
      await loadIssue(pool, issueId);
      const { rows } = await pool.query(
        'SELECT id FROM lhoraire.issue_links WHERE from_issue_id = $1 OR to_issue_id = $1 ORDER BY created_at, id',
        [issueId],
      );
      const links = [];
      for (const r of rows) links.push(toProtoLink(await loadLinkView(pool, r.id, issueId), issueId));
      return { links };
    },

    async AddLink({ issueId, kind, otherIssueId, otherIssueKey }, caller) {
      const stored = STORED[kind];
      if (!stored) throw invalid(`Link kind must be one of: ${Object.keys(STORED).join(', ')}.`);
      return withTransaction(pool, async (client) => {
        const issue = await loadIssue(client, issueId);
        const otherId = otherIssueId || (otherIssueKey ? await findIssueIdByKey(client, otherIssueKey) : null);
        if (!otherId) throw invalid('Choose the issue to link to.');
        const other = await loadIssue(client, otherId);
        if (other.id === issue.id) throw invalid("An issue can't link to itself.");

        let from = stored.reversed ? other.id : issue.id;
        let to = stored.reversed ? issue.id : other.id;
        if (stored.kind === 'relates_to' && from > to) [from, to] = [to, from];
        const existing = await client.query(
          `SELECT kind, from_issue_id FROM lhoraire.issue_links
           WHERE kind = $1 AND ((from_issue_id = $2 AND to_issue_id = $3) OR (from_issue_id = $3 AND to_issue_id = $2))`,
          [stored.kind, from, to],
        );
        if (existing.rows[0]) {
          const same = existing.rows[0].from_issue_id === from;
          if (same) throw alreadyExists('Those two issues are already linked that way.');
          // The same kind exists the other way round: A depends on B while
          // B depends on A makes no sense, nor does a mutual duplicate.
          const keyOf = (issueRowId) => toProtoIssue(issueRowId === issue.id ? issue : other).key;
          const verb = stored.kind === 'depends_on' ? 'already depends on' : 'is already a duplicate of';
          throw conflict(`${keyOf(to)} ${verb} ${keyOf(from)}.`);
        }
        const { rows } = await client.query(
          'INSERT INTO lhoraire.issue_links (from_issue_id, to_issue_id, kind, created_by) VALUES ($1, $2, $3, $4) RETURNING id',
          [from, to, stored.kind, caller.userId],
        );
        const view = await loadLinkView(client, rows[0].id, issue.id);
        const otherView = await loadLinkView(client, rows[0].id, other.id);
        for (const [subject, v] of [[issue, view], [other, otherView]]) {
          const link = toProtoLink(v, subject.id);
          await addEvent(client, { issueId: subject.id, actorId: caller.userId, kind: 'link_added', newValue: { kind: link.kind, issue: link.otherIssueKey } });
        }
        // Both ends, so each issue's open dialog hears about it.
        for (const end of [issue, other]) {
          await recordChange(client, { projectId: end.project_id, issueId: end.id, kind: 'links_changed' });
        }
        return { link: toProtoLink(view, issue.id) };
      });
    },

    async RemoveLink({ id }, caller) {
      return withTransaction(pool, async (client) => {
        const { rows } = await client.query('SELECT * FROM lhoraire.issue_links WHERE id = $1 FOR UPDATE', [id]);
        if (!rows[0]) throw notFound('That link no longer exists.');
        const ends = [rows[0].from_issue_id, rows[0].to_issue_id];
        const views = [];
        for (const issueId of ends) views.push([issueId, toProtoLink(await loadLinkView(client, id, issueId), issueId)]);
        await client.query('DELETE FROM lhoraire.issue_links WHERE id = $1', [id]);
        for (const [issueId, link] of views) {
          await addEvent(client, { issueId, actorId: caller.userId, kind: 'link_removed', oldValue: { kind: link.kind, issue: link.otherIssueKey } });
          await recordChange(client, { projectId: (await loadIssue(client, issueId)).project_id, issueId, kind: 'links_changed' });
        }
        return {};
      });
    },

    async GetIssueHistory({ issueId }) {
      await loadIssue(pool, issueId);
      const { rows } = await pool.query(
        `SELECT e.*, u.email FROM lhoraire.issue_events e JOIN public.users u ON u.id = e.actor_id
         WHERE e.issue_id = $1 ORDER BY e.id`,
        [issueId],
      );
      return {
        events: rows.map((e) => ({
          id: String(e.id),
          at: e.at.toISOString(),
          actorId: e.actor_id,
          actorEmail: e.email,
          kind: e.kind,
          field: e.field ?? '',
          oldValueJson: JSON.stringify(e.old_value),
          newValueJson: JSON.stringify(e.new_value),
        })),
      };
    },
  };
}
