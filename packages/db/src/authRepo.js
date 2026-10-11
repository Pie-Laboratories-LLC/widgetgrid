// owner_sessions = "the owner is signed in somewhere": one row per owner
// sign-in, created by RegisterSignIn and removed by Logout (see
// authService.js). It drives owner presence (the topbar chat icon's greyed
// state) and chatService's "text me only if I'm offline". It is NOT a
// credential -- calls authenticate with a Cognito access token.
export async function createSession(pool, { token, userId, expiresAt }) {
  await pool.query(
    'INSERT INTO owner_sessions (token, user_id, expires_at) VALUES ($1, $2, $3)',
    [token, userId, expiresAt],
  );
}

export async function deleteSession(pool, token) {
  await pool.query('DELETE FROM owner_sessions WHERE token = $1', [token]);
}

// Any unexpired session counts, since there's only ever one owner and no
// concept of multiple simultaneous devices needing individual tracking.
export async function hasActiveSession(pool) {
  const { rows } = await pool.query('SELECT 1 FROM owner_sessions WHERE expires_at > now() LIMIT 1');
  return rows.length > 0;
}
