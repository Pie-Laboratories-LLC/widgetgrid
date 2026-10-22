// Images uploaded to the message boards (see
// migrations/1700000000015_drafts-and-images.js). The bytes live in the
// media store; these rows say whose each one is and whether it may be shown.

const COLUMNS = 'i.id, i.user_id, i.post_id::text, i.status, i.labels, i.width, i.height, i.bytes, i.created_at';

export async function create(pool, { id, userId, status, labels, width, height, bytes }) {
  await pool.query(
    `INSERT INTO board_images (id, user_id, status, labels, width, height, bytes)
     VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7)`,
    [id, userId, status, JSON.stringify(labels), width, height, bytes],
  );
}

// Uploads by a user since a time -- the upload rate limit.
export async function countByUserSince(pool, { userId, since }) {
  const { rows } = await pool.query(
    'SELECT count(*)::int AS n FROM board_images WHERE user_id = $1 AND created_at > $2',
    [userId, since],
  );
  return rows[0].n;
}

export async function findMany(pool, ids) {
  if (!ids.length) return [];
  const { rows } = await pool.query(`SELECT ${COLUMNS} FROM board_images i WHERE i.id = ANY($1::text[])`, [ids]);
  return rows;
}

// One image with whether the post using it still shows -- what serving
// the file checks.
export async function findForServing(pool, id) {
  const { rows } = await pool.query(
    `SELECT ${COLUMNS}, p.hidden_at, p.deleted_at
     FROM board_images i LEFT JOIN board_posts p ON p.id = i.post_id
     WHERE i.id = $1`,
    [id],
  );
  return rows[0] ?? null;
}

// Ties the user's not-yet-used images to the post that now uses them.
// Images already used by another post stay with that one.
export async function attachToPost(pool, { ids, userId, postId }) {
  if (!ids.length) return;
  await pool.query(
    'UPDATE board_images SET post_id = $3::bigint WHERE id = ANY($1::text[]) AND user_id = $2 AND post_id IS NULL',
    [ids, userId, postId],
  );
}

// Removes the post's images' rows, returning their ids so the files can
// be deleted too.
export async function deleteForPost(pool, postId) {
  const { rows } = await pool.query('DELETE FROM board_images WHERE post_id = $1::bigint RETURNING id', [postId]);
  return rows.map((r) => r.id);
}

// Waiting for a moderator, oldest first.
export async function listHeld(pool) {
  const { rows } = await pool.query(
    `SELECT ${COLUMNS}, u.username
     FROM board_images i JOIN users u ON u.id = i.user_id
     WHERE i.status = 'held' ORDER BY i.created_at`,
  );
  return rows;
}

export async function review(pool, { id, approve, by }) {
  const { rowCount } = await pool.query(
    `UPDATE board_images SET status = $2, reviewed_by = $3 WHERE id = $1 AND status = 'held'`,
    [id, approve ? 'ok' : 'rejected', by],
  );
  return rowCount === 1;
}
