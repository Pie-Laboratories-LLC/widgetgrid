export const shorthands = undefined;

// Whether a user's email is one they've proved they own (2026-10, with
// social sign-in): the emailed code at registration, Identity Center, or
// a provider that says it's verified (Google, LinkedIn). Microsoft
// doesn't say, so its sign-ins land here false. Only a verified address
// may earn the owner role, an assigned username or a username reserved
// for it -- see packages/server/src/siteAccounts.js. Every account before
// this was one of the first two kinds.
export function up(pgm) {
  pgm.addColumn('users', {
    email_verified: { type: 'boolean', notNull: true, default: true },
  });
}

export function down(pgm) {
  pgm.dropColumn('users', 'email_verified');
}
