// Message boards (see migrations/1700000000014_message-board.js). Ids are
// bigint in Postgres and handled as strings here -- they leave as strings
// over gRPC too, past JavaScript's safe-integer range concerns.

const POST_COLUMNS = `p.id::text, p.section_id, p.thread_id::text, p.parent_id::text, p.author_id, p.title,
  p.body, p.notify_replies, p.created_at, p.edited_at, p.deleted_at, p.hidden_at, p.reply_count,
  p.last_reply_at, u.username AS author_username,
  EXISTS (SELECT 1 FROM board_bans b WHERE b.user_id = p.author_id) AS author_banned`;

export async function listSections(pool) {
  const { rows } = await pool.query(
    `SELECT s.id, s.slug, s.name, s.description,
       (SELECT count(*)::int FROM board_posts p
        WHERE p.section_id = s.id AND p.parent_id IS NULL AND p.hidden_at IS NULL) AS thread_count
     FROM board_sections s ORDER BY s.sort_order, s.name`,
  );
  return rows;
}

export async function findSectionBySlug(pool, slug) {
  const { rows } = await pool.query('SELECT id, slug, name, description FROM board_sections WHERE slug = $1', [slug]);
  return rows[0] ?? null;
}

export async function findSectionById(pool, id) {
  const { rows } = await pool.query('SELECT id, slug, name, description FROM board_sections WHERE id = $1', [id]);
  return rows[0] ?? null;
}

// Newest first, `limit` at a time; `before` (a thread id) continues a
// listing from where the previous page ended. Hidden threads only for
// moderators.
export async function listThreads(pool, { sectionId, before = null, limit = 30, includeHidden = false }) {
  const { rows } = await pool.query(
    `SELECT ${POST_COLUMNS}
     FROM board_posts p JOIN users u ON u.id = p.author_id
     WHERE p.section_id = $1 AND p.parent_id IS NULL
       AND ($2::bigint IS NULL OR p.id < $2::bigint)
       AND ($4 OR p.hidden_at IS NULL)
     ORDER BY p.id DESC
     LIMIT $3`,
    [sectionId, before, limit, includeHidden],
  );
  return rows;
}

// The thread post and every reply under it, thread post first, replies
// newest first (the client builds the tree from parent_id).
export async function getThread(pool, threadId) {
  const { rows } = await pool.query(
    `SELECT ${POST_COLUMNS}
     FROM board_posts p JOIN users u ON u.id = p.author_id
     WHERE p.id = $1::bigint OR p.thread_id = $1::bigint
     ORDER BY (p.parent_id IS NULL) DESC, p.id DESC`,
    [threadId],
  );
  return rows[0]?.parent_id === null ? rows : [];
}

export async function getPost(pool, id) {
  const { rows } = await pool.query(
    `SELECT ${POST_COLUMNS} FROM board_posts p JOIN users u ON u.id = p.author_id WHERE p.id = $1::bigint`,
    [id],
  );
  return rows[0] ?? null;
}

export async function createThread(pool, { sectionId, authorId, title, body, notifyReplies }) {
  const { rows } = await pool.query(
    `INSERT INTO board_posts (section_id, author_id, title, body, notify_replies)
     VALUES ($1, $2, $3, $4, $5) RETURNING id::text`,
    [sectionId, authorId, title, body, notifyReplies],
  );
  return rows[0].id;
}

