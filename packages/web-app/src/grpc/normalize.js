// Pure functions, deliberately separated from client.js so they're testable
// without a live grpc-web network call. See client.js for why this
// normalization exists: protoc-gen-grpc-web's .toObject() suffixes repeated
// fields with "List", but the server's dynamic proto-loader path (and the
// rest of this app) uses plain field names.
export function normalizeLayoutResponse(obj) {
  return {
    pageId: obj.pageId,
    title: obj.title,
    root: normalizeLayoutNode(obj.root),
    widgets: obj.widgetsList,
  };
}

export function normalizeLayoutNode(node) {
  return {
    id: node.id,
    nodeType: node.nodeType,
    bootstrapClasses: node.bootstrapClasses,
    sortOrder: node.sortOrder,
    widgetId: node.widgetId,
    widgetType: node.widgetType,
    children: (node.childrenList ?? []).map(normalizeLayoutNode),
  };
}

export function normalizeWidgetContentResponse(obj) {
  return {
    widgets: obj.widgetsList,
    notFoundWidgetIds: obj.notFoundWidgetIdsList,
  };
}
