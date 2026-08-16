export const shorthands = undefined;

export function up(pgm) {
  pgm.createTable('widgets', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    type: { type: 'text', notNull: true },
    title: { type: 'text', notNull: true, default: '' },
    content: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createIndex('widgets', 'type');
}

export function down(pgm) {
  pgm.dropTable('widgets');
}
