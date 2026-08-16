<template>
  <div class="widget widget-richtext">
    <h3 v-if="title">{{ title }}</h3>
    <div v-html="data?.html ?? ''"></div>
  </div>
</template>

<script>
export default {
  name: 'RichTextWidget',
  props: {
    data: { type: Object, required: true },
    title: { type: String, default: '' },
  },
};
</script>

<style scoped>
.widget-richtext h3 {
  margin-bottom: 0.5rem;
}
</style>
