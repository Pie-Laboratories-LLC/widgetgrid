<template>
  <svg class="type-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path v-for="(d, i) in paths" :key="i" :d="d" />
  </svg>
</template>

<script>
import { iconPaths } from './icons.js';

export default {
  name: 'TypeIcon',
  props: { name: { type: String, default: 'task' } },
  computed: {
    paths() { return iconPaths(this.name); },
  },
};
</script>

<style scoped>
.type-icon {
  width: 1em;
  height: 1em;
  flex: none;
}
</style>
