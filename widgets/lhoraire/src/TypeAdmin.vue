<template>
  <div class="lh-types">
    <header class="lh-types-head">
      <button type="button" class="lh-back" @click="$emit('back')">‹ Back</button>
      <h2>Issue types</h2>
      <label class="lh-scope">Scope
        <select v-model="scope" class="lh-input">
          <option value="">Global (every project)</option>
          <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.key }} · {{ p.name }}</option>
        </select>
      </label>
    </header>

    <p v-if="error" class="lh-error">{{ error }}</p>
    <p v-if="notice" class="lh-notice">{{ notice }}</p>

    <ul class="lh-type-list">
      <li v-for="t in types" :key="t.id" class="lh-type-row">
        <template v-if="editing?.id === t.id">
          <IconPicker v-model="editing.icon" :color="editing.color" />
          <input v-model="editing.name" class="lh-input" aria-label="Type name" />
          <input v-model="editing.color" type="color" class="lh-color" aria-label="Type colour" />
          <button type="button" class="lh-btn" :disabled="busy || !editing.name.trim()" @click="saveEdit">Save</button>
          <button type="button" class="lh-btn lh-btn-quiet" @click="editing = null">Cancel</button>
        </template>
        <template v-else>
          <span class="lh-type-badge" :style="{ color: t.color, background: `${t.color}22` }"><TypeIcon :name="t.icon" />{{ t.name }}</span>
          <span class="lh-spacer" />
          <button type="button" class="lh-btn lh-btn-quiet" @click="editing = { ...t }">Edit</button>
          <button type="button" class="lh-btn lh-btn-quiet" @click="openWorkflow(t)">Workflow</button>
          <button v-if="t.projectId" type="button" class="lh-btn lh-btn-quiet" @click="makeGlobal(t)">Make global</button>
          <span v-else class="lh-move">
            <select class="lh-input" :value="''" :aria-label="`Move ${t.name} to a project`" @change="moveToProject(t, $event.target.value)">
              <option value="" disabled>Move to project…</option>
              <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.key }}</option>
            </select>
          </span>
          <button type="button" class="lh-btn lh-btn-danger" @click="startDelete(t)">Delete</button>
        </template>
      </li>
      <li v-if="!types.length" class="lh-quiet">No types in this scope yet.</li>
    </ul>

    <section v-if="deleting" class="lh-panel lh-panel-danger" role="alert">
      <template v-if="deleting.usage.issueCount === 0">
        Delete “{{ deleting.type.name }}”? No issues use it.
        <span class="lh-spacer" />
        <button type="button" class="lh-btn lh-btn-danger" :disabled="busy" @click="confirmDelete('UNSPECIFIED')">Delete</button>
        <button type="button" class="lh-btn lh-btn-quiet" @click="deleting = null">Cancel</button>
      </template>
      <template v-else>
        <p class="lh-full-line">
          {{ deleting.usage.issueCount }} issue{{ deleting.usage.issueCount === 1 ? '' : 's' }} use “{{ deleting.type.name }}”. Move them to another type, or delete them.
        </p>
        <div class="lh-full-line lh-row-gap">
          <label>Move them to
            <select v-model="deleting.targetTypeId" class="lh-input" @change="loadTarget">
              <option value="" disabled>type…</option>
              <option v-for="t in reassignTargets" :key="t.id" :value="t.id">{{ t.name }}{{ t.projectId ? '' : ' (global)' }}</option>
            </select>
          </label>
          <template v-if="deleting.targetWorkflow">
            <label v-for="(count, stateId) in deleting.usage.issuesPerState" :key="stateId">
              {{ count }} in {{ stateName(deleting.sourceWorkflow, stateId) }} →
              <select v-model="deleting.mapping[stateId]" class="lh-input">
                <option value="" disabled>state…</option>
                <option v-for="s in targetStatesFor(stateId)" :key="s.id" :value="s.id">{{ s.name }}</option>
              </select>
            </label>
          </template>
          <button type="button" class="lh-btn" :disabled="busy || !reassignReady" @click="confirmDelete('REASSIGN')">Move and delete type</button>
        </div>
        <div class="lh-full-line lh-row-gap">
          <span>Or delete the {{ deleting.usage.issueCount }} issue{{ deleting.usage.issueCount === 1 ? '' : 's' }} — with everything below them, {{ deleting.usage.deletedWithSubtreesCount }} in all. This can't be undone.</span>
          <button type="button" class="lh-btn lh-btn-danger" :disabled="busy" @click="confirmDelete('DELETE_ISSUES')">Delete issues and type</button>
          <button type="button" class="lh-btn lh-btn-quiet" @click="deleting = null">Cancel</button>
        </div>
      </template>
    </section>

    <form class="lh-panel lh-new-type" @submit.prevent="create">
      <strong>New {{ scope ? 'project' : 'global' }} type</strong>
      <IconPicker v-model="draft.icon" :color="draft.color" />
      <input v-model="draft.name" class="lh-input" placeholder="Name, e.g. Bug" />
      <input v-model="draft.color" type="color" class="lh-color" aria-label="Colour" />
      <select v-model="draft.copyFrom" class="lh-input" aria-label="Workflow to start from">
        <option value="">Default workflow</option>
        <option v-for="t in copySources" :key="t.id" :value="t.id">Copy {{ t.name }}'s workflow</option>
      </select>
      <button type="submit" class="lh-btn" :disabled="busy || !draft.name.trim()">Create</button>
    </form>

    <WorkflowEditor
      v-if="workflowFor"
      :issue-type="workflowFor.type" :workflow="workflowFor.workflow" :usage="workflowFor.usage" :copy-sources="copySources.filter((t) => t.id !== workflowFor.type.id)"
      @close="workflowFor = null" @saved="notice = `Saved ${workflowFor.type.name}'s workflow.`"
    />
  </div>
