import type { SearchResultMock } from "@/data/mockData";
import type { ApiCategory } from "@/utils/categoryApi";
import {
  buildCategoryTree,
  collectDescendantLeafIds,
  findCategoryNodeBySlug,
  getCategoryAncestors,
  isCategoryLeaf,
  type CategoryTreeNode,
} from "@/utils/categoryTreeUtils";

type ApiPublishedDataset = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  license: string;
  category_id: string | null;
  download_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  metadata?: { year?: number; agency?: string } | null;
  agency_name?: string | null;
};

export type PublicCategoryPageData = {
  node: CategoryTreeNode;
  ancestors: CategoryTreeNode[];
  children: CategoryTreeNode[];
  isLeaf: boolean;
};

export function buildPublicCategoryTree(
  categories: ApiCategory[]
): CategoryTreeNode[] {
  return buildCategoryTree(categories);
}

export function findPublicCategoryPageBySlug(
  slug: string,
  tree: CategoryTreeNode[]
): PublicCategoryPageData | null {
  const node = findCategoryNodeBySlug(tree, slug);
  if (!node) {
    return null;
  }
  const ancestors = getCategoryAncestors(tree, node.id) ?? [];
  return {
    node,
    ancestors,
    children: node.children,
    isLeaf: isCategoryLeaf(node),
  };
}

/** Leaf pages only — branch pages return [] (no datasets on branch). */
export function getCategoryFilterIds(pageData: PublicCategoryPageData): string[] {
  if (!pageData.isLeaf) {
    return [];
  }
  return [pageData.node.id];
}

/** All leaf IDs under a node (for child-card dataset counts on branch pages). */
export function getSubtreeLeafFilterIds(node: CategoryTreeNode): string[] {
  return collectDescendantLeafIds(node);
}

export function mapApiDatasetToSearchResult(
  item: ApiPublishedDataset,
  categoryById: Map<string, ApiCategory>
): SearchResultMock {
  const cat = item.category_id
    ? categoryById.get(String(item.category_id))
    : undefined;

  const rootCategory = cat ? getRootCategory(cat, categoryById) : undefined;

  const title = item.title;
  const year =
    typeof item.metadata?.year === "number" ? item.metadata.year : 0;
  const agencyName =
    typeof item.agency_name === "string" && item.agency_name.trim()
      ? item.agency_name.trim()
      : typeof item.metadata?.agency === "string" && item.metadata.agency.trim()
        ? item.metadata.agency.trim()
        : "ไม่ระบุหน่วยงาน";

  return {
    id: String(item.id),
    titleTh: title,
    titleEn: title,
    descriptionTh: item.description ?? "",
    descriptionEn: item.description ?? "",
    categoryTh: rootCategory?.name_th ?? cat?.name_th ?? "—",
    categoryEn: rootCategory?.name_en ?? cat?.name_en ?? "—",
    categoryId: rootCategory ? String(rootCategory.id) : cat ? String(cat.id) : "",
    leafCategoryId: cat ? String(cat.id) : undefined,
    subcategorySlug: cat && cat.level > 1 ? cat.slug : undefined,
    agencyTh: agencyName,
    agencyEn: agencyName,
    agencyId: "",
    status: item.status === "published" ? "published" : "published",
    downloadCount: item.download_count ?? 0,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    publishedAt: item.published_at ?? item.created_at,
    license: (item.license as SearchResultMock["license"]) ?? "open",
    fileFormats: [],
    year,
  };
}

function getRootCategory(
  cat: ApiCategory,
  categoryById: Map<string, ApiCategory>
): ApiCategory {
  let current = cat;
  while (current.parent_id) {
    const parent = categoryById.get(String(current.parent_id));
    if (!parent) {
      break;
    }
    current = parent;
  }
  return current;
}

export function applyDatasetCountsToTree(
  nodes: CategoryTreeNode[],
  datasets: SearchResultMock[]
): CategoryTreeNode[] {
  const countForNode = (node: CategoryTreeNode): number => {
    if (node.children.length === 0) {
      return datasets.filter(
        (d) =>
          d.leafCategoryId === node.id ||
          (!d.leafCategoryId && d.subcategorySlug === node.slug)
      ).length;
    }
    return node.children.reduce((sum, child) => sum + countForNode(child), 0);
  };

  const mapNode = (node: CategoryTreeNode): CategoryTreeNode => ({
    ...node,
    datasetCount: countForNode(node),
    children: node.children.map(mapNode),
  });

  return nodes.map(mapNode);
}

export type { ApiPublishedDataset };
