// owner_sessions: one row per owner sign-in, created by RegisterSignIn and
// removed by Logout (see authService.js) -- a record of where the owner is
// signed in. It is NOT a credential (calls authenticate with a Cognito
// access token) and NOT presence (that's live connections, presenceBus.js).
export async function createSession(pool, { token, userId, expiresAt }) {
  await pool.query(
    'INSERT INTO owner_sessions (token, user_id, expires_at) VALUES ($1, $2, $3)',
    [token, userId, expiresAt],
  );
}

export async function deleteSession(pool, token) {
  await pool.query('DELETE FROM owner_sessions WHERE token = $1', [token]);
}
