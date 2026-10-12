// Pure tree helpers over ListIssues output (flat issues with parentId and
// siblingRank). No Vue here, so it's unit-tested directly (test/tree.test.js).

const byRank = (a, b) => (a.siblingRank < b.siblingRank ? -1 : a.siblingRank > b.siblingRank ? 1 : 0);

// Sibling order: open issues in their manual (rank) order, then closed
// ones at the end in creation order. isClosed(issue) says which is which;
// without it everything sorts by rank.
export function siblingOrder(isClosed = () => false) {
  return (a, b) => {
    const ca = isClosed(a);
    const cb = isClosed(b);
    if (ca !== cb) return ca ? 1 : -1;
    return ca ? a.number - b.number : byRank(a, b);
  };
}

// parentId ('' = root) -> children in sibling order.
export function childrenIndex(issues, isClosed) {
  const index = new Map();
  for (const issue of issues) {
    const key = issue.parentId || '';
    if (!index.has(key)) index.set(key, []);
    index.get(key).push(issue);
  }
  const order = siblingOrder(isClosed);
  for (const list of index.values()) list.sort(order);
  return index;
}

// The rows a tree grid shows: depth-first, children only under expanded
// parents. Each row: { issue, depth, hasChildren, expanded }.
export function visibleRows(issues, expanded, isClosed) {
  const index = childrenIndex(issues, isClosed);
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

// The last open child of a parent ('' = root), excluding one issue -- where
// a newly placed open issue goes (after it), so it stays above the closed.
export function lastOpenChild(issues, parentId, isClosed, excludeId = '') {
  const children = (childrenIndex(issues, isClosed).get(parentId || '') ?? [])
    .filter((i) => i.id !== excludeId && !isClosed(i));
  return children.at(-1) ?? null;
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
