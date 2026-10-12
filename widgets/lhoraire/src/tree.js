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

// Where a drag-and-drop puts an issue, or why it can't go there.
// position: 'before' | 'after' (the target's sibling) | 'child' (under the
// target, after its last open child). Returns
// { ok: true, newParentId, afterSiblingId } or { ok: false, reason }.
// Mirrors lhoraire-server's rules so the tree can explain a refusal while
// hovering instead of after the drop.
export function planDrop(issues, isClosed, draggedId, targetId, position) {
  const byId = new Map(issues.map((i) => [i.id, i]));
  const dragged = byId.get(draggedId);
  const target = byId.get(targetId);
  if (!dragged || !target) return { ok: false, reason: 'That issue is gone -- reload.' };
  if (draggedId === targetId) return { ok: false, reason: 'Drop it somewhere else.' };
  if (subtreeIds(issues, draggedId).includes(targetId)) {
    return { ok: false, reason: `${target.key} is inside ${dragged.key} -- an issue can't move under itself.` };
  }

  const newParentId = position === 'child' ? target.id : target.parentId || '';
  const newParent = newParentId ? byId.get(newParentId) : null;
  const parentChanges = newParentId !== (dragged.parentId || '');
  if (newParent && isClosed(newParent) && parentChanges) {
    return { ok: false, reason: `${newParent.key} is closed, so it can't take new children.` };
  }

  if (position === 'child') {
    return { ok: true, newParentId, afterSiblingId: lastOpenChild(issues, newParentId, isClosed, draggedId)?.id ?? '' };
  }
  if (isClosed(dragged)) {
    if (!parentChanges) return { ok: false, reason: 'Closed issues stay at the end, in creation order.' };
    return { ok: true, newParentId, afterSiblingId: lastOpenChild(issues, newParentId, isClosed, draggedId)?.id ?? '' };
  }
  if (isClosed(target)) {
    return { ok: false, reason: 'Closed issues stay at the end, in creation order -- drop it next to an open issue.' };
  }
  if (position === 'after') return { ok: true, newParentId, afterSiblingId: target.id };
  const open = (childrenIndex(issues, isClosed).get(newParentId) ?? []).filter((i) => !isClosed(i) && i.id !== draggedId);
  const at = open.findIndex((i) => i.id === target.id);
  return { ok: true, newParentId, afterSiblingId: at > 0 ? open[at - 1].id : '' };
}
