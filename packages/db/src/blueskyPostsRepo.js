// Which blog posts have been announced on Bluesky -- see migration
// 1700000000016_bluesky-posts.js and packages/server/src/blueskyPoster.js.

// slug -> { uri, postedAt }, for the posts that made it.
export async function listPosted(pool) {
  const { rows } = await pool.query('SELECT slug, uri, posted_at FROM blog_post_bluesky WHERE uri IS NOT NULL');
  return new Map(rows.map((r) => [r.slug, { uri: r.uri, postedAt: r.posted_at }]));
}

// true only for the one caller that claimed the post -- that caller posts.
export async function claim(pool, slug) {
  const { rowCount } = await pool.query(
    'INSERT INTO blog_post_bluesky (slug) VALUES ($1) ON CONFLICT (slug) DO NOTHING',
    [slug],
  );
  return rowCount === 1;
}

export async function setUri(pool, slug, uri) {
  await pool.query('UPDATE blog_post_bluesky SET uri = $2, posted_at = now() WHERE slug = $1', [slug, uri]);
}

// Posting failed: free the post to be tried again.
export async function release(pool, slug) {
  await pool.query('DELETE FROM blog_post_bluesky WHERE slug = $1 AND uri IS NULL', [slug]);
}
