export const shorthands = undefined;

// Sign-in moved from a texted one-time code to Cognito + IAM Identity
// Center (see infra/cdk/lib/identity-stack.js). login_codes goes away with
// the SMS login; owner_sessions stays, but only as the owner-presence
// record (chat icon greyed state, "text me if I'm offline") -- the bearer
// credential on calls is now a Cognito access token, not a session token.
export function up(pgm) {
  pgm.createTable('users', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    // Cognito user-pool subject: the stable identity key. Email can change
    // in Identity Center; sub can't.
    cognito_sub: { type: 'text', notNull: true, unique: true },
    email: { type: 'text', notNull: true },
    // 'owner' (chat server side, push notifications) or 'member'. Group
    // membership (anonyme users / anonyme admins) lives in Identity Center
    // and arrives in the token; this is only what Identity Center can't
    // express -- that one specific person is the site owner.
    role: { type: 'text', notNull: true, default: "'member'", check: "role IN ('owner', 'member')" },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    last_sign_in_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  // Existing rows were minted by the SMS login and belong to nobody.
  pgm.sql('DELETE FROM owner_sessions');
  pgm.addColumn('owner_sessions', {
    user_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'CASCADE' },
  });

  pgm.dropTable('login_codes');
}

export function down(pgm) {
  pgm.createTable('login_codes', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    code_hash: { type: 'text', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    expires_at: { type: 'timestamptz', notNull: true },
    consumed_at: { type: 'timestamptz', notNull: false },
  });
  pgm.dropColumn('owner_sessions', 'user_id');
  pgm.dropTable('users');
}
