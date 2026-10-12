<template>
  <div class="lh-projects">
    <header class="lh-projects-head">
      <h2>l'horaire</h2>
      <span class="lh-head-actions">
        <button type="button" class="lh-btn lh-btn-quiet" @click="$emit('types')">Issue types</button>
        <button v-if="!creating" type="button" class="lh-btn" @click="creating = true">New project</button>
      </span>
    </header>

    <form v-if="creating" class="lh-new-project" @submit.prevent="create">
      <input v-model="draft.key" class="lh-input" placeholder="key, e.g. ffdb" maxlength="10" autofocus />
      <input v-model="draft.name" class="lh-input lh-grow" placeholder="Project name" />
      <input v-model="draft.color" type="color" class="lh-color" title="Project colour" />
      <button type="submit" class="lh-btn" :disabled="busy || !draft.key || !draft.name">Create</button>
      <button type="button" class="lh-btn lh-btn-quiet" @click="creating = false">Cancel</button>
    </form>
    <p v-if="error" class="lh-error">{{ error }}</p>

    <p v-if="loading" class="lh-quiet">Loading…</p>
    <p v-else-if="projects.length === 0" class="lh-quiet">No projects yet.</p>
    <ul v-else class="lh-project-cards">
      <li v-for="p in projects" :key="p.id">
        <button type="button" class="lh-project-card" @click="$emit('open', p)">
          <span class="lh-project-key" :style="{ background: p.color }">{{ p.key }}</span>
          <span class="lh-project-name">{{ p.name }}</span>
        </button>
      </li>
    </ul>
  </div>
</template>

<script>
import { call } from './client.js';

export default {
  name: 'ProjectList',
  emits: ['open', 'types'],
  data() {
    return {
      projects: [], loading: true, error: '', creating: false, busy: false,
      draft: { key: '', name: '', color: '#4a6fa5' },
    };
  },
  async created() {
    try {
      this.projects = (await call('ProjectService', 'ListProjects', { requestedAtMs: Date.now() })).projects;
    } catch (err) {
      this.error = err.message;
    } finally {
      this.loading = false;
    }
  },
  methods: {
    async create() {
      this.busy = true;
      this.error = '';
      try {
        const { project } = await call('ProjectService', 'CreateProject', { ...this.draft });
        this.$emit('open', project);
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
.lh-projects {
  padding: 24px;
  max-width: 860px;
}
.lh-projects-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.lh-projects-head h2 {
  margin: 0;
  font-size: 1.4rem;
}
.lh-head-actions {
  display: flex;
  gap: 8px;
}
.lh-new-project {
  display: flex;
  gap: 8px;
  margin: 16px 0 8px;
  align-items: center;
}
.lh-grow {
  flex: 1;
}
.lh-color {
  width: 40px;
  height: 32px;
  border: none;
  padding: 0;
  background: none;
}
.lh-project-cards {
  list-style: none;
  padding: 0;
  margin: 16px 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}
.lh-project-card {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px;
  border: 1px solid var(--lh-line);
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  text-align: left;
  font: inherit;
}
.lh-project-card:hover {
  background: var(--lh-hover);
}
.lh-project-key {
  color: #fff;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 5px;
  font-size: 0.85rem;
}
.lh-project-name {
  font-weight: 600;
}
</style>
