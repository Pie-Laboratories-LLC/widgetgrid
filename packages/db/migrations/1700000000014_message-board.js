export const shorthands = undefined;

// The message boards (/site/messages) -- see
// packages/server/src/services/boardService.js.
export function up(pgm) {
  // Created by the owner only (here, or by hand later); no UI for it.
  pgm.createTable('board_sections', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    slug: { type: 'text', notNull: true, unique: true },
    name: { type: 'text', notNull: true },
    description: { type: 'text', notNull: true, default: '' },
    sort_order: { type: 'integer', notNull: true, default: 0 },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.sql(`INSERT INTO board_sections (slug, name, description, sort_order) VALUES
    ('game-feedback', 'Game feedback', 'Bugs, ideas and impressions from the games.', 0),
    ('site-feedback', 'Site feedback', 'Anything about this website.', 1)`);

  // Threads and replies in one table: a thread is the post with no parent.
  // Numeric ids, since they're in URLs (/site/messages/<section>/<id>).
  pgm.createTable('board_posts', {
    id: { type: 'bigint', primaryKey: true, sequenceGenerated: { precedence: 'ALWAYS' } },
    section_id: { type: 'uuid', notNull: true, references: 'board_sections', onDelete: 'RESTRICT' },
    // The thread's own post for a reply; null on the thread post itself.
    thread_id: { type: 'bigint', references: 'board_posts', onDelete: 'CASCADE' },
    parent_id: { type: 'bigint', references: 'board_posts', onDelete: 'CASCADE' },
    author_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'RESTRICT' },
    // Thread posts only.
    title: { type: 'text' },
    // Markdown source (packages/markup); rendered on read, so a renderer
    // improvement reaches old posts too.
    body: { type: 'text', notNull: true },
    // The author's "email me about replies" -- direct replies only.
    notify_replies: { type: 'boolean', notNull: true, default: false },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    edited_at: { type: 'timestamptz' },
    // Deleted by its author: a post with replies stays as "[deleted]" so
    // the thread still reads; one without is removed outright instead.
    deleted_at: { type: 'timestamptz' },
    // Hidden by the owner/a moderator: shown as "[removed]".
    hidden_at: { type: 'timestamptz' },
    hidden_by: { type: 'uuid', references: 'users', onDelete: 'SET NULL' },
    // Thread posts only: kept current so section listings don't count.
    reply_count: { type: 'integer', notNull: true, default: 0 },
    last_reply_at: { type: 'timestamptz' },
  });
  pgm.addConstraint('board_posts', 'board_posts_thread_shape', {
    check: '(parent_id IS NULL AND thread_id IS NULL AND title IS NOT NULL) OR (parent_id IS NOT NULL AND thread_id IS NOT NULL AND title IS NULL)',
  });
  pgm.createIndex('board_posts', ['section_id', 'created_at'], { where: 'parent_id IS NULL', name: 'board_posts_threads_idx' });
  pgm.createIndex('board_posts', 'thread_id');
  pgm.createIndex('board_posts', ['author_id', 'created_at']);

  // Banned users can still read; they can't post, reply or edit.
  pgm.createTable('board_bans', {
    user_id: { type: 'uuid', primaryKey: true, references: 'users', onDelete: 'CASCADE' },
    banned_by: { type: 'uuid', references: 'users', onDelete: 'SET NULL' },
    reason: { type: 'text', notNull: true, default: '' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
}

export function down(pgm) {
  pgm.dropTable('board_bans');
  pgm.dropTable('board_posts');
  pgm.dropTable('board_sections');
}
