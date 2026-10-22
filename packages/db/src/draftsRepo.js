// Blog posts being written on the site (see
// migrations/1700000000015_drafts-and-images.js). Ids leave as strings.

const COLUMNS = 'id::text, file_name, title, synopsis, body, slug, images, created_at, updated_at';

export async function list(pool) {
  const { rows } = await pool.query(`SELECT ${COLUMNS} FROM blog_drafts ORDER BY updated_at DESC`);
  return rows;
}

export async function get(pool, id) {
  if (!/^\d+$/.test(String(id))) return null;
  const { rows } = await pool.query(`SELECT ${COLUMNS} FROM blog_drafts WHERE id = $1::bigint`, [id]);
  return rows[0] ?? null;
}

export async function findByFileName(pool, fileName) {
  const { rows } = await pool.query(`SELECT ${COLUMNS} FROM blog_drafts WHERE file_name = $1`, [fileName]);
  return rows[0] ?? null;
}

export async function create(pool, { fileName = null, title = '', synopsis = '', body = '', slug = '' }) {
  const { rows } = await pool.query(
    `INSERT INTO blog_drafts (file_name, title, synopsis, body, slug)
     VALUES ($1, $2, $3, $4, $5) RETURNING ${COLUMNS}`,
    [fileName, title, synopsis, body, slug],
  );
  return rows[0];
}

export async function update(pool, { id, title, synopsis, body, slug }) {
  const { rows } = await pool.query(
    `UPDATE blog_drafts SET title = $2, synopsis = $3, body = $4, slug = $5, updated_at = now()
     WHERE id = $1::bigint RETURNING ${COLUMNS}`,
    [id, title, synopsis, body, slug],
  );
  return rows[0] ?? null;
}

export async function addImage(pool, { id, name }) {
  await pool.query(
    `UPDATE blog_drafts SET images = images || to_jsonb($2::text), updated_at = now()
     WHERE id = $1::bigint AND NOT images ? $2`,
    [id, name],
  );
}

export async function remove(pool, id) {
  await pool.query('DELETE FROM blog_drafts WHERE id = $1::bigint', [id]);
}
