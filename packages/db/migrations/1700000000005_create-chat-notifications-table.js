export const shorthands = undefined;

// One row per SMS actually sent to the owner about an offline visitor
// message -- append-and-query-latest, same pattern as login_codes, rather
// than a single upserted row: no upsert-race to think about, and "was the
// owner notified within the last hour" is just "does a row exist newer
// than now() - 1h", the same shape as login_codes' "latest active code"
// query.
export function up(pgm) {
  pgm.createTable('chat_notifications', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    sent_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
}

export function down(pgm) {
  pgm.dropTable('chat_notifications');
}
