// Usernames and registration-time reservations (see
// migrations/1700000000013_usernames.js). Every comparison is on the
// lowercased name.

// Free means: no user has it, and no live reservation holds it for a
// different email (the same email may re-register and keep its claim).
export async function isAvailable(pool, { username, email = '', reservedAfter }) {
  const { rows } = await pool.query(
    `SELECT
       EXISTS (SELECT 1 FROM users WHERE lower(username) = lower($1)) AS taken,
       EXISTS (SELECT 1 FROM username_reservations
               WHERE username_key = lower($1) AND email <> lower($2) AND created_at > $3) AS reserved`,
    [username, email, reservedAfter],
  );
  return !rows[0].taken && !rows[0].reserved;
}

// Claims the name for this email, replacing an expired or same-email
// reservation. false if someone else's live reservation or an existing
// user already has it -- the race-safe check, since isAvailable alone
// can't stop two registrations interleaving.
export async function reserve(pool, { username, email, reservedAfter }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: taken } = await client.query('SELECT 1 FROM users WHERE lower(username) = lower($1)', [username]);
    if (taken.length) {
      await client.query('ROLLBACK');
      return false;
    }
    // A registration replaces any earlier reservation for the same email
    // (they changed their mind about the name).
    await client.query('DELETE FROM username_reservations WHERE email = lower($1) AND username_key <> lower($2)', [email, username]);
    const { rowCount } = await client.query(
      `INSERT INTO username_reservations (username_key, username, email)
       VALUES (lower($1), $1, lower($2))
       ON CONFLICT (username_key) DO UPDATE
         SET username = EXCLUDED.username, email = EXCLUDED.email, created_at = now()
         WHERE username_reservations.email = EXCLUDED.email OR username_reservations.created_at <= $3`,
      [username, email, reservedAfter],
    );
    await client.query(rowCount === 1 ? 'COMMIT' : 'ROLLBACK');
    return rowCount === 1;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

// Sets a user's username if they have none yet and it's free, consuming
// any reservation for it. Returns the username now on the row (theirs
// already, the new one, or null if it was taken).
export async function claimForUser(pool, { userId, username, email, reservedAfter }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: [user] } = await client.query('SELECT username FROM users WHERE id = $1 FOR UPDATE', [userId]);
    if (user?.username) {
      await client.query('COMMIT');
      return user.username;
    }
    const { rows: [held] } = await client.query(
      'SELECT email FROM username_reservations WHERE username_key = lower($1) AND created_at > $2',
      [username, reservedAfter],
    );
    if (held && held.email !== email.toLowerCase()) {
      await client.query('ROLLBACK');
      return null;
    }
    try {
      await client.query('UPDATE users SET username = $2 WHERE id = $1', [userId, username]);
    } catch (err) {
      if (err.code === '23505') { // unique violation: another user has it
        await client.query('ROLLBACK');
        return null;
      }
      throw err;
    }
    await client.query('DELETE FROM username_reservations WHERE username_key = lower($1)', [username]);
    await client.query('COMMIT');
    return username;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

// The live reservation an email made at registration, if any.
export async function findReservationByEmail(pool, { email, reservedAfter }) {
  const { rows } = await pool.query(
    'SELECT username FROM username_reservations WHERE email = lower($1) AND created_at > $2 ORDER BY created_at DESC LIMIT 1',
    [email, reservedAfter],
  );
  return rows[0]?.username ?? null;
}
