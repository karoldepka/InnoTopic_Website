import { CategoryNode } from '../../Learn/core/ai-backend.service';

export interface CategoryTreeRow {
  node: CategoryNode;
  depth: number;
  path: string;
  hasChildren: boolean;
  parentIds: string[];
}

function safeChildren(node: CategoryNode): CategoryNode[] {
  return Array.isArray(node.children) ? node.children : [];
}

export function flattenCategoryTree(
  nodes: CategoryNode[],
  depth = 0,
  parents: string[] = [],
  parentIds: string[] = [],
): CategoryTreeRow[] {
  if (!Array.isArray(nodes)) return [];
  return nodes.flatMap(node => {
    const path = [...parents, node.title || '(untitled)'].join(' > ');
    const children = safeChildren(node);
    return [
      {node, depth, path, hasChildren: children.length > 0, parentIds},
      ...flattenCategoryTree(children, depth + 1, [...parents, node.title || '(untitled)'], [...parentIds, node.id]),
    ];
  });
}

export function filterVisibleRows(rows: CategoryTreeRow[], collapsedIds: ReadonlySet<string>): CategoryTreeRow[] {
  if (!collapsedIds.size) {
    return rows;
  }
  return rows.filter(row => !row.parentIds.some(id => collapsedIds.has(id)));
}

export function countCategoryNodes(nodes: CategoryNode[]): number {
  if (!Array.isArray(nodes)) return 0;
  return nodes.reduce((sum, node) => sum + 1 + countCategoryNodes(safeChildren(node)), 0);
}

export function sumQuestionCounts(nodes: CategoryNode[]): number {
  if (!Array.isArray(nodes)) return 0;
  return nodes.reduce((sum, node) => sum + Number(node.questionCount || 0) + sumQuestionCounts(safeChildren(node)), 0);
}

export function cloneCategoryTree(nodes: CategoryNode[]): CategoryNode[] {
  return nodes.map(node => ({
    ...node,
    children: cloneCategoryTree(safeChildren(node)),
  }));
}

export function makeCategoryNode(title = 'New category'): CategoryNode {
  const now = Date.now();
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    || 'category';

  return {
    id: `local-${slug}-${now.toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    questionCount: 3,
    children: [],
    matchedExistingCategoryId: null,
    matchedExistingCategoryTitle: null,
    isExistingCategory: false,
    createdAt: now,
    draftedAt: now,
    contentModifiedAt: now,
    // draftedByAIAt intentionally absent — manually created
  };
}

export function updateCategoryNode(
  nodes: CategoryNode[],
  nodeId: string,
  updater: (node: CategoryNode) => CategoryNode,
): CategoryNode[] {
  return nodes.map(node => {
    if (node.id === nodeId) {
      return updater({...node, children: cloneCategoryTree(safeChildren(node))});
    }

    return {
      ...node,
      children: updateCategoryNode(safeChildren(node), nodeId, updater),
    };
  });
}

export function deleteCategoryNode(nodes: CategoryNode[], nodeId: string): CategoryNode[] {
  return nodes
    .filter(node => node.id !== nodeId)
    .map(node => ({
      ...node,
      children: deleteCategoryNode(safeChildren(node), nodeId),
    }));
}

export function countLeafNodes(nodes: CategoryNode[]): number {
  return nodes.reduce((sum, node) => {
    const children = safeChildren(node);
    return sum + (children.length === 0 ? 1 : countLeafNodes(children));
  }, 0);
}

export function setLeafQuestionCounts(nodes: CategoryNode[], count: number): CategoryNode[] {
  return nodes.map(node => {
    const children = safeChildren(node);
    return children.length === 0
      ? { ...node, questionCount: count }
      : { ...node, children: setLeafQuestionCounts(children, count) };
  });
}

export function addCategoryChild(nodes: CategoryNode[], parentId?: string): CategoryNode[] {
  const child = makeCategoryNode();

  if (!parentId) {
    return [...cloneCategoryTree(nodes), child];
  }

  return updateCategoryNode(nodes, parentId, node => ({
    ...node,
    children: [...safeChildren(node), child],
  }));
}
