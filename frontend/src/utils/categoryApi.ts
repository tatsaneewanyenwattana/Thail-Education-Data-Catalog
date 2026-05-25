import apiClient from "@/services/api";
import type {
  AgencyCategoriesResponse,
  AgencyCategoryL1,
  AgencyCategoryL2,
} from "@/data/mockData";

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
};

export type AgencyCategoriesCache = {
  l1: AgencyCategoryL1[];
  l2: AgencyCategoryL2[];
};

type CategoriesListResponse = {
  success: boolean;
  data: ApiCategory[];
};

type AgencyDatasetApi = {
  category: string;
  subcategory: string;
};

type AgencyDatasetsListResponse = {
  success: boolean;
  data: AgencyDatasetApi[];
};

function countDatasetsForCategory(
  category: ApiCategory,
  datasets: AgencyDatasetApi[],
  allCategories: ApiCategory[]
): number {
  if (category.level === 2) {
    return datasets.filter((d) => d.subcategory === category.name_th).length;
  }

  const direct = datasets.filter(
    (d) =>
      d.category === category.name_th &&
      (!d.subcategory || d.subcategory === "-")
  ).length;

  const childNames = new Set(
    allCategories
      .filter(
        (c) => c.level === 2 && String(c.parent_id) === String(category.id)
      )
      .map((c) => c.name_th)
  );
  const viaChildren = datasets.filter((d) => childNames.has(d.subcategory)).length;

  return direct + viaChildren;
}

function mapToCache(
  categories: ApiCategory[],
  datasets: AgencyDatasetApi[]
): AgencyCategoriesCache {
  const l1Raw = categories.filter((c) => c.level === 1);
  const l2Raw = categories.filter((c) => c.level === 2);
  const l1ById = new Map(l1Raw.map((c) => [String(c.id), c]));

  const l1: AgencyCategoryL1[] = l1Raw.map((c) => ({
    id: String(c.id),
    nameTh: c.name_th,
    nameEn: c.name_en,
    slug: c.slug,
    datasetCount: countDatasetsForCategory(c, datasets, categories),
  }));

  const l2: AgencyCategoryL2[] = l2Raw.map((c) => {
    const parent = c.parent_id ? l1ById.get(String(c.parent_id)) : undefined;
    return {
      id: String(c.id),
      nameTh: c.name_th,
      nameEn: c.name_en,
      slug: c.slug,
      parentId: c.parent_id ? String(c.parent_id) : "",
      parentNameTh: parent?.name_th ?? "",
      parentNameEn: parent?.name_en ?? "",
      datasetCount: countDatasetsForCategory(c, datasets, categories),
    };
  });

  return { l1, l2 };
}

export async function fetchAgencyCategoriesCache(
  userId: string
): Promise<AgencyCategoriesCache> {
  const [catsRes, datasetsRes] = await Promise.all([
    apiClient.get<CategoriesListResponse>("/categories"),
    apiClient.get<AgencyDatasetsListResponse>("/agency/datasets", {
      params: { page: 1, page_size: 100 },
    }),
  ]);

  const mine = (catsRes.data.data ?? []).filter(
    (c) => String(c.created_by) === userId
  );
  const datasets = datasetsRes.data.data ?? [];

  return mapToCache(mine, datasets);
}

export function paginateAgencyCategories(
  cache: AgencyCategoriesCache,
  level: 1 | 2,
  page: number
): AgencyCategoriesResponse {
  const list = level === 1 ? cache.l1 : cache.l2;
  const totalPages = Math.max(
    1,
    Math.ceil(list.length / AGENCY_CATEGORY_PAGE_SIZE)
  );
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * AGENCY_CATEGORY_PAGE_SIZE;

  return {
    data: list.slice(start, start + AGENCY_CATEGORY_PAGE_SIZE) as
      | AgencyCategoryL1[]
      | AgencyCategoryL2[],
    total: list.length,
    page: safePage,
    totalPages,
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
