export const shorthands = undefined;

// One row per browser that turned on Web Push notifications (see
// packages/server/src/pushSender.js). The subscription belongs to the
// browser, not a sign-in session: it survives signing out on purpose, so
// the owner hears about visitor chats while logged out.
export function up(pgm) {
  pgm.createTable('push_subscriptions', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    user_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'CASCADE' },
    // The push service URL (Apple/Google/Mozilla) -- unique per browser
    // subscription, so re-enabling in the same browser updates in place.
    endpoint: { type: 'text', notNull: true, unique: true },
    p256dh: { type: 'text', notNull: true },
    auth: { type: 'text', notNull: true },
    user_agent: { type: 'text', notNull: true, default: "''" },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    last_success_at: { type: 'timestamptz' },
  });
}

export function down(pgm) {
  pgm.dropTable('push_subscriptions');
}
