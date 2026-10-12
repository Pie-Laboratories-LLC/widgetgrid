<template>
  <div class="lh-project">
    <header class="lh-project-head">
      <button type="button" class="lh-back" title="All projects" @click="$emit('back')">‹ Projects</button>
      <span class="lh-project-key" :style="{ background: current.color }">{{ current.key }}</span>
      <h2>{{ current.name }}</h2>
      <button type="button" class="lh-btn lh-btn-quiet lh-settings-btn" :aria-expanded="showSettings" @click="openSettings">Project settings</button>
    </header>

    <form v-if="showSettings" class="lh-panel" @submit.prevent="saveSettings">
      <label>Name <input v-model="settings.name" class="lh-input" required /></label>
      <label>Colour <input v-model="settings.color" type="color" class="lh-color" /></label>
      <button type="submit" class="lh-btn" :disabled="busy || !settings.name.trim()">Save</button>
      <button type="button" class="lh-btn lh-btn-quiet" @click="showSettings = false">Close</button>
      <span class="lh-spacer" />
      <label class="lh-danger-zone">
        Type <strong>{{ current.key }}</strong> to delete the project and all its issues:
        <input v-model="settings.confirmKey" class="lh-input lh-confirm-key" />
      </label>
      <button type="button" class="lh-btn lh-btn-danger" :disabled="busy || settings.confirmKey !== current.key" @click="deleteProject">Delete project</button>
    </form>

    <div class="lh-toolbar">
      <button type="button" class="lh-btn" @click="openCreate('')">New issue</button>
      <button type="button" class="lh-btn lh-btn-quiet" :disabled="!selected" @click="openCreate(selectedId)">New child</button>
      <button type="button" class="lh-btn lh-btn-quiet" :disabled="!selected" @click="openEdit(selectedId)">Edit</button>
      <span class="lh-spacer" />
      <template v-if="checked.size">
        <span class="lh-quiet">{{ checked.size }} checked</span>
        <button type="button" class="lh-btn lh-btn-quiet" @click="startBulk('move')">Move to project…</button>
        <button type="button" class="lh-btn lh-btn-danger" @click="startBulk('delete')">Delete…</button>
      </template>
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

    <div v-if="bulk?.kind === 'delete'" class="lh-panel lh-panel-danger" role="alert">
      {{ deleteQuestion }}
      <span class="lh-spacer" />
      <button type="button" class="lh-btn lh-btn-danger" :disabled="busy" @click="bulkDelete">Delete</button>
      <button type="button" class="lh-btn lh-btn-quiet" @click="bulk = null">Cancel</button>
    </div>
    <form v-if="bulk?.kind === 'move'" class="lh-panel" @submit.prevent="bulkMove">
      Move {{ checked.size }} issue{{ checked.size === 1 ? '' : 's' }} (with everything below them) to
      <select v-model="bulk.targetProjectId" class="lh-input" required>
        <option value="" disabled>project…</option>
        <option v-for="p in otherProjects" :key="p.id" :value="p.id">{{ p.key }} · {{ p.name }}</option>
      </select>
      <span class="lh-quiet">They get new keys there; old keys keep working.</span>
      <span class="lh-spacer" />
      <button type="submit" class="lh-btn" :disabled="busy || !bulk.targetProjectId">Move</button>
      <button type="button" class="lh-btn lh-btn-quiet" @click="bulk = null">Cancel</button>
    </form>
    <p v-if="notice" class="lh-notice">{{ notice }}</p>

    <p v-if="error" class="lh-error">{{ error }}</p>
    <p v-if="loading" class="lh-quiet">Loading…</p>
    <TreeGrid
      v-else
      :project="current" :rows="rows" :columns="columns" :types="types" :states="states" :users="users"
      :selected-id="selectedId" :checked="checked" :plan-drop="planDrop"
      @select="selectedId = $event" @open="openEdit" @toggle="toggle"
      @check="check" @check-all="checkAll" @move="onDropMove"
    />

    <IssueDialog
      v-if="dialog"
      :mode="dialog.mode" :issue-id="dialog.issueId" :parent="dialog.parent" :project="current"
      :types="types" :type-list="typeList" :users="users" :issues="issues" :is-closed="isClosed"
      @close="dialog = null" @saved="onSaved" @open-issue="openEdit"
    />
  </div>
</template>

<script>
import { call } from './client.js';
import { visibleRows, ancestorIds, subtreeIds, planDrop } from './tree.js';
import { COLUMNS } from './icons.js';
import TreeGrid from './TreeGrid.vue';
import IssueDialog from './IssueDialog.vue';

