<template>
  <div :class="node.bootstrapClasses" :data-node-id="node.id" :data-node-type="node.nodeType">
    <WidgetSlot v-if="node.widgetId" :widget-id="node.widgetId" :widget-type="node.widgetType" />
    <LayoutRenderer v-for="child in node.children" :key="child.id" :node="child" />
  </div>
</template>

<script>
import WidgetSlot from './WidgetSlot.vue';

export default {
  name: 'LayoutRenderer',
  components: { WidgetSlot },
  props: {
    node: { type: Object, required: true },
  },
  // node.bootstrapClasses is trusted as the ENTIRE rendered class string --
  // this component never hardcodes a Bootstrap class of its own.
  // node.nodeType ('row'/'col') is authoring/structural metadata only, kept
  // as a data-attribute for debugging, never branched on for styling.
};
</script>
