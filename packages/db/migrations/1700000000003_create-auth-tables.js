export const shorthands = undefined;

// Single-owner auth, not a general accounts system -- no users table.
// login_codes exists independently of owner_sessions (a code is consumed
// once to mint a session, then never needed again) rather than folding
// verification into the session row itself.
export function up(pgm) {
  pgm.createTable('login_codes', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    // Hashed, not plaintext -- cheap to do right even though this is a
    // single-owner toy compared to a real user system.
    code_hash: { type: 'text', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    expires_at: { type: 'timestamptz', notNull: true },
    consumed_at: { type: 'timestamptz', notNull: false },
  });

  pgm.createTable('owner_sessions', {
    token: { type: 'text', primaryKey: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    expires_at: { type: 'timestamptz', notNull: true },
  });
}

export function down(pgm) {
  pgm.dropTable('owner_sessions');
  pgm.dropTable('login_codes');
}
