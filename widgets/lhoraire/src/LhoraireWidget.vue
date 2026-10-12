<template>
  <div class="widget widget-lhoraire">
    <TypeAdmin v-if="typesScope !== null" :initial-scope="typesScope" @back="typesScope = null" />
    <ProjectView v-else-if="project" :key="project.id" :project="project" @back="project = null" @deleted="project = null" @types="typesScope = $event" />
    <ProjectList v-else @open="project = $event" @types="typesScope = ''" />
  </div>
</template>

<script>
import ProjectList from './ProjectList.vue';
import ProjectView from './ProjectView.vue';
import TypeAdmin from './TypeAdmin.vue';

// l'horaire: project-based, hierarchical issue tracking (see the design
// doc and packages/lhoraire-server). Two modes: outside any project (the
// project list) and inside one (its issue tree). Only reachable for the
// "anonyme admins" group -- the topbar hides the icon otherwise, and the
// server enforces it on every call.
export default {
  name: 'LhoraireWidget',
  components: { ProjectList, ProjectView, TypeAdmin },
  props: {
    data: { type: Object, required: true },
    title: { type: String, default: '' },
  },
  data() {
    // typesScope: null = not in the type admin; '' = global; a project id.
    return { project: null, typesScope: null };
  },
};
</script>

<style>
.widget-lhoraire {
  --lh-ink: #222;
  --lh-quiet: #6b6b6b;
  --lh-line: #e3e0ea;
  --lh-hover: #f7f5fa;
  --lh-selected: #ebe4f7;
  --lh-accent: #150a2e;
  --lh-accent-ink: #f4ead9;
  --lh-danger: #a4262c;
  color: var(--lh-ink);
  font-size: 0.92rem;
  height: 100%;
  box-sizing: border-box;
}
.widget-lhoraire button.lh-btn {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid var(--lh-accent);
  background: var(--lh-accent);
  color: var(--lh-accent-ink);
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
}
.widget-lhoraire button.lh-btn:disabled {
  opacity: 0.45;
  cursor: default;
}
.widget-lhoraire button.lh-btn-quiet {
  background: none;
  color: var(--lh-ink);
  border-color: #ccc;
}
.widget-lhoraire button.lh-btn-danger {
  background: none;
  color: var(--lh-danger);
  border-color: var(--lh-danger);
}
.widget-lhoraire input.lh-input,
.widget-lhoraire select.lh-input,
.widget-lhoraire textarea.lh-input {
  padding: 6px 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font: inherit;
  box-sizing: border-box;
}
.widget-lhoraire .lh-error {
  color: var(--lh-danger);
  margin: 6px 0;
}
.widget-lhoraire .lh-quiet {
  color: var(--lh-quiet);
}
</style>
