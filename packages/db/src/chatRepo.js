// visitor_id is the browser-generated localStorage UUID (see
// widgets/chat) -- there's no visitor account, so "find or create this
// visitor's chat" is the only way a chat comes into existence.
export async function findOrCreateByVisitorId(pool, visitorId) {
  const existing = await findByVisitorId(pool, visitorId);
  if (existing) return existing;

  // "chat1", "chat2", ... -- a real collision window under concurrent
  // creates doesn't matter at this scale (single owner, occasional new
  // visitors), so a plain count-then-insert is fine without a sequence.
  const { rows: countRows } = await pool.query('SELECT COUNT(*) FROM chats');
  const label = `chat${Number(countRows[0].count) + 1}`;

  const { rows } = await pool.query(
    `INSERT INTO chats (visitor_id, label) VALUES ($1, $2)
     ON CONFLICT (visitor_id) DO NOTHING
     RETURNING id, visitor_id, label, owner_last_read_at, visitor_last_read_at, created_at`,
    [visitorId, label],
  );
  // Lost the create race to a concurrent request for the same visitor_id --
  // whoever won already has the row.
  if (rows[0]) return rows[0];
  return findByVisitorId(pool, visitorId);
}

export async function findByVisitorId(pool, visitorId) {
  const { rows } = await pool.query(
    `SELECT id, visitor_id, label, owner_last_read_at, visitor_last_read_at, created_at
     FROM chats WHERE visitor_id = $1`,
    [visitorId],
  );
  return rows[0] ?? null;
}

export async function findById(pool, chatId) {
  const { rows } = await pool.query(
    `SELECT id, visitor_id, label, owner_last_read_at, visitor_last_read_at, created_at
     FROM chats WHERE id = $1`,
    [chatId],
  );
  return rows[0] ?? null;
}

// Newest-activity-first, each row annotated with whether the OWNER has
// unread messages in it (drives the bold label in widgets/chat's owner
// view) -- computed here rather than making the caller cross-reference
// listMessages per chat.
export async function listAllForOwner(pool) {
  const { rows } = await pool.query(`
    SELECT c.id, c.visitor_id, c.label, c.owner_last_read_at, c.visitor_last_read_at, c.created_at,
           m.latest_message_at,
           (m.latest_message_at IS NOT NULL
             AND (c.owner_last_read_at IS NULL OR m.latest_message_at > c.owner_last_read_at)) AS has_unread
    FROM chats c
    LEFT JOIN LATERAL (
      SELECT MAX(created_at) AS latest_message_at FROM chat_messages WHERE chat_id = c.id
    ) m ON true
    ORDER BY m.latest_message_at DESC NULLS LAST, c.created_at DESC
  `);
  return rows;
}

export async function rename(pool, chatId, label) {
  await pool.query('UPDATE chats SET label = $1 WHERE id = $2', [label, chatId]);
}

export async function markOwnerRead(pool, chatId) {
  await pool.query('UPDATE chats SET owner_last_read_at = now() WHERE id = $1', [chatId]);
}

export async function markVisitorRead(pool, chatId) {
  await pool.query('UPDATE chats SET visitor_last_read_at = now() WHERE id = $1', [chatId]);
}

export async function insertMessage(pool, { chatId, sender, body }) {
  const { rows } = await pool.query(
    `INSERT INTO chat_messages (chat_id, sender, body) VALUES ($1, $2, $3)
     RETURNING id, chat_id, sender, body, created_at`,
    [chatId, sender, body],
  );
  return rows[0];
}

// Ascending (oldest first) -- how a chat thread reads top to bottom.
// LIMIT is generous rather than cursor-paginated: this is a low-volume,
// single-owner chat feature, not a high-traffic messaging product.
export async function listMessages(pool, chatId, { limit = 200 } = {}) {
  const { rows } = await pool.query(
    `SELECT id, chat_id, sender, body, created_at
     FROM chat_messages WHERE chat_id = $1
     ORDER BY created_at ASC
     LIMIT $2`,
    [chatId, limit],
  );
  return rows;
}

// Drives the topbar badge on the owner's side: unlike the per-chat
// has_unread above, this is "is there unread ANYWHERE", regardless of
// which chat (or no chat at all) is currently open.
export async function hasUnreadAnywhereForOwner(pool) {
  const { rows } = await pool.query(`
    SELECT 1 FROM chats c
    WHERE EXISTS (
      SELECT 1 FROM chat_messages m
      WHERE m.chat_id = c.id
        AND (c.owner_last_read_at IS NULL OR m.created_at > c.owner_last_read_at)
    )
    LIMIT 1
  `);
  return rows.length > 0;
}