// The reply, and the thread's reply count/last-reply time, together.
export async function createReply(pool, { parent, authorId, body, notifyReplies }) {
  const threadId = parent.thread_id ?? parent.id;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO board_posts (section_id, thread_id, parent_id, author_id, body, notify_replies)
       VALUES ($1, $2::bigint, $3::bigint, $4, $5, $6) RETURNING id::text`,
      [parent.section_id, threadId, parent.id, authorId, body, notifyReplies],
    );
    await client.query(
      'UPDATE board_posts SET reply_count = reply_count + 1, last_reply_at = now() WHERE id = $1::bigint',
      [threadId],
    );
    await client.query('COMMIT');
    return rows[0].id;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

export async function editPost(pool, { id, title, body }) {
  await pool.query(
    `UPDATE board_posts SET body = $2, title = CASE WHEN parent_id IS NULL THEN COALESCE($3, title) ELSE NULL END,
       edited_at = now()
     WHERE id = $1::bigint`,
    [id, body, title],
  );
}

// An author deleting their own post. With replies under it, it stays in
// place as "[deleted]" (its text erased) so the thread still reads;
// without, it goes entirely -- and a thread post with no replies takes
// its thread with it. Returns 'soft' or 'hard'.
export async function deletePost(pool, id) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: [post] } = await client.query(
      'SELECT id::text, thread_id::text FROM board_posts WHERE id = $1::bigint FOR UPDATE',
      [id],
    );
    if (!post) {
      await client.query('ROLLBACK');
      return null;
    }
    const { rows: [{ has_replies: hasReplies }] } = await client.query(
      'SELECT EXISTS (SELECT 1 FROM board_posts WHERE parent_id = $1::bigint) AS has_replies',
      [id],
    );
    let outcome;
    if (hasReplies) {
      await client.query(
        `UPDATE board_posts SET deleted_at = now(), body = '', notify_replies = false,
           title = CASE WHEN parent_id IS NULL THEN '[deleted]' ELSE NULL END
         WHERE id = $1::bigint`,
        [id],
      );
      outcome = 'soft';
    } else {
      await client.query('DELETE FROM board_posts WHERE id = $1::bigint', [id]);
      if (post.thread_id) {
        await client.query(
          'UPDATE board_posts SET reply_count = greatest(reply_count - 1, 0) WHERE id = $1::bigint',
          [post.thread_id],
        );
      }
      outcome = 'hard';
    }
    await client.query('COMMIT');
    return outcome;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

export async function setNotifyReplies(pool, { id, enabled }) {
  await pool.query('UPDATE board_posts SET notify_replies = $2 WHERE id = $1::bigint', [id, enabled]);
}

export async function setHidden(pool, { id, hidden, by }) {
  await pool.query(
    'UPDATE board_posts SET hidden_at = CASE WHEN $2 THEN now() ELSE NULL END, hidden_by = CASE WHEN $2 THEN $3::uuid ELSE NULL END WHERE id = $1::bigint',
    [id, hidden, by],
  );
}

export async function isBanned(pool, userId) {
  const { rows } = await pool.query('SELECT 1 FROM board_bans WHERE user_id = $1', [userId]);
  return rows.length > 0;
}

export async function setBanned(pool, { userId, banned, by, reason = '' }) {
  if (banned) {
    await pool.query(
      `INSERT INTO board_bans (user_id, banned_by, reason) VALUES ($1, $2, $3)
       ON CONFLICT (user_id) DO UPDATE SET banned_by = EXCLUDED.banned_by, reason = EXCLUDED.reason, created_at = now()`,
      [userId, by, reason],
    );
  } else {
    await pool.query('DELETE FROM board_bans WHERE user_id = $1', [userId]);
  }
}

// For the flood limit: how many posts this user made since `since`.
export async function countPostsSince(pool, { authorId, since }) {
  const { rows } = await pool.query(
    'SELECT count(*)::int AS n FROM board_posts WHERE author_id = $1 AND created_at > $2',
    [authorId, since],
  );
  return rows[0].n;
}

export async function findUserByUsername(pool, username) {
  const { rows } = await pool.query('SELECT id, email, username, role FROM users WHERE lower(username) = lower($1)', [username]);
  return rows[0] ?? null;
}

export async function findUserById(pool, id) {
  const { rows } = await pool.query('SELECT id, email, username, role FROM users WHERE id = $1', [id]);
  return rows[0] ?? null;
}
