// A code allows exactly one verification attempt, success or failure --
// VerifyLoginCode (see authService.js) consumes it either way. That's the
// actual brute-force protection here (not code_hash's SHA-256 alone,
// which is fine for a short-lived, single-use, low-entropy code but
// wouldn't be for anything reused/long-lived): a wrong guess burns the
// code, forcing a fresh RequestLoginCode call -- one guess per text
// message sent, not a race against the 5-minute expiry.
export async function createLoginCode(pool, { codeHash, expiresAt }) {
  const { rows } = await pool.query(
    `INSERT INTO login_codes (code_hash, expires_at) VALUES ($1, $2)
     RETURNING id`,
    [codeHash, expiresAt],
  );
  return rows[0].id;
}

// Deliberately NOT "find by hash match": that would let a wrong guess
// leave the real code untouched (still guessable again), defeating the
// one-guess-per-code protection described above. This returns whatever
// the latest active code actually is regardless of what was submitted, so
// authService.js can consume it unconditionally and only then compare
// hashes.
export async function findLatestActiveLoginCode(pool) {
  const { rows } = await pool.query(
    `SELECT id, code_hash FROM login_codes
     WHERE consumed_at IS NULL AND expires_at > now()
     ORDER BY created_at DESC
     LIMIT 1`,
  );
  return rows[0] ?? null;
}

export async function consumeLoginCode(pool, id) {
  await pool.query('UPDATE login_codes SET consumed_at = now() WHERE id = $1', [id]);
}

export async function createSession(pool, { token, expiresAt }) {
  await pool.query(
    'INSERT INTO owner_sessions (token, expires_at) VALUES ($1, $2)',
    [token, expiresAt],
  );
}

export async function findValidSession(pool, token) {
  const { rows } = await pool.query(
    'SELECT token FROM owner_sessions WHERE token = $1 AND expires_at > now()',
    [token],
  );
  return rows[0] ?? null;
}

export async function deleteSession(pool, token) {
  await pool.query('DELETE FROM owner_sessions WHERE token = $1', [token]);
}

// "Owner online" for the topbar chat icon's greyed state / presence push --
// any unexpired session counts, since there's only ever one owner and no
// concept of multiple simultaneous devices needing individual tracking.
export async function hasActiveSession(pool) {
  const { rows } = await pool.query('SELECT 1 FROM owner_sessions WHERE expires_at > now() LIMIT 1');
  return rows.length > 0;
}