</template>

<script>
import { call, DELETE_MODE } from './client.js';
import TypeIcon from './TypeIcon.vue';
import IconPicker from './IconPicker.vue';
import WorkflowEditor from './WorkflowEditor.vue';

export default {
  name: 'TypeAdmin',
  components: { TypeIcon, IconPicker, WorkflowEditor },
  props: { initialScope: { type: String, default: '' } },
  emits: ['back'],
  data() {
    return {
      scope: this.initialScope, projects: [], types: [], globalTypes: [],
      editing: null, deleting: null, workflowFor: null,
      draft: { name: '', icon: 'task', color: '#4a6fa5', copyFrom: '' },
      busy: false, error: '', notice: '',
    };
  },
  computed: {
    // Globals always; the scope's own types when it's a project.
    copySources() { return this.scope ? [...this.globalTypes, ...this.types] : this.globalTypes; },
    // A project type's issues can go to globals or that project's types; a
    // global type's issues may be in any project, so only to other globals.
    reassignTargets() {
      const pool = this.deleting?.type.projectId ? [...this.globalTypes, ...this.types] : this.globalTypes;
      return pool.filter((t) => t.id !== this.deleting?.type.id);
    },
    reassignReady() {
      const d = this.deleting;
      return d?.targetWorkflow && Object.keys(d.usage.issuesPerState).every((s) => d.mapping[s]);
    },
  },
  watch: {
    scope() { this.load(); },
  },
  async created() {
    try {
      this.projects = (await call('ProjectService', 'ListProjects', { requestedAtMs: Date.now() })).projects;
    } catch (err) {
      this.error = err.message;
    }
    await this.load();
  },
  methods: {
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
    async load() {
      this.editing = null;
      this.deleting = null;
      try {
        const [scoped, globals] = await Promise.all([
          call('IssueTypeService', 'ListIssueTypes', { projectId: this.scope, includeGlobal: false, requestedAtMs: Date.now() }),
          call('IssueTypeService', 'ListIssueTypes', { projectId: '', includeGlobal: false, requestedAtMs: Date.now() }),
        ]);
        this.types = scoped.issueTypes;
        this.globalTypes = globals.issueTypes;
      } catch (err) {
        this.error = err.message;
      }
    },
    create() {
      return this.run(async () => {
        await call('IssueTypeService', 'CreateIssueType', {
          projectId: this.scope, name: this.draft.name, icon: this.draft.icon, color: this.draft.color, copyWorkflowFromTypeId: this.draft.copyFrom,
        });
        this.notice = `Created ${this.draft.name.trim()}.`;
        this.draft = { name: '', icon: 'task', color: '#4a6fa5', copyFrom: '' };
        await this.load();
      });
    },
    saveEdit() {
      return this.run(async () => {
        await call('IssueTypeService', 'UpdateIssueType', { id: this.editing.id, name: this.editing.name, icon: this.editing.icon, color: this.editing.color });
        await this.load();
      });
    },
    makeGlobal(type) {
      return this.run(async () => {
        await call('IssueTypeService', 'MoveIssueTypeScope', { id: type.id, targetProjectId: '' });
        this.notice = `${type.name} is now global.`;
        await this.load();
      });
    },
    moveToProject(type, projectId) {
      return this.run(async () => {
        await call('IssueTypeService', 'MoveIssueTypeScope', { id: type.id, targetProjectId: projectId });
        this.notice = `${type.name} now belongs to ${this.projects.find((p) => p.id === projectId)?.key}.`;
        await this.load();
      });
    },
    openWorkflow(type) {
      return this.run(async () => {
        const [{ workflow }, usage] = await Promise.all([
          call('IssueTypeService', 'GetIssueType', { id: type.id }),
          call('IssueTypeService', 'GetIssueTypeUsage', { id: type.id }),
        ]);
        this.workflowFor = { type, workflow, usage: usage.issuesPerState };
      });
    },
    startDelete(type) {
      return this.run(async () => {
        const [usage, { workflow }] = await Promise.all([
          call('IssueTypeService', 'GetIssueTypeUsage', { id: type.id }),
          call('IssueTypeService', 'GetIssueType', { id: type.id }),
        ]);
        this.deleting = { type, usage, sourceWorkflow: workflow, targetTypeId: '', targetWorkflow: null, mapping: {} };
      });
    },
    async loadTarget() {
      const { workflow } = await call('IssueTypeService', 'GetIssueType', { id: this.deleting.targetTypeId });
      this.deleting.targetWorkflow = workflow;
      this.deleting.mapping = {};
    },
    stateName(workflow, stateId) { return workflow.states.find((s) => s.id === stateId)?.name ?? '?'; },
    // Open issues map to open states, closed ones to terminal states.
    targetStatesFor(stateId) {
      const source = this.deleting.sourceWorkflow.states.find((s) => s.id === stateId);
      return this.deleting.targetWorkflow.states.filter((s) => s.isTerminal === source?.isTerminal);
    },
    confirmDelete(mode) {
      return this.run(async () => {
        const d = this.deleting;
        const result = await call('IssueTypeService', 'DeleteIssueType', {
          id: d.type.id, mode: DELETE_MODE[mode], reassignToTypeId: mode === 'REASSIGN' ? d.targetTypeId : '',
          stateMappings: mode === 'REASSIGN' ? Object.entries(d.mapping).map(([fromStateId, toStateId]) => ({ fromStateId, toStateId })) : [],
        });
        this.notice = mode === 'REASSIGN'
          ? `Deleted ${d.type.name}; moved ${result.issuesReassigned} issue(s).`
          : mode === 'DELETE_ISSUES' ? `Deleted ${d.type.name} and ${result.issuesDeleted} issue(s).` : `Deleted ${d.type.name}.`;
        await this.load();
      });
    },
  },
};
</script>

