import { notFound } from '../grpc.js';

// Kinds recorded without an issue id that may still affect any one issue
// in the project (bulk reassigns, deletes, moves, workflow edits).
const BULK_KINDS = new Set([
  'issues_changed', 'issues_deleted', 'issues_moved_out', 'issues_moved_in',
  'workflow_changed', 'issue_type_changed', 'project_updated', 'project_deleted',
]);
// More missed changes than this = cheaper to reload than to replay.
const MAX_REPLAY = 1000;

const toEvent = (row) => ({
  seq: Number(row.id ?? row.seq),
  kind: row.kind,
  projectId: row.project_id ?? row.projectId ?? '',
  issueId: row.issue_id ?? row.issueId ?? '',
});

// Streams changes matching `matches` to one gRPC call: hello, then the
// replay after afterSeq (or resync_required if it can't), then live
// changes, with a heartbeat to keep idle proxies from cutting the stream.
// The hub subscription starts before the replay query, so a change that
// commits in between is delivered (once) rather than lost.
async function stream({ pool, hub, call, afterSeq, matches, replaySql, replayParams, heartbeatMs }) {
  const buffered = [];
  let live = false;
  // Replayed seqs, to skip the same change arriving again from the buffer.
  // Only needed for that overlap; dropped once the buffer is flushed.
  let replayed = new Set();
  let closed = false;

  const write = (event) => {
    if (!closed) call.write(event);
  };
  const deliver = (change) => {
    const event = toEvent(change);
    if (!matches(event) || replayed?.has(event.seq)) return;
    write(event);
  };
  const unsubscribe = hub.subscribe(
    (change) => (live ? deliver(change) : buffered.push(change)),
    () => write({ seq: 0, kind: 'resync_required', projectId: '', issueId: '' }),
  );
  const heartbeat = setInterval(() => write({ seq: 0, kind: 'heartbeat', projectId: '', issueId: '' }), heartbeatMs);
  heartbeat.unref?.();
  const close = () => {
    closed = true;
    clearInterval(heartbeat);
    unsubscribe();
  };
  call.on('cancelled', close);
  call.on('close', close);
  call.on('error', close);

  const bounds = await pool.query('SELECT coalesce(min(id), 0)::bigint AS lo, coalesce(max(id), 0)::bigint AS hi FROM lhoraire.changes');
  const lo = Number(bounds.rows[0].lo);
  const hi = Number(bounds.rows[0].hi);
  write({ seq: hi, kind: 'hello', projectId: '', issueId: '' });

  if (afterSeq > 0) {
    // Gone from the table (pruned) or from another database: can't replay.
    if (afterSeq > hi || (lo > 0 && afterSeq < lo - 1)) {
      write({ seq: 0, kind: 'resync_required', projectId: '', issueId: '' });
    } else {
      const { rows } = await pool.query(`${replaySql} AND id > $${replayParams.length + 1} ORDER BY id LIMIT ${MAX_REPLAY + 1}`, [...replayParams, afterSeq]);
      if (rows.length > MAX_REPLAY) write({ seq: 0, kind: 'resync_required', projectId: '', issueId: '' });
      else {
        rows.forEach(deliver);
        rows.forEach((r) => replayed.add(Number(r.id)));
      }
    }
  }
  live = true;
  buffered.forEach(deliver);
  buffered.length = 0;
  replayed = null;
}

export function createChangeHandlers({ pool, hub, heartbeatMs = 25_000 }) {
  return {
    async SubscribeProject({ projectId, afterSeq }, caller, call) {
      const { rows } = await pool.query('SELECT 1 FROM lhoraire.projects WHERE id = $1', [projectId]);
      if (!rows[0]) throw notFound('That project no longer exists.');
      await stream({
        pool, hub, call, afterSeq, heartbeatMs,
        matches: (e) => e.projectId === projectId || e.projectId === '',
        replaySql: 'SELECT * FROM lhoraire.changes WHERE (project_id = $1 OR project_id IS NULL)',
        replayParams: [projectId],
      });
    },

    async SubscribeIssue({ issueId, afterSeq }, caller, call) {
      const { rows } = await pool.query('SELECT project_id FROM lhoraire.issues WHERE id = $1', [issueId]);
      if (!rows[0]) throw notFound('That issue no longer exists.');
      const projectId = rows[0].project_id;
      await stream({
        pool, hub, call, afterSeq, heartbeatMs,
        matches: (e) => e.issueId === issueId
          || (!e.issueId && BULK_KINDS.has(e.kind) && (e.projectId === projectId || e.projectId === '')),
        replaySql: `SELECT * FROM lhoraire.changes WHERE (issue_id = $1 OR (issue_id IS NULL AND kind = ANY($3)
          AND (project_id = $2 OR project_id IS NULL)))`,
        replayParams: [issueId, projectId, [...BULK_KINDS]],
      });
    },
  };
}

// Drops changes older than the replay window; run periodically.
export async function pruneChanges(pool, keepDays = 7) {
  await pool.query(`DELETE FROM lhoraire.changes WHERE at < now() - make_interval(days => $1)`, [keepDays]);
}
