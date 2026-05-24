"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminCategoryMock,
  deleteAdminCategoryMock,
  getAdminCategoriesMock,
  updateAdminCategoryMock,
  type AdminCategoriesResult,
  type AdminCategoryInput,
} from "@/data/mockData";

type AdminCategoriesFilters = {
  search?: string;
  page?: number;
};

async function fetchAdminCategories(
  filters?: AdminCategoriesFilters
): Promise<AdminCategoriesResult> {
  // TODO: เปลี่ยนเป็น API จริงเมื่อ Backend พร้อม
  // const response = await apiClient.get<{ data: AdminCategory[] }>(
  //   "/admin/categories",
  //   { params: filters }
  // );
  // return response.data;
  await Promise.resolve();
  return getAdminCategoriesMock(filters?.search, filters?.page);
}

export function useAdminCategories(filters?: AdminCategoriesFilters) {
  return useQuery({
    queryKey: ["admin", "categories", filters],
    queryFn: () => fetchAdminCategories(filters),
    staleTime: 1000 * 60 * 5,
    placeholderData: () => getAdminCategoriesMock(filters?.search, filters?.page),
  });
}

type CreateCategoryVariables = AdminCategoryInput;

async function createCategory(variables: CreateCategoryVariables): Promise<void> {
  // TODO: POST /api/v1/admin/categories
  await Promise.resolve();
  createAdminCategoryMock(variables);
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
  });
}

type UpdateCategoryVariables = AdminCategoryInput & {
  id: string;
  level: 1 | 2;
};

async function updateCategory(variables: UpdateCategoryVariables): Promise<void> {
  // TODO: PUT /api/v1/admin/categories/{id}
  await Promise.resolve();
  updateAdminCategoryMock(variables.level, variables.id, variables);
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
  });
}

type DeleteCategoryVariables = {
  id: string;
  level: 1 | 2;
};

async function deleteCategory(variables: DeleteCategoryVariables): Promise<void> {
  // TODO: DELETE /api/v1/admin/categories/{id}
  await Promise.resolve();
  try {
    deleteAdminCategoryMock(variables.level, variables.id);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("DELETE_FAILED");
  }
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
  });
}
