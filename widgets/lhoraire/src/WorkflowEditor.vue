<template>
  <div class="lh-overlay" @click.self="$emit('close')">
    <section class="lh-dialog lh-wf" role="dialog" aria-modal="true" :aria-label="`Workflow for ${issueType.name}`">
      <header class="lh-dialog-head">
        <h3>Workflow · {{ issueType.name }}</h3>
        <button type="button" class="lh-close" aria-label="Close" @click="$emit('close')">×</button>
      </header>

      <div class="lh-wf-copy">
        <label>Replace with a copy of
          <select class="lh-input" :value="''" @change="copyFrom($event.target.value)">
            <option value="" disabled>another type's workflow…</option>
            <option v-for="t in copySources" :key="t.id" :value="t.id">{{ t.name }}{{ t.projectId ? '' : ' (global)' }}</option>
          </select>
        </label>
        <button type="button" class="lh-btn lh-btn-quiet" @click="draft = fromWorkflow(workflow)">Undo all changes</button>
      </div>

      <h4>States</h4>
      <table class="lh-wf-states">
        <thead>
          <tr><th /><th>Name</th><th>Start</th><th>Terminal</th><th>Issues</th><th /></tr>
        </thead>
        <tbody>
          <tr v-for="(s, i) in draft.states" :key="s.ref">
            <td class="lh-wf-order">
              <button type="button" :disabled="i === 0" aria-label="Move up" @click="draft = moveState(draft, s.ref, -1)">↑</button>
              <button type="button" :disabled="i === draft.states.length - 1" aria-label="Move down" @click="draft = moveState(draft, s.ref, 1)">↓</button>
            </td>
            <td><input v-model="s.name" class="lh-input" :aria-label="`State ${i + 1} name`" /></td>
            <td><input type="radio" name="initial" :checked="s.isInitial" :aria-label="`${s.name} is the starting state`" @change="draft = setInitial(draft, s.ref)" /></td>
            <td>
              <input
                type="checkbox" :checked="s.isTerminal" :disabled="s.isInitial || flagLocked(s)"
                :title="flagLocked(s) ? 'Has issues in it -- move them out first' : s.isInitial ? 'The starting state can\'t be terminal' : ''"
                :aria-label="`${s.name} is terminal`" @change="draft = setTerminal(draft, s.ref, $event.target.checked)"
              />
            </td>
            <td class="lh-quiet">{{ usage[s.ref] ?? '' }}</td>
            <td><button type="button" class="lh-remove" :aria-label="`Remove ${s.name}`" @click="draft = removeState(draft, s.ref)">×</button></td>
          </tr>
        </tbody>
      </table>
      <button type="button" class="lh-btn lh-btn-quiet" @click="draft = addState(draft)">Add state</button>

      <h4>Transitions <small class="lh-quiet">(row = from, column = to)</small></h4>
      <div class="lh-wf-grid-wrap">
        <table class="lh-wf-grid">
          <thead>
            <tr><th /><th v-for="to in draft.states" :key="to.ref">{{ to.name || '…' }}</th></tr>
          </thead>
          <tbody>
            <tr v-for="from in draft.states" :key="from.ref">
              <th>{{ from.name || '…' }}<small v-if="from.isTerminal" class="lh-quiet"> (final)</small></th>
              <td v-for="to in draft.states" :key="to.ref">
                <input
                  v-if="from.ref !== to.ref" type="checkbox" :disabled="from.isTerminal"
                  :checked="draft.transitions.has(`${from.ref}>${to.ref}`)"
                  :aria-label="`${from.name} to ${to.name}`"
                  @change="draft = toggleTransition(draft, from.ref, to.ref)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <section v-if="pending.length" class="lh-wf-mapping">
        <h4>Issues in removed states</h4>
        <label v-for="s in pending" :key="s.id">
          {{ s.issues }} issue{{ s.issues === 1 ? '' : 's' }} in <strong>{{ s.name }}</strong> move to
          <select v-model="mapping[s.id]" class="lh-input">
            <option value="" disabled>state…</option>
            <option v-for="t in mappingTargets(draft, s)" :key="t.ref" :value="t.ref">{{ t.name }}</option>
          </select>
        </label>
      </section>

      <ul v-if="issues.length" class="lh-error lh-wf-problems">
        <li v-for="p in issues" :key="p">{{ p }}</li>
      </ul>
      <p v-if="error" class="lh-error">{{ error }}</p>
      <div class="lh-actions">
        <span class="lh-spacer" />
        <button type="button" class="lh-btn lh-btn-quiet" @click="$emit('close')">Cancel</button>
        <button type="button" class="lh-btn" :disabled="busy || issues.length > 0" @click="save">Save workflow</button>
      </div>
    </section>
  </div>
