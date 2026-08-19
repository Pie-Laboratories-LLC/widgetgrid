// Throttle state for texting the owner about an offline visitor message --
// see chatService.js's SendMessage for how these two are used together
// (check wasNotifiedSince before sending, recordNotification right after).
export async function wasNotifiedSince(pool, sinceDate) {
  const { rows } = await pool.query(
    'SELECT 1 FROM chat_notifications WHERE sent_at > $1 LIMIT 1',
    [sinceDate],
  );
  return rows.length > 0;
}

export async function recordNotification(pool) {
  await pool.query('INSERT INTO chat_notifications (sent_at) VALUES (now())');
}
