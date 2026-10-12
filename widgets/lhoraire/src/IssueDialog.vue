<template>
  <div class="lh-overlay" @click.self="$emit('close')">
    <section class="lh-dialog" role="dialog" aria-modal="true" :aria-label="heading">
      <header class="lh-dialog-head">
        <span v-if="issue" class="lh-key" :style="{ background: project.color }"><TypeIcon :name="currentType.icon" />{{ issue.key }}</span>
        <h3>{{ heading }}</h3>
        <button type="button" class="lh-close" aria-label="Close" @click="$emit('close')">×</button>
      </header>

      <p v-if="loading" class="lh-quiet">Loading…</p>
      <template v-else>
        <div v-if="staleMessage" class="lh-stale" role="alert">
          {{ staleMessage }}
          <button type="button" class="lh-btn lh-btn-quiet" @click="reload">Reload</button>
        </div>

        <form class="lh-fields" @submit.prevent="save">
          <label class="lh-field lh-wide">
            <span>Summary <small class="lh-quiet">{{ form.summary.length }}/256</small></span>
            <input v-model="form.summary" class="lh-input" maxlength="256" required autofocus />
          </label>
          <label class="lh-field">
            <span>Type</span>
            <select v-model="form.issueTypeId" class="lh-input">
              <option v-for="t in typeList" :key="t.id" :value="t.id">{{ t.name }}{{ t.projectId ? '' : ' (global)' }}</option>
            </select>
          </label>
          <label v-if="typeChanged" class="lh-field">
            <span>State in {{ types[form.issueTypeId]?.name }}</span>
            <select v-model="form.stateIdInNewType" class="lh-input" required>
              <option value="" disabled>Choose…</option>
              <option v-for="s in mappableStates" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
          </label>
          <label class="lh-field">
            <span>Severity</span>
            <select v-model="form.severity" class="lh-input">
              <option v-for="s in severities" :key="s.value" :value="s.value">{{ s.label }}</option>
            </select>
          </label>
          <label class="lh-field">
            <span>Parent</span>
            <span class="lh-inline-field">
              <input v-model="form.parentKey" class="lh-input lh-grow" placeholder="top level" />
              <button v-if="form.parentKey" type="button" class="lh-btn lh-btn-quiet" title="Make it a top-level issue" @click="form.parentKey = ''">Top level</button>
            </span>
          </label>
          <label v-if="issue" class="lh-field">
            <span>State</span>
            <span v-if="currentState.isTerminal" class="lh-state-final">
              <strong>{{ currentState.name }}</strong> — {{ endReasonLabel(issue.endReason) }}: {{ issue.endDescription }}
            </span>
            <select v-else v-model="form.stateId" class="lh-input" :disabled="typeChanged" :title="typeChanged ? 'Save the type change first' : ''">
              <option :value="issue.stateId">{{ currentState.name }} (current)</option>
              <option v-for="s in nextStates" :key="s.id" :value="s.id">→ {{ s.name }}</option>
            </select>
          </label>
          <template v-if="closingNow">
            <label class="lh-field">
              <span>End reason</span>
              <select v-model="form.endReason" class="lh-input" required>
                <option value="" disabled>Choose…</option>
                <option v-for="r in endReasons" :key="r.value" :value="r.value">{{ r.label }}</option>
              </select>
            </label>
            <label class="lh-field">
              <span>Why it was closed</span>
              <input v-model="form.endDescription" class="lh-input" required />
            </label>
          </template>
          <label class="lh-field">
            <span>Assignee</span>
            <select v-model="form.assigneeId" class="lh-input">
              <option value="">Unassigned</option>
              <option v-for="(email, id) in users" :key="id" :value="id">{{ email }}</option>
            </select>
          </label>
          <label class="lh-field lh-wide">
            <span>Description</span>
            <textarea v-model="form.description" class="lh-input" rows="6" />
          </label>
          <div class="lh-actions lh-wide">
            <span class="lh-spacer" />
            <button type="submit" class="lh-btn" :disabled="busy || !dirty || (typeChanged && !form.stateIdInNewType) || (closingNow && (!form.endReason || !form.endDescription.trim()))">
              {{ mode === 'create' ? 'Create' : 'Save' }}
            </button>
          </div>
        </form>
        <p v-if="error" class="lh-error">{{ error }}</p>

        <template v-if="issue">
          <section class="lh-section">
            <h4>Links</h4>
            <ul v-if="links.length" class="lh-links">
              <li v-for="l in links" :key="l.id">
                <span class="lh-quiet">{{ linkLabel(l.kind) }}</span>
                <button type="button" class="lh-linkkey" @click="$emit('open-issue', l.otherIssueId)">{{ l.otherIssueKey }}</button>
                <span class="lh-link-summary">{{ l.otherIssueSummary }}</span>
                <button type="button" class="lh-remove" :aria-label="`Remove link to ${l.otherIssueKey}`" @click="removeLink(l)">×</button>
              </li>
            </ul>
            <form class="lh-add-link" @submit.prevent="addLink">
              <select v-model="newLink.kind" class="lh-input">
                <option v-for="k in linkKinds" :key="k.value" :value="k.value">{{ k.label }}</option>
              </select>
              <input v-model="newLink.key" class="lh-input" placeholder="issue key, e.g. ffdb-2" />
              <button type="submit" class="lh-btn lh-btn-quiet" :disabled="busy || !newLink.key.trim()">Add link</button>
            </form>
          </section>

          <section class="lh-section">
            <h4>Comments</h4>
            <article v-for="c in comments" :key="c.id" class="lh-comment">
              <header class="lh-quiet">
                {{ users[c.createdBy] ?? 'someone' }} · {{ when(c.createdAt) }}
                <span v-if="c.editedAt"> · edited by {{ users[c.editedBy] ?? 'someone' }} {{ when(c.editedAt) }}</span>
                <button v-if="editingComment?.id !== c.id" type="button" class="lh-link" @click="editingComment = { id: c.id, body: c.body }">Edit</button>
              </header>
              <form v-if="editingComment?.id === c.id" @submit.prevent="saveComment">
                <textarea v-model="editingComment.body" class="lh-input lh-full" rows="3" />
                <button type="submit" class="lh-btn" :disabled="busy || !editingComment.body.trim()">Save</button>
                <button type="button" class="lh-btn lh-btn-quiet" @click="editingComment = null">Cancel</button>
              </form>
              <p v-else class="lh-comment-body">{{ c.body }}</p>
            </article>
            <form class="lh-add-comment" @submit.prevent="addComment">
              <textarea v-model="newComment" class="lh-input lh-full" rows="3" placeholder="Add a comment" />
              <button type="submit" class="lh-btn lh-btn-quiet" :disabled="busy || !newComment.trim()">Comment</button>
            </form>
          </section>

          <section class="lh-section">
            <details>
              <summary><h4 class="lh-inline">History</h4></summary>
              <ol class="lh-history">
                <li v-for="e in history" :key="e.id">
                  <span class="lh-quiet">{{ when(e.at) }} · {{ e.actorEmail }}</span> {{ describe(e) }}
                </li>
              </ol>
            </details>
            <p class="lh-quiet lh-meta">
              Created {{ when(issue.createdAt) }} by {{ users[issue.createdBy] }} · modified {{ when(issue.modifiedAt) }} by {{ users[issue.modifiedBy] }}
            </p>
          </section>
        </template>
      </template>
    </section>
  </div>
