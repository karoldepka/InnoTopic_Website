import { CategoryNode } from '../../Learn/core/ai-backend.service';

export interface CategoryTreeRow {
  node: CategoryNode;
  depth: number;
  path: string;
}

function safeChildren(node: CategoryNode): CategoryNode[] {
  return Array.isArray(node.children) ? node.children : [];
}

export function flattenCategoryTree(nodes: CategoryNode[], depth = 0, parents: string[] = []): CategoryTreeRow[] {
  return nodes.flatMap(node => {
    const path = [...parents, node.title || '(untitled)'].join(' > ');
    return [
      {node, depth, path},
      ...flattenCategoryTree(safeChildren(node), depth + 1, [...parents, node.title || '(untitled)']),
    ];
  });
}

export function countCategoryNodes(nodes: CategoryNode[]): number {
  return nodes.reduce((sum, node) => sum + 1 + countCategoryNodes(safeChildren(node)), 0);
}

export function sumQuestionCounts(nodes: CategoryNode[]): number {
  return nodes.reduce((sum, node) => sum + Number(node.questionCount || 0) + sumQuestionCounts(safeChildren(node)), 0);
}

export function cloneCategoryTree(nodes: CategoryNode[]): CategoryNode[] {
  return nodes.map(node => ({
    ...node,
    children: cloneCategoryTree(safeChildren(node)),
  }));
}

export function makeCategoryNode(title = 'New category'): CategoryNode {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    || 'category';

  return {
    id: `local-${slug}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    questionCount: 3,
    children: [],
    matchedExistingCategoryId: null,
    matchedExistingCategoryTitle: null,
    isExistingCategory: false,
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
