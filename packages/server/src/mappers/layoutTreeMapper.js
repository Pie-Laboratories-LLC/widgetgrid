// Pure functions over the flat row shape layoutNodesRepo.getLayoutRows()
// returns: { id, parent_id, node_type, bootstrap_classes, sort_order,
// widget_id, widget_type }. No DB access here -- keeps this trivially
// unit-testable and reusable from the e2e test with canned rows.

export function buildTree(rows) {
  const byId = new Map(rows.map((row) => [row.id, toNode(row)]));
  const byParent = new Map();
  for (const row of rows) {
    const key = row.parent_id ?? null;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push(row.id);
  }
  for (const [id, node] of byId) {
    const childIds = byParent.get(id) ?? [];
    node.children = childIds.map((childId) => byId.get(childId));
  }

  const rootIds = byParent.get(null) ?? [];
  if (rootIds.length !== 1) {
    throw new Error(`expected exactly one root layout node, found ${rootIds.length}`);
  }
  return byId.get(rootIds[0]);
}

// Derived from the same row set buildTree() consumes, not a second query --
// so the flattened pass-2 hint list can never drift from the tree itself.
export function derivePlaceholders(rows) {
  return rows
    .filter((row) => row.widget_id)
    .map((row) => ({ widgetId: row.widget_id, widgetType: row.widget_type }));
}

function toNode(row) {
  return {
    id: row.id,
    nodeType: row.node_type,
    bootstrapClasses: row.bootstrap_classes,
    sortOrder: row.sort_order,
    widgetId: row.widget_id ?? '',
    widgetType: row.widget_type ?? '',
    children: [],
  };
}