</template>

<script>
import { call, GRPC_CODES } from './client.js';
import TypeIcon from './TypeIcon.vue';
import { SEVERITIES, END_REASONS, LINK_KINDS } from './icons.js';
import { lastOpenChild } from './tree.js';

const FIELDS = ['issueTypeId', 'summary', 'description', 'severity', 'assigneeId'];

export default {
  name: 'IssueDialog',
  components: { TypeIcon },
  props: {
    mode: { type: String, required: true }, // 'create' | 'edit'
    issueId: { type: String, default: '' },
    parent: { type: Object, default: null },
    project: { type: Object, required: true },
    types: { type: Object, required: true }, // id -> type (with workflow)
    typeList: { type: Array, required: true },
    users: { type: Object, required: true },
    issues: { type: Array, required: true }, // the project's issues (for keys and placement)
    isClosed: { type: Function, required: true },
  },
  emits: ['close', 'saved', 'open-issue'],
  data() {
    return {
      loading: this.mode === 'edit', busy: false, error: '', staleMessage: '',
      issue: null, comments: [], links: [], history: [],
      form: {
        issueTypeId: '', summary: '', description: '', severity: 'normal', assigneeId: '', stateIdInNewType: '',
        parentKey: this.parent?.key ?? '', stateId: '', endReason: '', endDescription: '',
      },
      newComment: '', editingComment: null, newLink: { kind: 'depends_on', key: '' },
      severities: SEVERITIES, endReasons: END_REASONS, linkKinds: LINK_KINDS,
    };
  },
  computed: {
    heading() {
      if (this.mode === 'create') return this.parent ? `New child of ${this.parent.key}` : 'New issue';
      return this.issue?.summary ?? '';
    },
    currentType() { return this.types[this.issue?.issueTypeId] ?? { icon: 'task', workflow: { states: [], transitions: [] } }; },
    currentState() { return this.currentType.workflow.states.find((s) => s.id === this.issue?.stateId) ?? { name: '…', isTerminal: false }; },
    nextStates() {
      const { states, transitions } = this.currentType.workflow;
      return transitions.filter((t) => t.fromStateId === this.issue.stateId).map((t) => states.find((s) => s.id === t.toStateId)).filter(Boolean);
    },
    typeChanged() { return this.mode === 'edit' && this.issue && this.form.issueTypeId !== this.issue.issueTypeId; },
    originalParentKey() {
      return this.issues.find((i) => i.id === this.issue?.parentId)?.key ?? '';
    },
    parentChanged() { return this.mode === 'edit' && this.form.parentKey.trim().toLowerCase() !== this.originalParentKey; },
    stateChanged() { return this.mode === 'edit' && this.issue && this.form.stateId !== this.issue.stateId; },
    closingNow() {
      return this.stateChanged && !!this.currentType.workflow.states.find((s) => s.id === this.form.stateId)?.isTerminal;
    },
    // A type change keeps open/closed: only states with the same terminal-ness.
    mappableStates() {
      const states = this.types[this.form.issueTypeId]?.workflow.states ?? [];
      return states.filter((s) => s.isTerminal === this.currentState.isTerminal);
    },
    dirty() {
      if (this.mode === 'create') return this.form.summary.trim().length > 0;
      return FIELDS.some((f) => this.form[f] !== this.issue[f]) || this.parentChanged || this.stateChanged;
    },
  },
  watch: {
    'form.issueTypeId'() { this.form.stateIdInNewType = ''; },
    'form.stateId'() {
      this.form.endReason = '';
      this.form.endDescription = '';
    },
  },
  mounted() {
    // On the window, not the overlay: after a save the focused element is
    // re-rendered away, and Escape must still close the dialog.
    window.addEventListener('keydown', this.onKeydown);
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.onKeydown);
  },
  async created() {
    if (this.mode === 'create') {
      const task = this.typeList.find((t) => !t.projectId && t.name === 'Task') ?? this.typeList[0];
      this.form.issueTypeId = task?.id ?? '';
      return;
    }
    await this.reload();
  },
  methods: {
    onKeydown(e) {
      if (e.key === 'Escape') this.$emit('close');
    },
    when(iso) { return iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : ''; },
    endReasonLabel(v) { return END_REASONS.find((r) => r.value === v)?.label ?? v; },
    linkLabel(v) { return LINK_KINDS.find((k) => k.value === v)?.label ?? v; },

    // Server errors: a stale write gets a reload prompt instead of being lost.
    async run(action) {
      this.busy = true;
      this.error = '';
      try {
        await action();
      } catch (err) {
        if (err.code === GRPC_CODES.ABORTED) this.staleMessage = err.message;
        else this.error = err.message;
      } finally {
        this.busy = false;
      }
    },

    async reload() {
      this.loading = true;
      this.staleMessage = '';
      try {
        const [{ issue }, { comments }, { links }, { events }] = await Promise.all([
          call('IssueService', 'GetIssue', { id: this.issueId }),
          call('IssueService', 'ListComments', { issueId: this.issueId }),
          call('IssueService', 'ListLinks', { issueId: this.issueId }),
          call('IssueService', 'GetIssueHistory', { issueId: this.issueId }),
        ]);
        this.issue = issue;
        this.comments = comments;
        this.links = links;
        this.history = events;
        this.form = {
          ...Object.fromEntries(FIELDS.map((f) => [f, issue[f]])), stateIdInNewType: '',
          parentKey: this.issues.find((i) => i.id === issue.parentId)?.key ?? '', stateId: issue.stateId, endReason: '', endDescription: '',
        };
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    // A typed parent key -> that issue's id ('' = top level). Must be in
    // this project (the tree is per project).
    async resolveParent() {
      const key = this.form.parentKey.trim().toLowerCase();
      if (!key) return '';
      const local = this.issues.find((i) => i.key === key);
      if (local) return local.id;
      const { issue } = await call('IssueService', 'GetIssue', { key });
      if (issue.projectId !== this.project.id) throw new Error(`${key} is in another project.`);
      return issue.id;
    },

    // Save applies, in order: field edits, a move to the new parent, then
    // the state change -- so assigning and starting work is one save. Rules
    // that would fail midway are checked first, before anything is sent.
    save() {
      return this.run(async () => {
        const parentId = await this.resolveParent();
        if (this.mode === 'create') {
          const { issue } = await call('IssueService', 'CreateIssue', {
            projectId: this.project.id, parentId, ...Object.fromEntries(FIELDS.map((f) => [f, this.form[f]])),
          });
          this.$emit('saved', issue);
          this.$emit('close');
          return;
        }
        if (this.stateChanged && !this.form.assigneeId) throw new Error('Assign the issue before changing its state.');
        if (this.parentChanged && parentId === this.issue.id) throw new Error("An issue can't be its own parent.");

        let { version } = this.issue;
        const changes = Object.fromEntries(FIELDS.filter((f) => this.form[f] !== this.issue[f]).map((f) => [f, this.form[f]]));
        let latest = this.issue;
        if (Object.keys(changes).length) {
          ({ issue: latest } = await call('IssueService', 'UpdateIssue', {
            id: this.issue.id, version, ...changes,
            stateIdInNewType: this.typeChanged ? this.form.stateIdInNewType : '',
          }));
          version = latest.version;
        }
        if (this.parentChanged) {
          const after = lastOpenChild(this.issues, parentId, this.isClosed, this.issue.id);
          ({ issue: latest } = await call('IssueService', 'MoveIssue', { id: this.issue.id, newParentId: parentId, afterSiblingId: after?.id ?? '' }));
          version = latest.version;
        }
        if (this.stateChanged && !this.typeChanged) {
          ({ issue: latest } = await call('IssueService', 'TransitionIssue', {
            id: this.issue.id, version, toStateId: this.form.stateId,
            endReason: this.closingNow ? this.form.endReason : '', endDescription: this.closingNow ? this.form.endDescription : '',
          }));
        }
        this.$emit('saved', latest);
        await this.reload();
      });
    },

    addComment() {
      return this.run(async () => {
        await call('IssueService', 'AddComment', { issueId: this.issue.id, body: this.newComment });
        this.newComment = '';
        await this.reload();
      });
    },
    saveComment() {
      return this.run(async () => {
        await call('IssueService', 'EditComment', { id: this.editingComment.id, body: this.editingComment.body });
        this.editingComment = null;
        await this.reload();
      });
    },

    addLink() {
      return this.run(async () => {
        await call('IssueService', 'AddLink', { issueId: this.issue.id, kind: this.newLink.kind, otherIssueKey: this.newLink.key.trim() });
        this.newLink.key = '';
        await this.reload();
      });
    },
    removeLink(link) {
      return this.run(async () => {
        await call('IssueService', 'RemoveLink', { id: link.id });
        await this.reload();
      });
    },

    // One readable line per history event.
    describe(e) {
      const oldV = JSON.parse(e.oldValueJson);
      const newV = JSON.parse(e.newValueJson);
      const show = (v) => (v === null || v === '' ? 'nothing' : typeof v === 'object' ? JSON.stringify(v) : `"${v}"`);
      switch (e.kind) {
        case 'created': return 'created the issue';
        case 'transition':
          return typeof newV === 'object' && newV
            ? `moved it from ${oldV} to ${newV.state} (${this.endReasonLabel(newV.endReason)}: ${newV.endDescription})`
            : `moved it from ${oldV} to ${newV}`;
        case 'comment_added': return 'commented';
        case 'comment_edited': return 'edited a comment';
        case 'link_added': return `linked it: ${this.linkLabel(newV.kind)} ${newV.issue}`;
        case 'link_removed': return `removed the link: ${this.linkLabel(oldV.kind)} ${oldV.issue}`;
        case 'field':
          if (e.field === 'description') return 'edited the description';
          if (e.field === 'key') return `moved it to another project: ${oldV} → ${newV}`;
          return `changed ${e.field.replace('_', ' ')} from ${show(oldV)} to ${show(newV)}`;
        default: return e.kind;
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
  width: 760px;
  max-width: 100%;
  background: #fff;
  border-radius: 12px;
  padding: 20px 24px 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
}
.lh-dialog-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}
.lh-dialog-head h3 {
  margin: 0;
  font-size: 1.1rem;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.lh-close {
  border: none;
  background: none;
  font-size: 1.6rem;
  line-height: 1;
  cursor: pointer;
  color: var(--lh-quiet);
}
.lh-key {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #fff;
  font-weight: 700;
  font-size: 0.85rem;
  padding: 2px 8px;
  border-radius: 5px;
}
.lh-fields {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px 14px;
}
.lh-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--lh-quiet);
}
.lh-field .lh-input {
  font-weight: 400;
  color: var(--lh-ink);
  font-size: 0.92rem;
}
.lh-wide {
  grid-column: 1 / -1;
}
.lh-actions,
.lh-transitions,
.lh-closing,
.lh-add-link {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.lh-spacer,
.lh-grow {
  flex: 1;
}
.lh-section {
  border-top: 1px solid var(--lh-line);
  margin-top: 16px;
  padding-top: 12px;
}
.lh-section h4 {
  margin: 0 0 8px;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--lh-quiet);
}
.lh-inline {
  display: inline;
}
.lh-inline-field {
  display: flex;
  gap: 6px;
}
.lh-state-final {
  font-weight: 400;
  color: var(--lh-ink);
  font-size: 0.92rem;
  padding: 7px 0;
}
.lh-stale {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  margin-bottom: 12px;
  border: 2px solid var(--lh-danger);
  border-radius: 8px;
  color: var(--lh-danger);
}
.lh-links {
  list-style: none;
  padding: 0;
  margin: 0 0 8px;
}
.lh-links li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}
.lh-linkkey,
.lh-link {
  border: none;
  background: none;
  color: #3b4ea8;
  cursor: pointer;
  font: inherit;
  padding: 0;
  font-weight: 600;
}
.lh-link {
  margin-left: 8px;
  font-weight: 400;
}
.lh-link-summary {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.lh-remove {
  border: none;
  background: none;
  color: var(--lh-quiet);
  cursor: pointer;
  font-size: 1.1rem;
}
.lh-comment {
  padding: 8px 0;
  border-bottom: 1px dashed var(--lh-line);
}
.lh-comment header {
  font-size: 0.8rem;
}
.lh-comment-body {
  white-space: pre-wrap;
  margin: 4px 0 0;
}
.lh-full {
  width: 100%;
  margin: 6px 0;
}
.lh-history {
  padding-left: 18px;
  font-size: 0.85rem;
}
.lh-meta {
  font-size: 0.8rem;
  margin-top: 8px;
}
</style>
