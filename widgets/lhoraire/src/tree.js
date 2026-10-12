// Pure tree helpers over ListIssues output (flat issues with parentId and
// siblingRank). No Vue here, so it's unit-tested directly (test/tree.test.js).

const byRank = (a, b) => (a.siblingRank < b.siblingRank ? -1 : a.siblingRank > b.siblingRank ? 1 : 0);

// parentId ('' = root) -> children sorted by rank.
export function childrenIndex(issues) {
  const index = new Map();
  for (const issue of issues) {
    const key = issue.parentId || '';
    if (!index.has(key)) index.set(key, []);
    index.get(key).push(issue);
  }
  for (const list of index.values()) list.sort(byRank);
  return index;
}

// The rows a tree grid shows: depth-first, children only under expanded
// parents. Each row: { issue, depth, hasChildren, expanded }.
export function visibleRows(issues, expanded) {
  const index = childrenIndex(issues);
  const rows = [];
  const walk = (parentId, depth) => {
    for (const issue of index.get(parentId) ?? []) {
      const hasChildren = index.has(issue.id);
      const isExpanded = hasChildren && expanded.has(issue.id);
      rows.push({ issue, depth, hasChildren, expanded: isExpanded });
      if (isExpanded) walk(issue.id, depth + 1);
    }
  };
  walk('', 0);
  return rows;
}

// Ids of an issue's ancestors, nearest first (to expand down to it).
export function ancestorIds(issues, id) {
  const byId = new Map(issues.map((i) => [i.id, i]));
  const out = [];
  let current = byId.get(id);
  while (current?.parentId) {
    out.push(current.parentId);
    current = byId.get(current.parentId);
  }
  return out;
}

// The issue plus every descendant's id.
export function subtreeIds(issues, id) {
  const index = childrenIndex(issues);
  const out = [];
  const walk = (current) => {
    out.push(current);
    for (const child of index.get(current) ?? []) walk(child.id);
  };
  walk(id);
  return out;
}
