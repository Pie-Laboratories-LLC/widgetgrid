<template>
  <div class="widget-slot" :class="{ loading: !isReady }" :data-widget-type="widgetType">
    <component
      v-if="isReady"
      :is="resolvedComponent"
      :data="parsedContent"
      :title="content.title"
      :widget-id="widgetId"
    />
  </div>
</template>

<script>
import { mapState } from 'pinia';
import { usePageStore } from '@/stores/pageStore';
import { loadWidgetModule } from '@/widgets/widgetLoader';

export default {
  name: 'WidgetSlot',
  props: {
    widgetId: { type: String, required: true },
    widgetType: { type: String, required: true },
  },
  data() {
    return { resolvedComponent: null };
  },
  computed: {
    ...mapState(usePageStore, ['widgetContent']),
    content() {
      return this.widgetContent[this.widgetId] ?? null;
    },
    // widget.proto's WidgetContent carries content as contentJson (a JSON
    // string), not a nested message -- see widget.proto's comment on that
    // field for why (google.protobuf.Struct doesn't round-trip through
    // @grpc/proto-loader's dynamic path). Parsed once here rather than in
    // each widget component.
    parsedContent() {
      return JSON.parse(this.content.contentJson);
    },
    // The .loading class only ever drops once BOTH the widget's JS module
    // has loaded AND its pass-2 content has arrived -- whichever finishes
    // last is what the user actually sees resolve.
    isReady() {
      return !!this.resolvedComponent && !!this.content;
    },
  },
  created() {
    loadWidgetModule(this.widgetType).then((component) => {
      this.resolvedComponent = component;
    });
    // Deliberately no .catch() UI here yet -- a widget type that fails to
    // load leaves this slot showing .loading forever rather than a broken
    // page. Revisit once there's a real error-state design for widgets
    // specifically (distinct from the page-level error state in pageStore).
  },
};
</script>

<style scoped>
.widget-slot.loading {
  min-height: 2rem;
  position: relative;
}
.widget-slot.loading::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.05), transparent);
  animation: widget-slot-shimmer 1.2s ease-in-out infinite;
}
@keyframes widget-slot-shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
</style>
