// Browsers subscribed to Web Push, per user (see
// migrations/1700000000007_push-subscriptions.js).

export async function upsert(pool, { userId, endpoint, p256dh, auth, userAgent }) {
  await pool.query(
    `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth, user_agent)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (endpoint) DO UPDATE
       SET user_id = EXCLUDED.user_id, p256dh = EXCLUDED.p256dh,
           auth = EXCLUDED.auth, user_agent = EXCLUDED.user_agent`,
    [userId, endpoint, p256dh, auth, userAgent],
  );
}

export async function removeByEndpoint(pool, endpoint) {
  await pool.query('DELETE FROM push_subscriptions WHERE endpoint = $1', [endpoint]);
}

export async function listForOwner(pool) {
  const { rows } = await pool.query(
    `SELECT s.endpoint, s.p256dh, s.auth
     FROM push_subscriptions s JOIN users u ON u.id = s.user_id
     WHERE u.role = 'owner'`,
  );
  return rows;
}

export async function markSuccess(pool, endpoint) {
  await pool.query('UPDATE push_subscriptions SET last_success_at = now() WHERE endpoint = $1', [endpoint]);
}
