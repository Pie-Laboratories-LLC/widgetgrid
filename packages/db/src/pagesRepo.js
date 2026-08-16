export async function findBySlug(pool, slug) {
  const { rows } = await pool.query(
    'SELECT id, slug, title FROM pages WHERE slug = $1',
    [slug],
  );
  return rows[0] ?? null;
}

export async function upsert(pool, { slug, title }) {
  const { rows } = await pool.query(
    `INSERT INTO pages (slug, title) VALUES ($1, $2)
     ON CONFLICT (slug) DO NOTHING
     RETURNING id, slug, title`,
    [slug, title],
  );
  if (rows[0]) return rows[0];
  return findBySlug(pool, slug);
}
