import { defineStore } from 'pinia';
import { pageClient, widgetClient } from '@/grpc/client';

export const usePageStore = defineStore('page', {
  state: () => ({
    slug: null,
    pageId: null,
    title: '',
    layoutRoot: null,
    widgetPlaceholders: [],
    widgetContent: {}, // widgetId -> WidgetContent
    layoutStatus: 'idle', // 'idle' | 'loading' | 'ready' | 'error'
    contentStatus: 'idle',
    error: null,
  }),
  actions: {
    async loadPage(slug) {
      this.$patch({
        slug,
        pageId: null,
        title: '',
        layoutRoot: null,
        widgetPlaceholders: [],
        widgetContent: {},
        layoutStatus: 'loading',
        contentStatus: 'idle',
        error: null,
      });

      let layout;
      try {
        layout = await pageClient.getPageLayout(slug);
      } catch (err) {
        this.$patch({ layoutStatus: 'error', error: describeError(err) });
        return;
      }

      this.$patch({
        pageId: layout.pageId,
        title: layout.title,
        layoutRoot: layout.root,
        widgetPlaceholders: layout.widgets,
        layoutStatus: 'ready',
      });

      if (layout.widgets.length === 0) {
        this.contentStatus = 'ready';
        return;
      }

      this.contentStatus = 'loading';
      try {
        const contentResponse = await widgetClient.getWidgetContent(layout.widgets.map((w) => w.widgetId));
        const widgetContent = {};
        for (const widget of contentResponse.widgets) widgetContent[widget.widgetId] = widget;
        this.$patch({ widgetContent, contentStatus: 'ready' });
      } catch (err) {
        this.$patch({ contentStatus: 'error', error: describeError(err) });
      }
    },
  },
});

function describeError(err) {
  // grpc-web errors carry a numeric `.code` (grpc.status.*) and `.message`;
  // fall back to a plain message for anything else (e.g. a thrown Error
  // from the client stub itself).
  if (err && typeof err.code === 'number') return { code: err.code, message: err.message };
  return { code: null, message: err?.message ?? String(err) };
}
