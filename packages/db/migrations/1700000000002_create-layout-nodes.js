export const shorthands = undefined;

// widget_id is only ever set on leaf nodes -- an application-level convention
// (documented, not a DB constraint). Not worth a trigger for a v1 with no
// authoring UI yet; revisit if/when a page editor is built and bad data
// becomes a real risk instead of a theoretical one.
export function up(pgm) {
  pgm.createTable('layout_nodes', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    page_id: {
      type: 'uuid',
      notNull: true,
      references: 'pages',
      onDelete: 'CASCADE',
    },
    parent_id: {
      type: 'uuid',
      notNull: false,
      references: 'layout_nodes',
      onDelete: 'CASCADE',
    },
    node_type: { type: 'text', notNull: true, check: "node_type IN ('row','col')" },
    bootstrap_classes: { type: 'text', notNull: true, default: '' },
    sort_order: { type: 'integer', notNull: true, default: 0 },
    widget_id: {
      type: 'uuid',
      notNull: false,
      references: 'widgets',
      onDelete: 'SET NULL',
    },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createIndex('layout_nodes', 'page_id');
  pgm.createIndex('layout_nodes', 'parent_id');

  // exactly one root node per page tree
  pgm.createIndex('layout_nodes', 'page_id', {
    name: 'idx_layout_nodes_page_root',
    unique: true,
    where: 'parent_id IS NULL',
  });
}

export function down(pgm) {
  pgm.dropTable('layout_nodes');
}