<style scoped>
.lh-types {
  padding: 16px 24px;
  max-width: 980px;
}
.lh-types-head {
  display: flex;
  align-items: center;
  gap: 14px;
}
.lh-types-head h2 {
  margin: 0;
  font-size: 1.25rem;
}
.lh-back {
  border: none;
  background: none;
  color: var(--lh-quiet);
  cursor: pointer;
  font: inherit;
}
.lh-scope {
  margin-left: auto;
  display: flex;
  gap: 8px;
  align-items: center;
}
.lh-type-list {
  list-style: none;
  padding: 0;
  margin: 16px 0;
  border: 1px solid var(--lh-line);
  border-radius: 8px;
  background: #fff;
}
.lh-type-list > li {
  padding: 10px 12px;
  border-bottom: 1px solid var(--lh-line);
}
.lh-type-list > li:last-child {
  border-bottom: none;
}
.lh-type-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.lh-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 6px;
}
.lh-spacer {
  flex: 1;
}
.lh-color {
  width: 40px;
  height: 30px;
  border: none;
  padding: 0;
  background: none;
}
.lh-panel {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px 12px;
  margin: 10px 0;
  border: 1px solid var(--lh-line);
  border-radius: 8px;
  background: #faf9fc;
}
.lh-panel-danger {
  border-color: var(--lh-danger);
  background: #fdf3f3;
}
.lh-full-line {
  flex-basis: 100%;
  margin: 0;
}
.lh-row-gap {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.lh-row-gap label {
  display: flex;
  gap: 6px;
  align-items: center;
}
.lh-notice {
  color: #2e6b34;
}
</style>
