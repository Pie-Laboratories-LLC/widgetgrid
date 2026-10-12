<template>
  <div class="lh-grid" role="treegrid" :aria-rowcount="rows.length">
    <div class="lh-row lh-head" role="row">
      <span class="lh-cell lh-check" role="columnheader">
        <input type="checkbox" :checked="allChecked" :indeterminate.prop="someChecked" aria-label="Select all visible" @change="$emit('check-all', $event.target.checked)" />
      </span>
      <span class="lh-cell lh-key-col" role="columnheader">Key</span>
      <span class="lh-cell lh-summary-col" role="columnheader">Summary</span>
      <span v-for="c in shownColumns" :key="c.id" class="lh-cell" :class="`lh-col-${c.id}`" role="columnheader">{{ c.label }}</span>
    </div>

    <div v-if="rows.length === 0" class="lh-empty lh-quiet">No issues yet. Use “New issue” to add one.</div>

    <div
      v-for="row in rows" :key="row.issue.id" class="lh-row" role="row"
      :class="{ 'lh-selected': row.issue.id === selectedId }"
      :aria-level="row.depth + 1" :aria-expanded="row.hasChildren ? row.expanded : undefined"
      :aria-selected="row.issue.id === selectedId"
      @click="$emit('select', row.issue.id)" @dblclick="$emit('open', row.issue.id)"
    >
      <span class="lh-cell lh-check" @click.stop>
        <input type="checkbox" :checked="checked.has(row.issue.id)" :aria-label="`Select ${row.issue.key}`" @change="$emit('check', row.issue.id, $event.target.checked)" />
      </span>
      <span class="lh-cell lh-key-col" :style="{ paddingLeft: `${8 + row.depth * 18}px` }">
        <button
          v-if="row.hasChildren" type="button" class="lh-toggle" :aria-label="row.expanded ? 'Collapse' : 'Expand'"
          @click.stop="$emit('toggle', row.issue.id)"
        >{{ row.expanded ? '⌄' : '›' }}</button>
        <span v-else class="lh-toggle-spacer" />
        <span class="lh-key" :style="{ background: project.color }">
          <TypeIcon :name="typeOf(row.issue).icon" />{{ row.issue.key }}
        </span>
      </span>
      <span class="lh-cell lh-summary-col" :title="row.issue.summary">{{ row.issue.summary }}</span>
      <span v-for="c in shownColumns" :key="c.id" class="lh-cell" :class="`lh-col-${c.id}`">
        <span v-if="c.id === 'type'" class="lh-type-chip" :style="{ background: tint(typeOf(row.issue).color), color: typeOf(row.issue).color }">{{ typeOf(row.issue).name }}</span>
        <span v-else-if="c.id === 'state'" :class="{ 'lh-terminal': stateOf(row.issue).isTerminal }">{{ stateOf(row.issue).name }}</span>
        <span v-else-if="c.id === 'severity'" :class="`lh-sev-${row.issue.severity}`">{{ severityLabel(row.issue.severity) }}</span>
        <span v-else-if="c.id === 'assignee'">{{ personName(users[row.issue.assigneeId]) }}</span>
        <span v-else-if="c.id === 'created'">{{ shortDate(row.issue.createdAt) }}</span>
        <span v-else-if="c.id === 'modified'">{{ shortDate(row.issue.modifiedAt) }}</span>
      </span>
    </div>
  </div>
</template>

<script>
import TypeIcon from './TypeIcon.vue';
import { COLUMNS, SEVERITIES, shortDate, personName } from './icons.js';

const UNKNOWN_TYPE = { name: '?', icon: 'question', color: '#888888' };

export default {
  name: 'TreeGrid',
  components: { TypeIcon },
  props: {
    project: { type: Object, required: true },
    rows: { type: Array, required: true },
    columns: { type: Array, required: true },
    types: { type: Object, required: true }, // id -> issue type
    states: { type: Object, required: true }, // id -> workflow state
    users: { type: Object, required: true }, // id -> email
    selectedId: { type: String, default: '' },
    checked: { type: Set, required: true },
  },
  emits: ['select', 'open', 'toggle', 'check', 'check-all'],
  computed: {
    shownColumns() {
      return this.columns.map((id) => COLUMNS.find((c) => c.id === id)).filter(Boolean);
    },
    allChecked() {
      return this.rows.length > 0 && this.rows.every((r) => this.checked.has(r.issue.id));
    },
    someChecked() {
      return !this.allChecked && this.rows.some((r) => this.checked.has(r.issue.id));
    },
  },
  methods: {
    shortDate,
    personName,
    typeOf(issue) { return this.types[issue.issueTypeId] ?? UNKNOWN_TYPE; },
    stateOf(issue) { return this.states[issue.stateId] ?? { name: '…', isTerminal: false }; },
    severityLabel(v) { return SEVERITIES.find((s) => s.value === v)?.label ?? v; },
    // The type colour as a light background, for the Type column chip.
    tint(hex) { return `${hex}22`; },
  },
};
</script>

<style scoped>
.lh-grid {
  border: 1px solid var(--lh-line);
  border-radius: 8px;
  overflow: auto;
  background: #fff;
}
.lh-row {
  display: grid;
  grid-template-columns: 36px minmax(150px, max-content) minmax(200px, 1fr) repeat(v-bind('shownColumns.length'), minmax(90px, max-content));
  align-items: center;
  border-bottom: 1px solid var(--lh-line);
  cursor: default;
  min-width: fit-content;
}
.lh-row:last-child {
  border-bottom: none;
}
.lh-row:not(.lh-head):hover {
  background: var(--lh-hover);
}
.lh-row.lh-selected {
  background: var(--lh-selected);
}
.lh-head {
  position: sticky;
  top: 0;
  z-index: 1;
  background: #faf9fc;
  font-weight: 600;
  color: var(--lh-quiet);
  font-size: 0.8rem;
}
.lh-cell {
  padding: 7px 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.lh-check {
  text-align: center;
}
.lh-key-col {
  display: flex;
  align-items: center;
  gap: 4px;
}
.lh-toggle,
.lh-toggle-spacer {
  width: 20px;
  flex: none;
}
.lh-toggle {
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  color: var(--lh-quiet);
  padding: 0;
}
.lh-key {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #fff;
  font-weight: 700;
  font-size: 0.8rem;
  padding: 2px 7px;
  border-radius: 5px;
}
.lh-type-chip {
  font-weight: 600;
  font-size: 0.8rem;
  padding: 2px 7px;
  border-radius: 5px;
}
.lh-terminal {
  color: var(--lh-quiet);
}
.lh-sev-blocker {
  color: var(--lh-danger);
  font-weight: 700;
}
.lh-sev-serious {
  color: #b35c00;
  font-weight: 600;
}
.lh-empty {
  padding: 24px;
  text-align: center;
}
</style>
