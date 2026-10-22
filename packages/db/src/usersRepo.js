// One row per person who has ever signed in through Cognito, keyed by the
// user-pool subject. Created on first sign-in (see authService.js's
// RegisterSignIn), so there's no separate provisioning step: adding a
// collaborator is adding them to an Identity Center group.

// becomeOwner promotes the row to 'owner' (the configured OWNER_EMAIL
// signing in); it never demotes, so a later email change in Identity
// Center doesn't silently strip the owner role.
export async function upsertOnSignIn(pool, { sub, email, becomeOwner }) {
  const { rows } = await pool.query(
    `INSERT INTO users (cognito_sub, email, role)
     VALUES ($1, $2, CASE WHEN $3 THEN 'owner' ELSE 'member' END)
     ON CONFLICT (cognito_sub) DO UPDATE
       SET email = EXCLUDED.email,
           last_sign_in_at = now(),
           role = CASE WHEN $3 THEN 'owner' ELSE users.role END
     RETURNING id, cognito_sub, email, role, username`,
    [sub, email, becomeOwner],
  );
  return rows[0];
}

export async function findBySub(pool, sub) {
  const { rows } = await pool.query(
    'SELECT id, cognito_sub, email, role, username, created_at FROM users WHERE cognito_sub = $1',
    [sub],
  );
  return rows[0] ?? null;
}