</template>

<script>
import { call } from './client.js';
import * as wf from './workflowDraft.js';

export default {
  name: 'WorkflowEditor',
  props: {
    issueType: { type: Object, required: true },
    workflow: { type: Object, required: true },
    usage: { type: Object, required: true }, // stateId -> issue count
    copySources: { type: Array, required: true }, // types whose workflow may be copied
  },
  emits: ['close', 'saved'],
  data() {
    return { draft: wf.fromWorkflow(this.workflow), mapping: {}, busy: false, error: '' };
  },
  computed: {
    pending() { return wf.removedOccupied(this.draft, this.workflow, this.usage); },
    issues() {
      const out = wf.problems(this.draft);
      if (this.pending.some((s) => !this.draft.states.some((d) => d.ref === this.mapping[s.id]))) {
        out.push('Choose where the issues in removed states go.');
      }
      return out;
    },
  },
  methods: {
    ...wf,
    // An existing state with issues can't switch terminal/not.
    flagLocked(state) {
      return !state.ref.startsWith('new:') && (this.usage[state.ref] ?? 0) > 0;
    },
    async copyFrom(typeId) {
      try {
        const { workflow } = await call('IssueTypeService', 'GetIssueType', { id: typeId });
        this.draft = wf.copyOf(workflow);
        this.mapping = {};
      } catch (err) {
        this.error = err.message;
      }
    },
    async save() {
      this.busy = true;
      this.error = '';
      try {
        const mapping = Object.fromEntries(this.pending.map((s) => [s.id, this.mapping[s.id]]));
        await call('IssueTypeService', 'UpdateWorkflow', wf.toRequest(this.draft, this.issueType.id, mapping));
        this.$emit('saved');
        this.$emit('close');
      } catch (err) {
        this.error = err.message;
      } finally {
        this.busy = false;
      }
    },
  },
};
</script>

<style scoped>
.lh-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(10, 5, 20, 0.45);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 48px 16px;
  overflow-y: auto;
}
.lh-dialog {
  width: 820px;
  max-width: 100%;
  background: #fff;
  border-radius: 12px;
  padding: 20px 24px 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
}
.lh-dialog-head {
  display: flex;
  align-items: center;
}
.lh-dialog-head h3 {
  margin: 0;
  flex: 1;
  font-size: 1.1rem;
}
.lh-close {
  border: none;
  background: none;
  font-size: 1.6rem;
  cursor: pointer;
  color: var(--lh-quiet);
}
h4 {
  margin: 18px 0 8px;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--lh-quiet);
}
.lh-wf-copy {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 12px;
}
.lh-wf-copy label {
  display: flex;
  gap: 8px;
  align-items: center;
}
.lh-wf-states {
  border-collapse: collapse;
  margin-bottom: 8px;
}
.lh-wf-states th,
.lh-wf-states td {
  padding: 4px 8px;
  text-align: left;
  font-size: 0.85rem;
}
.lh-wf-states th {
  color: var(--lh-quiet);
  font-weight: 600;
}
.lh-wf-order button,
.lh-remove {
  border: none;
  background: none;
  cursor: pointer;
  color: var(--lh-quiet);
  font-size: 1rem;
}
.lh-wf-order button:disabled {
  opacity: 0.25;
  cursor: default;
}
.lh-wf-grid-wrap {
  overflow-x: auto;
}
.lh-wf-grid {
  border-collapse: collapse;
}
.lh-wf-grid th,
.lh-wf-grid td {
  border: 1px solid var(--lh-line);
  padding: 6px 10px;
  text-align: center;
  font-size: 0.85rem;
  white-space: nowrap;
}
.lh-wf-grid tbody th {
  text-align: left;
  background: #faf9fc;
}
.lh-wf-mapping label {
  display: flex;
  gap: 8px;
  align-items: center;
  margin: 6px 0;
}
.lh-wf-problems {
  padding-left: 18px;
}
.lh-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}
.lh-spacer {
  flex: 1;
}
</style>
