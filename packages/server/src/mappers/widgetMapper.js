// Pure mapping from a widgetsRepo row ({ id, type, title, content }, where
// content is already a plain JS object thanks to `pg`'s jsonb parsing) to
// the WidgetContent proto shape. See widget.proto for why content_json is a
// JSON string rather than google.protobuf.Struct.
export function toWidgetContent(row) {
  return {
    widgetId: row.id,
    widgetType: row.type,
    title: row.title ?? '',
    contentJson: JSON.stringify(row.content ?? {}),
  };
}
