export const shorthands = undefined;

// Migration 8's parent foreign key cascaded updates: changing an issue's
// project_id silently changed its children's too, before the move gave
// them new numbers, so a child could collide with a number already handed
// out in the target project. Moves update every issue in the subtree
// themselves; the deferred check at commit is all the constraint needs to
// do.
export function up(pgm) {
  pgm.sql(`ALTER TABLE lhoraire.issues DROP CONSTRAINT issues_parent_same_project`);
  pgm.sql(`ALTER TABLE lhoraire.issues ADD CONSTRAINT issues_parent_same_project
    FOREIGN KEY (parent_id, project_id) REFERENCES lhoraire.issues (id, project_id)
    ON DELETE CASCADE DEFERRABLE INITIALLY DEFERRED`);
}

export function down(pgm) {
  pgm.sql(`ALTER TABLE lhoraire.issues DROP CONSTRAINT issues_parent_same_project`);
  pgm.sql(`ALTER TABLE lhoraire.issues ADD CONSTRAINT issues_parent_same_project
    FOREIGN KEY (parent_id, project_id) REFERENCES lhoraire.issues (id, project_id)
    ON DELETE CASCADE ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED`);
}
