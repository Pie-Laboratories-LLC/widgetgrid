<template>
  <div class="lh-icon-picker" role="radiogroup" aria-label="Icon">
    <button
      v-for="name in names" :key="name" type="button" role="radio" :aria-checked="name === modelValue" :title="name"
      :class="{ 'lh-icon-on': name === modelValue }" :style="name === modelValue ? { color, borderColor: color } : {}"
      @click="$emit('update:modelValue', name)"
    ><TypeIcon :name="name" /></button>
  </div>
</template>

<script>
import TypeIcon from './TypeIcon.vue';
import { TYPE_ICONS } from './icons.js';

export default {
  name: 'IconPicker',
  components: { TypeIcon },
  props: {
    modelValue: { type: String, default: 'task' },
    color: { type: String, default: '#4a6fa5' },
  },
  emits: ['update:modelValue'],
  data() {
    return { names: Object.keys(TYPE_ICONS) };
  },
};
</script>

<style scoped>
.lh-icon-picker {
  display: inline-flex;
  gap: 2px;
}
.lh-icon-picker button {
  border: 1px solid transparent;
  background: none;
  border-radius: 6px;
  padding: 4px 5px;
  cursor: pointer;
  color: var(--lh-quiet);
  font-size: 1.05rem;
  line-height: 0;
}
.lh-icon-picker button.lh-icon-on {
  border-width: 2px;
  background: #fff;
}
</style>
