import type { ApiCategory } from "@/utils/categoryApi";

export const MAX_CATEGORY_DEPTH = 5;

export type CategoryTreeNode = {
  id: string;
  nameTh: string;
  nameEn: string;
  slug: string;
  level: number;
  parentId: string | null;
  datasetCount: number;
  childCount: number;
  children: CategoryTreeNode[];
};

export function buildCategoryTree(
  categories: ApiCategory[],
  datasetCountByCategoryId: Record<string, number> = {}
): CategoryTreeNode[] {
  const nodes = new Map<string, CategoryTreeNode>();

  for (const category of categories) {
    nodes.set(String(category.id), {
      id: String(category.id),
      nameTh: category.name_th,
      nameEn: category.name_en,
      slug: category.slug,
      level: category.level,
      parentId: category.parent_id ? String(category.parent_id) : null,
      datasetCount: datasetCountByCategoryId[String(category.id)] ?? 0,
      childCount: 0,
      children: [],
    });
  }

  const roots: CategoryTreeNode[] = [];

  for (const node of nodes.values()) {
    if (node.parentId && nodes.has(node.parentId)) {
      const parent = nodes.get(node.parentId)!;
      parent.children.push(node);
      parent.childCount += 1;
    } else {
      roots.push(node);
    }
  }

  const sortNodes = (list: CategoryTreeNode[]) => {
    list.sort((a, b) => a.nameTh.localeCompare(b.nameTh, "th"));
    list.forEach((node) => sortNodes(node.children));
  };

  sortNodes(roots);

  const rollUpDatasetCounts = (node: CategoryTreeNode): number => {
    const childTotal = node.children.reduce(
      (sum, child) => sum + rollUpDatasetCounts(child),
      0
    );
    node.datasetCount += childTotal;
    return node.datasetCount;
  };

  roots.forEach(rollUpDatasetCounts);

  return roots;
}

export function flattenCategoryTree(nodes: CategoryTreeNode[]): CategoryTreeNode[] {
  const result: CategoryTreeNode[] = [];
  const walk = (list: CategoryTreeNode[]) => {
    for (const node of list) {
      result.push(node);
      walk(node.children);
    }
  };
  walk(nodes);
  return result;
}

export function isCategoryLeaf(node: CategoryTreeNode): boolean {
  return node.children.length === 0;
}

export function canAddChild(node: CategoryTreeNode): boolean {
  return node.level < MAX_CATEGORY_DEPTH;
}

export function findCategoryNode(
  nodes: CategoryTreeNode[],
  id: string
): CategoryTreeNode | null {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }
    const found = findCategoryNode(node.children, id);
    if (found) {
      return found;
    }
  }
  return null;
}

export function collectLeafNodes(nodes: CategoryTreeNode[]): CategoryTreeNode[] {
  return flattenCategoryTree(nodes).filter(isCategoryLeaf);
}

export function findCategoryNodeBySlug(
  nodes: CategoryTreeNode[],
  slug: string
): CategoryTreeNode | null {
  for (const node of nodes) {
    if (node.slug === slug) {
      return node;
    }
    const found = findCategoryNodeBySlug(node.children, slug);
    if (found) {
      return found;
    }
  }
  return null;
}

export function getCategoryAncestors(
  nodes: CategoryTreeNode[],
  targetId: string,
  chain: CategoryTreeNode[] = []
): CategoryTreeNode[] | null {
  for (const node of nodes) {
    if (node.id === targetId) {
      return chain;
    }
    const found = getCategoryAncestors(node.children, targetId, [...chain, node]);
    if (found) {
      return found;
    }
  }
  return null;
}

export function collectDescendantLeafIds(node: CategoryTreeNode): string[] {
  if (isCategoryLeaf(node)) {
    return [node.id];
  }
  return node.children.flatMap(collectDescendantLeafIds);
}

export function countCategoriesByLevel(
  nodes: CategoryTreeNode[]
): Record<number, number> {
  const counts: Record<number, number> = {};
  for (const node of flattenCategoryTree(nodes)) {
    counts[node.level] = (counts[node.level] ?? 0) + 1;
  }
  return counts;
}

export function getCategoryPathNodes(
  nodes: CategoryTreeNode[],
  targetId: string
): CategoryTreeNode[] | null {
  const walk = (
    list: CategoryTreeNode[],
    chain: CategoryTreeNode[]
  ): CategoryTreeNode[] | null => {
    for (const node of list) {
      if (node.id === targetId) {
        return [...chain, node];
      }
      const found = walk(node.children, [...chain, node]);
      if (found) {
        return found;
      }
    }
    return null;
  };
  return walk(nodes, []);
}

export function formatCategoryPath(
  pathNodes: CategoryTreeNode[],
  locale: string,
  separator = " › "
): string {
  return pathNodes
    .map((node) => (locale === "th" ? node.nameTh : node.nameEn))
    .join(separator);
}

export function collectLeavesUnder(node: CategoryTreeNode): CategoryTreeNode[] {
  if (isCategoryLeaf(node)) {
    return [node];
  }
  return node.children.flatMap(collectLeavesUnder);
}
