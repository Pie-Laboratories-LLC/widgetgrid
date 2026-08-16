// Dedup cache: N concurrent WidgetSlots of the same type share one in-flight
// dynamic import rather than each triggering their own network fetch. New
// widget types need no entry here or anywhere else in the host app's source
// -- the type string from the DB (via pass 1) is the only thing that
// determines what gets fetched.
const moduleCache = new Map(); // widgetType -> Promise<Component>

export function loadWidgetModule(widgetType) {
  if (!moduleCache.has(widgetType)) {
    const promise = import(/* @vite-ignore */ `/widgets/${widgetType}.js`)
      .then((mod) => mod.default ?? mod)
      .catch((err) => {
        // Allow a retry (e.g. after a transient network failure) instead of
        // permanently caching the rejection.
        moduleCache.delete(widgetType);
        throw err;
      });
    moduleCache.set(widgetType, promise);
  }
  return moduleCache.get(widgetType);
}
