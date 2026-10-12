<template>
  <div class="lh-project">
    <header class="lh-project-head">
      <button type="button" class="lh-back" title="All projects" @click="$emit('back')">‹ Projects</button>
      <span class="lh-project-key" :style="{ background: project.color }">{{ project.key }}</span>
      <h2>{{ project.name }}</h2>
    </header>

    <div class="lh-toolbar">
      <button type="button" class="lh-btn" @click="openCreate('')">New issue</button>
      <button type="button" class="lh-btn lh-btn-quiet" :disabled="!selected" @click="openCreate(selectedId)">New child</button>
      <button type="button" class="lh-btn lh-btn-quiet" :disabled="!selected" @click="openEdit(selectedId)">Edit</button>
      <span class="lh-spacer" />
      <span v-if="checked.size" class="lh-quiet">{{ checked.size }} selected</span>
      <div class="lh-columns">
        <button type="button" class="lh-btn lh-btn-quiet" :aria-expanded="showColumns" @click="showColumns = !showColumns">Columns</button>
        <div v-if="showColumns" class="lh-columns-menu">
          <label v-for="c in allColumns" :key="c.id">
            <input type="checkbox" :checked="columns.includes(c.id)" @change="toggleColumn(c.id, $event.target.checked)" />
            {{ c.label }}
          </label>
        </div>
      </div>
    </div>

    <p v-if="error" class="lh-error">{{ error }}</p>
    <p v-if="loading" class="lh-quiet">Loading…</p>
    <TreeGrid
      v-else
      :project="project" :rows="rows" :columns="columns" :types="types" :states="states" :users="users"
      :selected-id="selectedId" :checked="checked"
      @select="selectedId = $event" @open="openEdit" @toggle="toggle"
      @check="check" @check-all="checkAll"
    />

    <IssueDialog
      v-if="dialog"
      :mode="dialog.mode" :issue-id="dialog.issueId" :parent="dialog.parent" :project="project"
      :types="types" :type-list="typeList" :users="users"
      @close="dialog = null" @saved="onSaved" @open-issue="openEdit"
    />
  </div>
</template>

<script>
import { call } from './client.js';
import { visibleRows, ancestorIds } from './tree.js';
import { COLUMNS } from './icons.js';
import TreeGrid from './TreeGrid.vue';
import IssueDialog from './IssueDialog.vue';

export default {
  name: 'ProjectView',
  components: { TreeGrid, IssueDialog },
  props: { project: { type: Object, required: true } },
  emits: ['back'],
  data() {
    return {
      loading: true, error: '',
      issues: [], typeList: [], types: {}, states: {}, users: {},
      columns: [], allColumns: COLUMNS, showColumns: false,
      expanded: new Set(), checked: new Set(), selectedId: '',
      dialog: null,
    };
  },
  computed: {
    rows() { return visibleRows(this.issues, this.expanded); },
    selected() { return this.issues.find((i) => i.id === this.selectedId) ?? null; },
  },
  async created() {
    try {
      await Promise.all([this.loadTypes(), this.loadIssues(), this.loadUsers(), this.loadColumns()]);
    } catch (err) {
      this.error = err.message;
    } finally {
      this.loading = false;
    }
  },
  methods: {
    async loadIssues() {
      this.issues = (await call('IssueService', 'ListIssues', { projectId: this.project.id })).issues;
    },
    // Types usable in this project, plus every state of their workflows
    // (the State column and the dialog need the names).
    async loadTypes() {
      const { issueTypes } = await call('IssueTypeService', 'ListIssueTypes', { projectId: this.project.id, includeGlobal: true, requestedAtMs: Date.now() });
      const details = await Promise.all(issueTypes.map((t) => call('IssueTypeService', 'GetIssueType', { id: t.id })));
      const types = {};
      const states = {};
      for (const { issueType, workflow } of details) {
        types[issueType.id] = { ...issueType, workflow };
        for (const s of workflow.states) states[s.id] = s;
      }
      this.typeList = issueTypes;
      this.types = types;
      this.states = states;
    },
    async loadUsers() {
      const { users } = await call('IssueService', 'ListUsers', { requestedAtMs: Date.now() });
      this.users = Object.fromEntries(users.map((u) => [u.id, u.email]));
    },
    async loadColumns() {
      this.columns = (await call('ProjectService', 'GetColumnPrefs', { projectId: this.project.id })).columns;
    },
    async toggleColumn(id, on) {
      const next = COLUMNS.map((c) => c.id).filter((c) => (c === id ? on : this.columns.includes(c)));
      this.columns = next;
      try {
        await call('ProjectService', 'SetColumnPrefs', { projectId: this.project.id, columns: next });
      } catch (err) {
        this.error = err.message;
      }
    },
    toggle(id) {
      const next = new Set(this.expanded);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      this.expanded = next;
    },
    check(id, on) {
      const next = new Set(this.checked);
      if (on) next.add(id);
      else next.delete(id);
      this.checked = next;
    },
    checkAll(on) {
      this.checked = on ? new Set(this.rows.map((r) => r.issue.id)) : new Set();
    },
    openCreate(parentId) {
      const parent = parentId ? this.issues.find((i) => i.id === parentId) : null;
      this.dialog = { mode: 'create', issueId: '', parent };
    },
    openEdit(id) {
      if (!this.issues.some((i) => i.id === id)) {
        this.error = "That issue is in another project -- open it from that project's tree.";
        return;
      }
      this.error = '';
      this.selectedId = id;
      this.dialog = { mode: 'edit', issueId: id, parent: null };
    },
    // After any save: refresh, then make the issue visible and selected.
    async onSaved(issue) {
      await Promise.all([this.loadIssues(), this.loadTypes()]);
      if (issue) {
        const next = new Set(this.expanded);
        for (const id of ancestorIds(this.issues, issue.id)) next.add(id);
        this.expanded = next;
        this.selectedId = issue.id;
      }
    },
  },
};
</script>

<style scoped>
.lh-project {
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
}
.lh-project-head {
  display: flex;
  align-items: center;
  gap: 10px;
}
.lh-project-head h2 {
  margin: 0;
  font-size: 1.25rem;
}
.lh-back {
  border: none;
  background: none;
  color: var(--lh-quiet);
  cursor: pointer;
  font: inherit;
  padding: 4px 0;
}
.lh-project-key {
  color: #fff;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 5px;
  font-size: 0.85rem;
}
.lh-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 14px 0 10px;
}
.lh-spacer {
  flex: 1;
}
.lh-columns {
  position: relative;
}
.lh-columns-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 4px);
  z-index: 5;
  background: #fff;
  border: 1px solid var(--lh-line);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  white-space: nowrap;
}
</style>
