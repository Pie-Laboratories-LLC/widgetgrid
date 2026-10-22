export const shorthands = undefined;

// Writing blog posts on the site (/site/write) and screenshots on the
// message boards -- see packages/server/src/services/authorService.js and
// mediaService.js.
export function up(pgm) {
  // A post being written, or a published one being edited. The post
  // itself stays a .md file in the blog bucket (or content/blog locally);
  // publishing writes it there. Owner only, so no author column.
  pgm.createTable('blog_drafts', {
    id: { type: 'bigint', primaryKey: true, sequenceGenerated: { precedence: 'ALWAYS' } },
    // The published file this draft edits ("2026-10-22-12-00-slug.md"), or
    // null for a new post. One draft per published post.
    file_name: { type: 'text', unique: true },
    title: { type: 'text', notNull: true, default: '' },
    synopsis: { type: 'text', notNull: true, default: '' },
    body: { type: 'text', notNull: true, default: '' },
    // New posts only: the address part to publish under (fixed once
    // published -- it's in the filename).
    slug: { type: 'text', notNull: true, default: '' },
    // Image filenames uploaded to this draft, kept under drafts/<id>/ in
    // the media store until publishing copies them next to the post.
    images: { type: 'jsonb', notNull: true, default: pgm.func("'[]'::jsonb") },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  // When each post was emailed to subscribers. Sending is now a deliberate
  // act (AuthorService.EmailSubscribers), not automatic.
  pgm.addColumn('blog_post_mailings', {
    sent_at: { type: 'timestamptz' },
  });
  pgm.sql('UPDATE blog_post_mailings SET sent_at = created_at WHERE sent');

  // Images uploaded to the message boards. The file is in the media store
  // under board/<id>.webp; this row says whose it is and whether it may be
  // shown. post_id is set the first time a post uses it, so deleting or
  // hiding the post takes the image with it.
  pgm.createTable('board_images', {
    id: { type: 'text', primaryKey: true },
    user_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'CASCADE' },
    post_id: { type: 'bigint', references: 'board_posts', onDelete: 'SET NULL' },
    // ok: shown. held: the scan was unsure, waiting for a moderator.
    // rejected: refused by the scan or a moderator, never shown.
    status: { type: 'text', notNull: true, check: "status IN ('ok', 'held', 'rejected')" },
    // What the scan saw: [{ name, confidence }].
    labels: { type: 'jsonb', notNull: true, default: pgm.func("'[]'::jsonb") },
    width: { type: 'integer', notNull: true },
    height: { type: 'integer', notNull: true },
    bytes: { type: 'integer', notNull: true },
    reviewed_by: { type: 'uuid', references: 'users', onDelete: 'SET NULL' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
  pgm.createIndex('board_images', ['user_id', 'created_at']);
  pgm.createIndex('board_images', 'post_id');
  pgm.createIndex('board_images', 'created_at', { where: "status = 'held'", name: 'board_images_held_idx' });
}

export function down(pgm) {
  pgm.dropTable('board_images');
  pgm.dropColumn('blog_post_mailings', 'sent_at');
  pgm.dropTable('blog_drafts');
}
