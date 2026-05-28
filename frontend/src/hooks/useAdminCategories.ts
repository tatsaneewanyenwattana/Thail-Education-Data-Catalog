"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api";
import {
  ADMIN_CATEGORY_PAGE_SIZE,
  type AdminCategoriesResult,
  type AdminCategory,
  type AdminCategoryInput,
  type AdminSubcategory,
} from "@/data/mockData";
import {
  toCategoryMutationBody,
  toCategoryUpdateBody,
  type ApiCategory,
} from "@/utils/categoryApi";

type AdminCategoriesFilters = {
  search?: string;
  page?: number;
};

type CategoriesListResponse = {
  success: boolean;
  data: ApiCategory[];
};

type AdminUserApi = {
  id: string;
  agency_name: string | null;
};

type AdminUsersListResponse = {
  success: boolean;
  data: AdminUserApi[];
};

type AdminDatasetRowApi = {
  category: string;
  subcategory: string;
};

type AdminDatasetsListResponse = {
  success: boolean;
  data: AdminDatasetRowApi[];
};

function countDatasetsForCategory(
  category: ApiCategory,
  datasets: AdminDatasetRowApi[],
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

function buildAdminCategoryTree(
  categories: ApiCategory[],
  agencyByUserId: Map<string, string>,
  datasets: AdminDatasetRowApi[]
): AdminCategory[] {
  const l1Raw = categories.filter((c) => c.level === 1);
  const l2Raw = categories.filter((c) => c.level === 2);

  const l2ByParent = new Map<string, AdminSubcategory[]>();
  for (const c of l2Raw) {
    const parentId = c.parent_id ? String(c.parent_id) : "";
    const agencyName =
      agencyByUserId.get(String(c.created_by)) ?? "—";
    const sub: AdminSubcategory = {
      id: String(c.id),
      nameTh: c.name_th,
      nameEn: c.name_en,
      slug: c.slug,
      agencyName,
      datasetCount: countDatasetsForCategory(c, datasets, categories),
    };
    const list = l2ByParent.get(parentId) ?? [];
    list.push(sub);
    l2ByParent.set(parentId, list);
  }

  return l1Raw.map((c) => {
    const subcategories = l2ByParent.get(String(c.id)) ?? [];
    const ownCount = countDatasetsForCategory(c, datasets, categories);
    const subTotal = subcategories.reduce((sum, s) => sum + s.datasetCount, 0);
    return {
      id: String(c.id),
      nameTh: c.name_th,
      nameEn: c.name_en,
      slug: c.slug,
      datasetCount: Math.max(ownCount, subTotal),
      subcategories,
    };
  });
}

function applyCategoryFilters(
  tree: AdminCategory[],
  filters?: AdminCategoriesFilters
): AdminCategoriesResult {
  const keyword = filters?.search?.trim().toLowerCase() ?? "";
  let filtered = tree;

  if (keyword) {
    filtered = tree.filter((category) => {
      const l1Match =
        category.nameTh.toLowerCase().includes(keyword) ||
        category.nameEn.toLowerCase().includes(keyword) ||
        category.slug.toLowerCase().includes(keyword);
      const l2Match = category.subcategories.some(
        (sub) =>
          sub.nameTh.toLowerCase().includes(keyword) ||
          sub.nameEn.toLowerCase().includes(keyword) ||
          sub.slug.toLowerCase().includes(keyword) ||
          sub.agencyName.toLowerCase().includes(keyword)
      );
      return l1Match || l2Match;
    });
  }

  const totalL1 = filtered.length;
  const totalL2 = filtered.reduce(
    (sum, category) => sum + category.subcategories.length,
    0
  );
  const totalPages = Math.max(1, Math.ceil(totalL1 / ADMIN_CATEGORY_PAGE_SIZE));
  const safePage = Math.min(Math.max(filters?.page ?? 1, 1), totalPages);
  const start = (safePage - 1) * ADMIN_CATEGORY_PAGE_SIZE;

  return {
    data: filtered.slice(start, start + ADMIN_CATEGORY_PAGE_SIZE),
    totalL1,
    totalL2,
    page: safePage,
    totalPages,
  };
}

async function fetchAdminCategories(
  filters?: AdminCategoriesFilters
): Promise<AdminCategoriesResult> {
  const [catsRes, usersRes, datasetsRes] = await Promise.all([
    apiClient.get<CategoriesListResponse>("/admin/categories"),
    apiClient.get<AdminUsersListResponse>("/admin/users", {
      params: { page: 1, page_size: 100 },
    }),
    apiClient.get<AdminDatasetsListResponse>("/datasets", {
      params: { all: true, page: 1, page_size: 100, sort: "updated_at", order: "desc" },
    }),
  ]);

  const categories = catsRes.data.data ?? [];
  const agencyByUserId = new Map<string, string>();
  for (const user of usersRes.data.data ?? []) {
    const label = user.agency_name?.trim() || "";
    if (label) {
      agencyByUserId.set(String(user.id), label);
    }
  }

  const datasets = datasetsRes.data.data ?? [];
  const tree = buildAdminCategoryTree(categories, agencyByUserId, datasets);
  return applyCategoryFilters(tree, filters);
}

/** GET /api/v1/admin/categories */
export function useAdminCategories(filters?: AdminCategoriesFilters) {
  return useQuery({
    queryKey: ["admin", "categories", filters],
    queryFn: () => fetchAdminCategories(filters),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

type CreateCategoryVariables = AdminCategoryInput;

async function createCategory(variables: CreateCategoryVariables): Promise<void> {
  await apiClient.post(
    "/admin/categories",
    toCategoryMutationBody(variables),
    {
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        Accept: "application/json; charset=UTF-8",
      },
    }
  );
}

/** POST /api/v1/admin/categories */
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
  });
}

export const useAdminCreateCategory = useCreateCategory;

type UpdateCategoryVariables = AdminCategoryInput & {
  id: string;
  level: 1 | 2;
};

async function updateCategory(variables: UpdateCategoryVariables): Promise<void> {
  await apiClient.patch(
    `/admin/categories/${variables.id}`,
    toCategoryUpdateBody(
      { nameTh: variables.nameTh, nameEn: variables.nameEn },
      undefined
    )
  );
}

/** PATCH /api/v1/admin/categories/{id} */
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
  });
}

export const useAdminUpdateCategory = useUpdateCategory;

type DeleteCategoryVariables = {
  id: string;
  level: 1 | 2;
};

async function deleteCategory(variables: DeleteCategoryVariables): Promise<void> {
  await apiClient.delete(`/admin/categories/${variables.id}`);
}

/** DELETE /api/v1/admin/categories/{id} */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    retry: 0,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
  });
}

export const useAdminDeleteCategory = useDeleteCategory;
