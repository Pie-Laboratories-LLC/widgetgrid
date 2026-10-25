// The WidgetGrid-config cookie: flags this one browser lays over the
// server's (see index.js). Kept apart from index.js so it can be tested
// without Vue or the generated protos.
export const OVERRIDE_COOKIE = 'WidgetGrid-config';

// The cookie's flags (booleans only), or {} without one or if it won't parse.
export function readOverrides(cookies = globalThis.document?.cookie ?? '') {
  const entry = cookies.split(/;\s*/).find((c) => c.startsWith(`${OVERRIDE_COOKIE}=`));
  if (!entry) return {};
  const raw = entry.slice(OVERRIDE_COOKIE.length + 1);
  let decoded = raw;
  try { decoded = decodeURIComponent(raw); } catch { /* not encoded */ }
  for (const text of [raw, decoded]) {
    try {
      const overrides = {};
      for (const [name, on] of Object.entries(JSON.parse(text)?.featureFlags ?? {})) {
        if (typeof on === 'boolean') overrides[name] = on;
      }
      return overrides;
    } catch { /* try the next reading */ }
  }
  console.warn(`The ${OVERRIDE_COOKIE} cookie isn't the configuration's JSON -- ignored`);
  return {};
}
