// Email updates on new blog posts (see
// migrations/1700000000012_email-subscriptions.js).

export async function findByEmail(pool, email) {
  const { rows } = await pool.query('SELECT * FROM email_subscriptions WHERE email = $1', [email]);
  return rows[0] ?? null;
}

// New pending subscription, or a fresh confirmation token on an existing
// pending one. Never touches an active row.
export async function upsertPending(pool, { email, confirmTokenHash, unsubscribeToken }) {
  const { rows } = await pool.query(
    `INSERT INTO email_subscriptions (email, confirm_token_hash, confirm_sent_at, unsubscribe_token)
     VALUES ($1, $2, now(), $3)
     ON CONFLICT (email) DO UPDATE
       SET confirm_token_hash = EXCLUDED.confirm_token_hash, confirm_sent_at = now()
       WHERE email_subscriptions.status = 'pending'
     RETURNING *`,
    [email, confirmTokenHash, unsubscribeToken],
  );
  return rows[0] ?? null;
}

// Active straight away -- a signed-in user's own verified address.
export async function upsertActive(pool, { email, userId, unsubscribeToken }) {
  const { rows } = await pool.query(
    `INSERT INTO email_subscriptions (email, status, confirmed_at, unsubscribe_token, user_id)
     VALUES ($1, 'active', now(), $2, $3)
     ON CONFLICT (email) DO UPDATE
       SET status = 'active', confirmed_at = COALESCE(email_subscriptions.confirmed_at, now()),
           confirm_token_hash = NULL, user_id = EXCLUDED.user_id
     RETURNING *`,
    [email, unsubscribeToken, userId],
  );
  return rows[0];
}

// Activates the pending subscription this token was sent for, if it was
// sent after `sentAfter` (older links have expired). Returns the row, or
// null for an unknown, used or expired token.
export async function confirm(pool, { confirmTokenHash, sentAfter }) {
  const { rows } = await pool.query(
    `UPDATE email_subscriptions
     SET status = 'active', confirmed_at = now(), confirm_token_hash = NULL
     WHERE confirm_token_hash = $1 AND status = 'pending' AND confirm_sent_at > $2
     RETURNING *`,
    [confirmTokenHash, sentAfter],
  );
  return rows[0] ?? null;
}

export async function removeByUnsubscribeToken(pool, token) {
  const { rows } = await pool.query(
    'DELETE FROM email_subscriptions WHERE unsubscribe_token = $1 RETURNING email',
    [token],
  );
  return rows[0] ?? null;
}

export async function listActive(pool) {
  const { rows } = await pool.query(
    "SELECT email, unsubscribe_token FROM email_subscriptions WHERE status = 'active' ORDER BY created_at",
  );
  return rows;
}

// Pending rows whose confirmation link has expired -- swept so an address
// that never confirmed doesn't linger.
export async function deleteExpiredPending(pool, { sentBefore }) {
  await pool.query(
    "DELETE FROM email_subscriptions WHERE status = 'pending' AND confirm_sent_at < $1",
    [sentBefore],
  );
}

// When each post was emailed, by slug (posts never emailed are absent).
export async function listSent(pool) {
  const { rows } = await pool.query('SELECT slug, sent_at FROM blog_post_mailings WHERE sent');
  return new Map(rows.map((r) => [r.slug, r.sent_at]));
}

// Marks a post as emailed. true only for the one caller that did -- that
// caller sends; a second click, or a second replica, gets false.
export async function claimSend(pool, slug) {
  const { rowCount } = await pool.query(
    `INSERT INTO blog_post_mailings (slug, sent, sent_at) VALUES ($1, true, now())
     ON CONFLICT (slug) DO UPDATE SET sent = true, sent_at = now() WHERE NOT blog_post_mailings.sent`,
    [slug],
  );
  return rowCount === 1;
}
