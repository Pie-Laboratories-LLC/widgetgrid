export const shorthands = undefined;

// Public usernames (shown on message board posts; emails never are) and
// the reservations that hold one between registering and first sign-in.
// See packages/server/src/services/accountService.js.
export function up(pgm) {
  // Fixed once set. Null until chosen: Identity Center users pick one the
  // first time they need it; registered users get the one they reserved.
  pgm.addColumn('users', {
    username: { type: 'text' },
  });
  // Unique regardless of capitals -- "Matt" and "matt" are the same name.
  pgm.createIndex('users', 'lower(username)', { name: 'users_username_lower_key', unique: true });

  // A username claimed at registration, before the account exists here:
  // the users row is only created at first sign-in (RegisterSignIn), after
  // the emailed code is confirmed. Matched to it by email. Expires, so an
  // abandoned registration doesn't hold a name forever.
  pgm.createTable('username_reservations', {
    // Stored lowercased: the uniqueness key.
    username_key: { type: 'text', primaryKey: true },
    // As typed -- the capitalisation the user chose.
    username: { type: 'text', notNull: true },
    email: { type: 'text', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.createIndex('username_reservations', 'email');
}

export function down(pgm) {
  pgm.dropTable('username_reservations');
  pgm.dropIndex('users', 'lower(username)', { name: 'users_username_lower_key' });
  pgm.dropColumn('users', 'username');
}
