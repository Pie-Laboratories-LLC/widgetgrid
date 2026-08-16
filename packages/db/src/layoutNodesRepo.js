// One query returns every node for a page regardless of tree depth --
// Postgres doesn't need a recursive CTE here since there's no per-level
// filtering, just "give me the whole page's node set." The tree itself gets
// assembled in JS by the caller (see server's layoutTreeMapper.js).
export async function getLayoutRows(pool, pageId) {
  const { rows } = await pool.query(
    `SELECT ln.id, ln.parent_id, ln.node_type, ln.bootstrap_classes, ln.sort_order,
            ln.widget_id, w.type AS widget_type
     FROM layout_nodes ln
     LEFT JOIN widgets w ON w.id = ln.widget_id
     WHERE ln.page_id = $1
     ORDER BY ln.sort_order ASC`,
    [pageId],
  );
  return rows;
}

export async function insert(pool, { pageId, parentId = null, nodeType, bootstrapClasses = '', sortOrder = 0, widgetId = null }) {
  const { rows } = await pool.query(
    `INSERT INTO layout_nodes (page_id, parent_id, node_type, bootstrap_classes, sort_order, widget_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [pageId, parentId, nodeType, bootstrapClasses, sortOrder, widgetId],
  );
  return rows[0].id;
}
