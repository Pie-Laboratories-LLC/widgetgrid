export const shorthands = undefined;

// Every environment starts with one global issue type, "Task", using the
// default workflow from the l'horaire design: New -> Underway;
// Underway -> Paused or Closed; Paused -> Underway or Closed. Closed is
// terminal. Same states/transitions as DEFAULT_WORKFLOW in
// packages/lhoraire-server/src/workflow.js (new types get that too).
export function up(pgm) {
  pgm.sql(`
    WITH t AS (
      INSERT INTO lhoraire.issue_types (project_id, name, icon, color)
      SELECT NULL, 'Task', 'task', '#4a6fa5'
      WHERE NOT EXISTS (SELECT 1 FROM lhoraire.issue_types WHERE project_id IS NULL AND lower(name) = 'task')
      RETURNING id
    ),
    s AS (
      INSERT INTO lhoraire.workflow_states (issue_type_id, name, position, is_initial, is_terminal)
      SELECT t.id, v.name, v.position, v.is_initial, v.is_terminal
      FROM t, (VALUES ('New', 0, true, false), ('Underway', 1, false, false),
                      ('Paused', 2, false, false), ('Closed', 3, false, true))
           AS v(name, position, is_initial, is_terminal)
      RETURNING id, issue_type_id, name
    )
    INSERT INTO lhoraire.workflow_transitions (issue_type_id, from_state_id, to_state_id)
    SELECT f.issue_type_id, f.id, o.id
    FROM (VALUES ('New', 'Underway'), ('Underway', 'Paused'), ('Underway', 'Closed'),
                 ('Paused', 'Underway'), ('Paused', 'Closed')) AS v(from_name, to_name)
    JOIN s f ON f.name = v.from_name
    JOIN s o ON o.name = v.to_name
  `);
}

export function down(pgm) {
  pgm.sql(`DELETE FROM lhoraire.issue_types WHERE project_id IS NULL AND name = 'Task'
           AND NOT EXISTS (SELECT 1 FROM lhoraire.issues i WHERE i.issue_type_id = lhoraire.issue_types.id)`);
}
