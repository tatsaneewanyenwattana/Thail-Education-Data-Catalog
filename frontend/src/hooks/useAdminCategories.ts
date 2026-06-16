"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api";
import {
  type AdminCategoryInput,
} from "@/data/mockData";
import {
  toCategoryMutationBody,
  toCategoryUpdateBody,
  type ApiCategory,
} from "@/utils/categoryApi";
import {
  buildCategoryTree,
  countCategoriesByLevel,
  flattenCategoryTree,
  type CategoryTreeNode,
} from "@/utils/categoryTreeUtils";

export type AdminCategoryTreeNode = Omit<CategoryTreeNode, "children"> & {
  agencyName: string;
  children: AdminCategoryTreeNode[];
};

export const ADMIN_AGENCY_PAGE_SIZE = 2;

type AdminCategoriesFilters = {
  search?: string;
  page?: number;
  adminOwnerLabel?: string;
};

type CategoriesListResponse = {
  success: boolean;
  data: ApiCategory[];
};

export type AdminAgencyCategoryGroup = {
  agencyName: string;
  categories: AdminCategoryTreeNode[];
};

export type AdminCategoriesResult = {
  data: AdminCategoryTreeNode[];
  groupedByAgency: AdminAgencyCategoryGroup[];
  totalAgencyGroups: number;
  totalRoots: number;
  totalCategories: number;
  countsByLevel: Record<number, number>;
  page: number;
  totalPages: number;
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

function resolveAgencyLabel(
  category: ApiCategory,
  adminOwnerLabel: string
): string {
  if (category.creator_role === "admin") {
    return adminOwnerLabel;
  }
  const agencyName = category.agency_name?.trim();
  if (agencyName) {
    return agencyName;
  }
  return "—";
}

function attachAgencyNames(
  nodes: CategoryTreeNode[],
  categories: ApiCategory[],
  adminOwnerLabel: string
): AdminCategoryTreeNode[] {
  const categoryById = new Map(
    categories.map((category) => [String(category.id), category] as const)
  );

  return nodes.map((node) => {
    const source = categoryById.get(node.id);
    const agencyName = source
      ? resolveAgencyLabel(source, adminOwnerLabel)
      : "—";
    return {
      ...node,
      agencyName,
      children: attachAgencyNames(
        node.children,
        categories,
        adminOwnerLabel
      ),
    };
  });
}

function buildAdminCategoryTree(
  categories: ApiCategory[],
  adminOwnerLabel: string
): AdminCategoryTreeNode[] {
  const datasetCountByCategoryId =
    buildDatasetCountMapFromCategories(categories);
  const baseTree = buildCategoryTree(categories, datasetCountByCategoryId);
  return attachAgencyNames(baseTree, categories, adminOwnerLabel);
}

function nodeMatchesKeyword(node: AdminCategoryTreeNode, keyword: string): boolean {
  return (
    node.nameTh.toLowerCase().includes(keyword) ||
    node.nameEn.toLowerCase().includes(keyword) ||
    node.slug.toLowerCase().includes(keyword) ||
    node.agencyName.toLowerCase().includes(keyword)
  );
}

function filterTreeByKeyword(
  nodes: AdminCategoryTreeNode[],
  keyword: string
): AdminCategoryTreeNode[] {
  const result: AdminCategoryTreeNode[] = [];

  for (const node of nodes) {
    const filteredChildren = filterTreeByKeyword(
      node.children as AdminCategoryTreeNode[],
      keyword
    );
    if (nodeMatchesKeyword(node, keyword) || filteredChildren.length > 0) {
      result.push({
        ...node,
        children: filteredChildren,
        childCount: filteredChildren.length,
      });
    }
  }

  return result;
}

function applyCategoryFilters(
  tree: AdminCategoryTreeNode[],
  filters?: AdminCategoriesFilters
): AdminCategoriesResult {
  const keyword = filters?.search?.trim().toLowerCase() ?? "";
  const filtered = keyword ? filterTreeByKeyword(tree, keyword) : tree;

  const flat = flattenCategoryTree(filtered);
  const totalRoots = filtered.length;
  const totalCategories = flat.length;
  const countsByLevel = countCategoriesByLevel(filtered);
  const allGroups = groupRootsByAgency(filtered);
  const totalAgencyGroups = allGroups.length;
  const totalPages = Math.max(
    1,
    Math.ceil(totalAgencyGroups / ADMIN_AGENCY_PAGE_SIZE)
  );
  const safePage = Math.min(Math.max(filters?.page ?? 1, 1), totalPages);
  const start = (safePage - 1) * ADMIN_AGENCY_PAGE_SIZE;

  return {
    data: filtered,
    groupedByAgency: allGroups.slice(start, start + ADMIN_AGENCY_PAGE_SIZE),
    totalAgencyGroups,
    totalRoots,
    totalCategories,
    countsByLevel,
    page: safePage,
    totalPages,
  };
}

function groupRootsByAgency(
  roots: AdminCategoryTreeNode[]
): AdminAgencyCategoryGroup[] {
  const groups = new Map<string, AdminCategoryTreeNode[]>();

  for (const root of roots) {
    const key = root.agencyName.trim() || "—";
    const list = groups.get(key) ?? [];
    list.push(root);
    groups.set(key, list);
  }

  return Array.from(groups.entries())
    .sort(([left], [right]) => left.localeCompare(right, "th"))
    .map(([agencyName, categories]) => ({
      agencyName,
      categories: categories.sort((a, b) =>
        a.nameTh.localeCompare(b.nameTh, "th")
      ),
    }));
}

async function fetchAdminCategories(
  filters?: AdminCategoriesFilters
): Promise<AdminCategoriesResult> {
  const catsRes = await apiClient.get<CategoriesListResponse>(
    "/admin/categories"
  );

  const categories = catsRes.data.data ?? [];
  const adminOwnerLabel = filters?.adminOwnerLabel?.trim() || "Admin";
  const tree = buildAdminCategoryTree(categories, adminOwnerLabel);
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

type CreateCategoryVariables = AdminCategoryInput & {
  parentId?: string;
};

async function createCategory(variables: CreateCategoryVariables): Promise<void> {
  await apiClient.post(
    "/admin/categories",
    {
      ...toCategoryMutationBody(variables),
      parent_id: variables.parentId ?? null,
    },
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
