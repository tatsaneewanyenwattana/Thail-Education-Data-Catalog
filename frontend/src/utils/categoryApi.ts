import apiClient from "@/services/api";
import type { CategoryTreeNode } from "@/utils/categoryTreeUtils";
import { buildCategoryTree } from "@/utils/categoryTreeUtils";

export const AGENCY_CATEGORY_PAGE_SIZE = 4;

export type ApiCategory = {
  id: string;
  name_th: string;
  name_en: string;
  slug: string;
  level: number;
  parent_id: string | null;
  created_by: string;
  created_at: string;
  updated_at?: string;
  dataset_count?: number;
  agency_name?: string | null;
  creator_role?: string | null;
};

export type AgencyCategoriesTreeCache = {
  tree: CategoryTreeNode[];
  flat: ApiCategory[];
  lastUpdatedAt: string | null;
};

type CategoriesListResponse = {
  success: boolean;
  data: ApiCategory[];
};

function buildDatasetCountMapFromCategories(
  categories: ApiCategory[]
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const category of categories) {
    counts[String(category.id)] = category.dataset_count ?? 0;
  }
  return counts;
}

export async function fetchAgencyCategoriesTree(): Promise<AgencyCategoriesTreeCache> {
  const catsRes = await apiClient.get<CategoriesListResponse>(
    "/agency/categories"
  );
  const categories = catsRes.data.data ?? [];
  const datasetCountByCategoryId =
    buildDatasetCountMapFromCategories(categories);

  const dates = categories
    .map((c) => c.updated_at)
    .filter(Boolean)
    .sort()
    .reverse();

  return {
    flat: categories,
    tree: buildCategoryTree(categories, datasetCountByCategoryId),
    lastUpdatedAt: dates[0] ?? null,
  };
}

export type CategoryMutationBody = {
  name_th: string;
  name_en: string;
};

/** POST /categories — Backend สร้าง slug จาก name_en */
export function toCategoryMutationBody(input: {
  nameTh: string;
  nameEn: string;
}): CategoryMutationBody {
  return {
    name_th: input.nameTh,
    name_en: input.nameEn,
  };
}

/** PATCH /categories/{id} — CategoryUpdateRequest: name_th?, name_en? (ส่งเฉพาะที่เปลี่ยน) */
export type CategoryUpdateBody = {
  name_th?: string;
  name_en?: string;
};

export function toCategoryUpdateBody(
  input: { nameTh: string; nameEn: string },
  original?: { nameTh: string; nameEn: string }
): CategoryUpdateBody {
  const body: CategoryUpdateBody = {};

  if (!original || input.nameTh !== original.nameTh) {
    body.name_th = input.nameTh;
  }
  if (!original || input.nameEn !== original.nameEn) {
    body.name_en = input.nameEn;
  }

  if (Object.keys(body).length === 0) {
    body.name_th = input.nameTh;
  }

  return body;
}
