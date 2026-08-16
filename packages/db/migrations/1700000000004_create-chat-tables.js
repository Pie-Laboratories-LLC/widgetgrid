export const shorthands = undefined;

// owner_last_read_at / visitor_last_read_at (not a separate read-receipts
// table): unread state for both the owner's bold chat-list labels and the
// icon badges is just "latest message.created_at > this timestamp" --
// nothing here needs per-message read tracking.
export function up(pgm) {
  pgm.createTable('chats', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    // The browser-generated localStorage UUID identifying a visitor's
    // browser -- not a real account, just "which chat is this browser's".
    visitor_id: { type: 'text', notNull: true, unique: true },
    label: { type: 'text', notNull: true },
    owner_last_read_at: { type: 'timestamptz', notNull: false },
    visitor_last_read_at: { type: 'timestamptz', notNull: false },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createTable('chat_messages', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    chat_id: {
      type: 'uuid',
      notNull: true,
      references: 'chats',
      onDelete: 'CASCADE',
    },
    sender: { type: 'text', notNull: true, check: "sender IN ('owner','visitor')" },
    body: { type: 'text', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createIndex('chat_messages', 'chat_id');
}

export function down(pgm) {
  pgm.dropTable('chat_messages');
  pgm.dropTable('chats');
}
