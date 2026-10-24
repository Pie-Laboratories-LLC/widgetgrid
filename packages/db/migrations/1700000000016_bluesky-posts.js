export const shorthands = undefined;

// Blog posts announced on Bluesky (AuthorService.PostToBluesky) -- once
// each, like blog_post_mailings. The row is claimed before posting, so a
// double click or a second replica can't post twice; uri is filled in
// once Bluesky has the post, and the claim is dropped if it fails.
export function up(pgm) {
  pgm.createTable('blog_post_bluesky', {
    slug: { type: 'text', primaryKey: true },
    // at://<did>/app.bsky.feed.post/<rkey>; null while being posted.
    uri: { type: 'text' },
    posted_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });
}

export function down(pgm) {
  pgm.dropTable('blog_post_bluesky');
}
