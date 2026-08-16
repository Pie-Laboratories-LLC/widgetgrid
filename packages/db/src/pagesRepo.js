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

// Cascades to the page's layout_nodes (FK ON DELETE CASCADE) but NOT to the
// widgets those nodes pointed at (layout_nodes.widget_id is ON DELETE SET
// NULL, not CASCADE, since a widget isn't inherently page-owned) -- callers
// that want those cleaned up too need to fetch the widget ids (via
// layoutNodesRepo.getLayoutRows) before calling this.
export async function remove(pool, slug) {
  await pool.query('DELETE FROM pages WHERE slug = $1', [slug]);
}
