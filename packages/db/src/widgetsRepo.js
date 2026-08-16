export async function insert(pool, { type, title = '', content = {} }) {
  const { rows } = await pool.query(
    `INSERT INTO widgets (type, title, content) VALUES ($1, $2, $3)
     RETURNING id, type, title, content`,
    [type, title, content],
  );
  return rows[0];
}

// Returns a Map keyed by widget id, so callers can preserve request order and
// detect not-found ids by simple presence checks (see widgetService.js).
export async function findByIds(pool, ids) {
  if (ids.length === 0) return new Map();
  const { rows } = await pool.query(
    'SELECT id, type, title, content FROM widgets WHERE id = ANY($1::uuid[])',
    [ids],
  );
  return new Map(rows.map((row) => [row.id, row]));
}
