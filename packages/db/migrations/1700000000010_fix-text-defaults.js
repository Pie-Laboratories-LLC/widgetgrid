export const shorthands = undefined;

// Migrations 6-8 wrote text defaults as default: "'member'", but
// node-pg-migrate already quotes string defaults, so the stored default
// was the literal text 'member' -- quote marks included (and "''" became
// two quote characters, not an empty string). Nothing hit them on prod:
// every insert there supplies users.role and push_subscriptions.user_agent
// explicitly. This resets each to the intended value; plain strings, no
// extra quotes, from here on.
const FIXES = [
  ['public', 'users', 'role', 'member'],
  ['public', 'push_subscriptions', 'user_agent', ''],
  ['lhoraire', 'projects', 'color', '#4a6fa5'],
  ['lhoraire', 'issue_types', 'icon', 'task'],
  ['lhoraire', 'issue_types', 'color', '#6b7280'],
  ['lhoraire', 'issues', 'description', ''],
  ['lhoraire', 'issues', 'severity', 'normal'],
];

export function up(pgm) {
  for (const [schema, name, column, value] of FIXES) {
    pgm.alterColumn({ schema, name }, column, { default: value });
  }
}

export function down() {
  // Restoring the broken defaults would serve no one.
}
