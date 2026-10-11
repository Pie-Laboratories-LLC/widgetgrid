export const shorthands = undefined;

// l'horaire (packages/lhoraire-server): project-based, fully hierarchical
// issue tracking. Its own Postgres schema in the shared database; users
// come from public.users (Cognito sign-ins). Integrity the rules depend on
// is enforced here rather than only in application code:
//   - an issue's parent is in the same project (composite FK, deferrable so
//     a whole subtree can change project in one transaction)
//   - an issue's state belongs to its issue type's workflow (composite FK)
//   - one initial state per workflow (partial unique index)
//   - deleting an issue deletes its subtree (parent FK cascades)
// Rules that span rows in ways constraints can't express (terminal-state
// finality, parents closing only after their children, type scope) live
// in lhoraire-server and its tests.
export function up(pgm) {
  pgm.createSchema('lhoraire');
  const t = (name) => ({ schema: 'lhoraire', name });
  const now = { type: 'timestamptz', notNull: true, default: pgm.func('now()') };
  const userRef = (notNull) => ({ type: 'uuid', notNull, references: { schema: 'public', name: 'users' }, onDelete: 'RESTRICT' });

  pgm.createTable(t('projects'), {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    // The prefix of every issue key ("ffdb" in ffdb-1). Immutable: changing
    // it would silently change every key in the project.
    key: { type: 'text', notNull: true, unique: true, check: "key ~ '^[a-z][a-z0-9]{1,9}$'" },
    name: { type: 'text', notNull: true, check: "length(trim(name)) > 0" },
    color: { type: 'text', notNull: true, default: "'#4a6fa5'", check: "color ~ '^#[0-9a-fA-F]{6}$'" },
    // Next issue number to hand out; numbers are never reused.
    next_issue_number: { type: 'integer', notNull: true, default: 1 },
    created_at: now,
    created_by: userRef(true),
    modified_at: now,
  });

  pgm.createTable(t('issue_types'), {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    // NULL = global (available in every project).
    project_id: { type: 'uuid', references: t('projects'), onDelete: 'CASCADE' },
    name: { type: 'text', notNull: true, check: "length(trim(name)) > 0" },
    icon: { type: 'text', notNull: true, default: "'task'" },
    color: { type: 'text', notNull: true, default: "'#6b7280'", check: "color ~ '^#[0-9a-fA-F]{6}$'" },
    created_at: now,
    modified_at: now,
  });
  // Names unique (case-insensitively) within a scope: among globals, and
  // within each project. Cross-scope collisions (a project type named like
  // a global one) are checked by the service when a type changes scope.
  pgm.sql(`CREATE UNIQUE INDEX issue_types_global_name ON lhoraire.issue_types (lower(name)) WHERE project_id IS NULL`);
  pgm.sql(`CREATE UNIQUE INDEX issue_types_project_name ON lhoraire.issue_types (project_id, lower(name)) WHERE project_id IS NOT NULL`);

  // An issue type's workflow: its states and the allowed transitions.
  pgm.createTable(t('workflow_states'), {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    issue_type_id: { type: 'uuid', notNull: true, references: t('issue_types'), onDelete: 'CASCADE' },
    name: { type: 'text', notNull: true, check: "length(trim(name)) > 0" },
    position: { type: 'integer', notNull: true, default: 0 },
    is_initial: { type: 'boolean', notNull: true, default: false },
    is_terminal: { type: 'boolean', notNull: true, default: false },
  });
  pgm.addConstraint(t('workflow_states'), 'workflow_states_id_type', { unique: ['id', 'issue_type_id'] });
  pgm.sql(`CREATE UNIQUE INDEX workflow_states_one_initial ON lhoraire.workflow_states (issue_type_id) WHERE is_initial`);
  pgm.sql(`CREATE UNIQUE INDEX workflow_states_name ON lhoraire.workflow_states (issue_type_id, lower(name))`);
  pgm.sql(`ALTER TABLE lhoraire.workflow_states ADD CONSTRAINT workflow_states_initial_not_terminal CHECK (NOT (is_initial AND is_terminal))`);

  pgm.createTable(t('workflow_transitions'), {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    issue_type_id: { type: 'uuid', notNull: true, references: t('issue_types'), onDelete: 'CASCADE' },
    from_state_id: { type: 'uuid', notNull: true },
    to_state_id: { type: 'uuid', notNull: true },
  });
  pgm.addConstraint(t('workflow_transitions'), 'workflow_transitions_from', {
    foreignKeys: { columns: ['from_state_id', 'issue_type_id'], references: 'lhoraire.workflow_states (id, issue_type_id)', onDelete: 'CASCADE' },
  });
  pgm.addConstraint(t('workflow_transitions'), 'workflow_transitions_to', {
    foreignKeys: { columns: ['to_state_id', 'issue_type_id'], references: 'lhoraire.workflow_states (id, issue_type_id)', onDelete: 'CASCADE' },
  });
  pgm.addConstraint(t('workflow_transitions'), 'workflow_transitions_unique', { unique: ['from_state_id', 'to_state_id'] });
  pgm.sql(`ALTER TABLE lhoraire.workflow_transitions ADD CONSTRAINT workflow_transitions_not_self CHECK (from_state_id <> to_state_id)`);

  pgm.createTable(t('issues'), {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    project_id: { type: 'uuid', notNull: true, references: t('projects'), onDelete: 'CASCADE' },
    number: { type: 'integer', notNull: true },
    parent_id: { type: 'uuid' },
    // Fractional index: siblings sort by this string, so a reorder rewrites
    // one row. Starts in creation order.
    sibling_rank: { type: 'text', notNull: true, collation: '"C"' },
    issue_type_id: { type: 'uuid', notNull: true, references: t('issue_types'), onDelete: 'RESTRICT' },
    state_id: { type: 'uuid', notNull: true },
    summary: { type: 'varchar(256)', notNull: true, check: "length(trim(summary)) > 0" },
    description: { type: 'text', notNull: true, default: "''" },
    severity: { type: 'text', notNull: true, default: "'normal'", check: "severity IN ('na', 'minor', 'normal', 'serious', 'blocker')" },
    assignee_id: userRef(false),
    end_reason: { type: 'text', check: "end_reason IN ('completed', 'wont_complete', 'obsolete', 'already_addressed')" },
    end_description: { type: 'text' },
    created_at: now,
    created_by: userRef(true),
    modified_at: now,
    modified_by: userRef(true),
    // Optimistic concurrency: every write bumps it; a write carrying a
    // stale version is rejected.
    version: { type: 'integer', notNull: true, default: 1 },
  });
  pgm.addConstraint(t('issues'), 'issues_project_number', { unique: ['project_id', 'number'] });
  pgm.addConstraint(t('issues'), 'issues_id_project', { unique: ['id', 'project_id'] });
  pgm.sql(`ALTER TABLE lhoraire.issues ADD CONSTRAINT issues_parent_same_project
    FOREIGN KEY (parent_id, project_id) REFERENCES lhoraire.issues (id, project_id)
    ON DELETE CASCADE ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED`);
  pgm.sql(`ALTER TABLE lhoraire.issues ADD CONSTRAINT issues_state_in_workflow
    FOREIGN KEY (state_id, issue_type_id) REFERENCES lhoraire.workflow_states (id, issue_type_id)
    ON DELETE RESTRICT DEFERRABLE INITIALLY DEFERRED`);
  pgm.sql(`ALTER TABLE lhoraire.issues ADD CONSTRAINT issues_end_reason_pair
    CHECK ((end_reason IS NULL) = (end_description IS NULL))`);
  pgm.sql(`CREATE INDEX issues_siblings ON lhoraire.issues (project_id, parent_id, sibling_rank)`);

  // Old keys of issues that moved project, so links like ffdb-7 still resolve.
  pgm.createTable(t('issue_key_aliases'), {
    key: { type: 'text', primaryKey: true },
    issue_id: { type: 'uuid', notNull: true, references: t('issues'), onDelete: 'CASCADE' },
  });

  // One row per link. depends_on: from depends on to (shown on "to" as
  // "required by"). duplicates: from duplicates to. relates_to is
  // symmetric. Each pair's inverse is derived when read, so creating or
  // deleting one side always does both.
  pgm.createTable(t('issue_links'), {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    from_issue_id: { type: 'uuid', notNull: true, references: t('issues'), onDelete: 'CASCADE' },
    to_issue_id: { type: 'uuid', notNull: true, references: t('issues'), onDelete: 'CASCADE' },
    kind: { type: 'text', notNull: true, check: "kind IN ('depends_on', 'duplicates', 'relates_to')" },
    created_at: now,
    created_by: userRef(true),
  });
  pgm.sql(`ALTER TABLE lhoraire.issue_links ADD CONSTRAINT issue_links_not_self CHECK (from_issue_id <> to_issue_id)`);
  pgm.sql(`CREATE UNIQUE INDEX issue_links_unique ON lhoraire.issue_links (from_issue_id, to_issue_id, kind)`);
  pgm.sql(`CREATE INDEX issue_links_to ON lhoraire.issue_links (to_issue_id)`);

  pgm.createTable(t('comments'), {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    issue_id: { type: 'uuid', notNull: true, references: t('issues'), onDelete: 'CASCADE' },
    body: { type: 'text', notNull: true, check: "length(trim(body)) > 0" },
    created_at: now,
    created_by: userRef(true),
    edited_at: { type: 'timestamptz' },
    edited_by: userRef(false),
  });
  pgm.sql(`CREATE INDEX comments_issue ON lhoraire.comments (issue_id, created_at)`);

  // Append-only history: every change, who made it, when. old/new hold the
  // field values (or comment/link/move details) as JSON.
  pgm.createTable(t('issue_events'), {
    id: { type: 'bigserial', primaryKey: true },
    issue_id: { type: 'uuid', notNull: true, references: t('issues'), onDelete: 'CASCADE' },
    actor_id: userRef(true),
    at: now,
    kind: { type: 'text', notNull: true },
    field: { type: 'text' },
    old_value: { type: 'jsonb' },
    new_value: { type: 'jsonb' },
  });
  pgm.sql(`CREATE INDEX issue_events_issue ON lhoraire.issue_events (issue_id, id)`);

  // Change feed for live updates: one row per committed change, in order.
  // A reconnecting client asks for everything after the last id it saw.
  // project_id NULL = global (a project or global type was added/changed).
  pgm.createTable(t('changes'), {
    id: { type: 'bigserial', primaryKey: true },
    project_id: { type: 'uuid' },
    issue_id: { type: 'uuid' },
    kind: { type: 'text', notNull: true },
    at: now,
  });
  pgm.sql(`CREATE INDEX changes_project ON lhoraire.changes (project_id, id)`);

  pgm.createTable(t('user_column_prefs'), {
    user_id: { type: 'uuid', notNull: true, references: { schema: 'public', name: 'users' }, onDelete: 'CASCADE' },
    project_id: { type: 'uuid', notNull: true, references: t('projects'), onDelete: 'CASCADE' },
    columns: { type: 'jsonb', notNull: true },
  }, { constraints: { primaryKey: ['user_id', 'project_id'] } });
}

export function down(pgm) {
  pgm.dropSchema('lhoraire', { cascade: true });
}
