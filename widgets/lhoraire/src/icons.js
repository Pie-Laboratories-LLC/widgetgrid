// Issue type icons (Tabler outline paths, 24x24, stroke). An issue type's
// `icon` field is one of these names; unknown names fall back to task.
export const TYPE_ICONS = {
  task: ['M9 11l3 3l8 -8', 'M20 12v6a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h9'],
  bug: ['M9 9v-1a3 3 0 0 1 6 0v1', 'M8 9h8a6 6 0 0 1 1 3v3a5 5 0 0 1 -10 0v-3a6 6 0 0 1 1 -3', 'M3 13h4', 'M17 13h4', 'M12 20v-6', 'M4 19l3.35 -2', 'M20 19l-3.35 -2', 'M4 7l3.75 2.4', 'M20 7l-3.75 2.4'],
  story: ['M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0', 'M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0', 'M3 6v13', 'M12 6v13', 'M21 6v13'],
  epic: ['M13 3v7h6l-8 11v-7h-6l8 -11'],
  feature: ['M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z'],
  spike: ['M9 3h6', 'M10 9h4', 'M10 3v6l-4 11a.7 .7 0 0 0 .5 1h11a.7 .7 0 0 0 .5 -1l-4 -11v-6'],
  chore: ['M7 10h3v-3l-3.5 -3.5a6 6 0 0 1 8 8l6 6a2 2 0 0 1 -3 3l-6 -6a6 6 0 0 1 -8 -8l3.5 3.5'],
  question: ['M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0', 'M12 17v.01', 'M12 13.5a1.5 1.5 0 0 1 1 -1.5a2.6 2.6 0 1 0 -3 -4'],
};

export const iconPaths = (name) => TYPE_ICONS[name] ?? TYPE_ICONS.task;

export const SEVERITIES = [
  { value: 'na', label: 'n/a' },
  { value: 'minor', label: 'Minor' },
  { value: 'normal', label: 'Normal' },
  { value: 'serious', label: 'Serious' },
  { value: 'blocker', label: 'Blocker' },
];

export const END_REASONS = [
  { value: 'completed', label: 'Completed' },
  { value: 'wont_complete', label: "Won't complete" },
  { value: 'obsolete', label: 'Obsolete' },
  { value: 'already_addressed', label: 'Already addressed' },
];

export const LINK_KINDS = [
  { value: 'depends_on', label: 'depends on' },
  { value: 'required_by', label: 'is required by' },
  { value: 'duplicates', label: 'duplicates' },
  { value: 'duplicated_by', label: 'is duplicated by' },
  { value: 'relates_to', label: 'relates to' },
];

// Tree columns besides key + summary (must match lhoraire-server's COLUMNS).
export const COLUMNS = [
  { id: 'type', label: 'Type' },
  { id: 'state', label: 'State' },
  { id: 'severity', label: 'Severity' },
  { id: 'assignee', label: 'Assignee' },
  { id: 'created', label: 'Created' },
  { id: 'modified', label: 'Modified' },
];

export const shortDate = (iso) => (iso ? new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '');
export const personName = (email) => (email ? email.split('@')[0] : '');