export default {
  name: 'ProjectView',
  components: { TreeGrid, IssueDialog },
  props: { project: { type: Object, required: true } },
  emits: ['back', 'deleted'],
  data() {
    return {
      loading: true, error: '',
      issues: [], typeList: [], types: {}, states: {}, users: {},
      columns: [], allColumns: COLUMNS, showColumns: false,
      expanded: new Set(), checked: new Set(), selectedId: '',
      dialog: null,
      current: { ...this.project }, busy: false, notice: '',
      showSettings: false, settings: { name: '', color: '', confirmKey: '' },
      bulk: null, otherProjects: [],
    };
  },
  computed: {
    rows() { return visibleRows(this.issues, this.expanded, this.isClosed); },
    selected() { return this.issues.find((i) => i.id === this.selectedId) ?? null; },
    deleteQuestion() {
      const n = this.bulk.ids.length;
      const below = n - this.checked.size;
      return `Delete ${n} issue${n === 1 ? '' : 's'}${below > 0 ? `, including ${below} below the checked ones` : ''}? This can't be undone.`;
    },
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
    // Generic wrapper: busy flag, error display, notice cleared.
    async run(action) {
      this.busy = true;
      this.error = '';
      this.notice = '';
      try {
        await action();
      } catch (err) {
        this.error = err.message;
      } finally {
        this.busy = false;
      }
    },

    planDrop(draggedId, targetId, position) {
      return planDrop(this.issues, this.isClosed, draggedId, targetId, position);
    },
    onDropMove(draggedId, plan) {
      return this.run(async () => {
        const { issue } = await call('IssueService', 'MoveIssue', { id: draggedId, newParentId: plan.newParentId, afterSiblingId: plan.afterSiblingId });
        await this.onSaved(issue);
      });
    },

    async startBulk(kind) {
      this.notice = '';
      if (kind === 'delete') {
        const ids = new Set();
        for (const id of this.checked) for (const sub of subtreeIds(this.issues, id)) ids.add(sub);
        this.bulk = { kind, ids: [...ids] };
      } else {
        this.bulk = { kind, targetProjectId: '' };
        const { projects } = await call('ProjectService', 'ListProjects', { requestedAtMs: Date.now() });
        this.otherProjects = projects.filter((p) => p.id !== this.current.id);
      }
    },
    bulkDelete() {
      return this.run(async () => {
        const { deleted } = await call('IssueService', 'DeleteIssues', { issueIds: [...this.checked] });
        this.checked = new Set();
        this.bulk = null;
        await this.loadIssues();
        if (!this.issues.some((i) => i.id === this.selectedId)) this.selectedId = '';
        this.notice = `Deleted ${deleted} issue${deleted === 1 ? '' : 's'}.`;
      });
    },
    bulkMove() {
      return this.run(async () => {
        const { newKeys } = await call('IssueService', 'MoveIssuesToProject', { issueIds: [...this.checked], targetProjectId: this.bulk.targetProjectId });
        this.checked = new Set();
        this.bulk = null;
        await this.onSaved(null);
        const moved = Object.entries(newKeys).sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }));
        this.notice = `Moved ${moved.length}: ${moved.map(([from, to]) => `${from} → ${to}`).join(', ')}.`;
      });
    },

    openSettings() {
      this.settings = { name: this.current.name, color: this.current.color, confirmKey: '' };
      this.showSettings = !this.showSettings;
    },
    saveSettings() {
      return this.run(async () => {
        const { project } = await call('ProjectService', 'UpdateProject', { id: this.current.id, name: this.settings.name, color: this.settings.color });
        this.current = project;
        this.showSettings = false;
      });
    },
    deleteProject() {
      return this.run(async () => {
        await call('ProjectService', 'DeleteProject', { id: this.current.id });
        this.$emit('deleted');
      });
    },

    // Closed = in a terminal state; closed issues sort after open siblings.
    isClosed(issue) { return !!this.states[issue.stateId]?.isTerminal; },
    async loadIssues() {
      this.issues = (await call('IssueService', 'ListIssues', { projectId: this.current.id })).issues;
    },
    // Types usable in this project, plus every state of their workflows
    // (the State column and the dialog need the names).
    async loadTypes() {
      const { issueTypes } = await call('IssueTypeService', 'ListIssueTypes', { projectId: this.current.id, includeGlobal: true, requestedAtMs: Date.now() });
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
      this.columns = (await call('ProjectService', 'GetColumnPrefs', { projectId: this.current.id })).columns;
    },
    async toggleColumn(id, on) {
      const next = COLUMNS.map((c) => c.id).filter((c) => (c === id ? on : this.columns.includes(c)));
      this.columns = next;
      try {
        await call('ProjectService', 'SetColumnPrefs', { projectId: this.current.id, columns: next });
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
      this.checked = new Set([...this.checked].filter((id) => this.issues.some((i) => i.id === id)));
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
.lh-settings-btn {
  margin-left: auto;
}
.lh-panel {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px 12px;
  margin: 10px 0 0;
  border: 1px solid var(--lh-line);
  border-radius: 8px;
  background: #faf9fc;
}
.lh-panel label {
  display: flex;
  align-items: center;
  gap: 6px;
}
.lh-panel-danger {
  border-color: var(--lh-danger);
  background: #fdf3f3;
}
.lh-danger-zone {
  color: var(--lh-danger);
  font-size: 0.85rem;
}
.lh-confirm-key {
  width: 110px;
}
.lh-color {
  width: 40px;
  height: 30px;
  border: none;
  padding: 0;
  background: none;
}
.lh-notice {
  margin: 8px 0 0;
  color: #2e6b34;
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
