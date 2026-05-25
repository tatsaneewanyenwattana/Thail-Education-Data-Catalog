"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api";
import type { AgencyCategoryInput } from "@/data/mockData";
import { toCategoryMutationBody, type ApiCategory } from "@/utils/categoryApi";

type CreateCategoryVariables = AgencyCategoryInput & {
  level: 1 | 2;
};

type CategoryMutationResponse = {
  success: boolean;
  data: ApiCategory;
};

async function createCategory(variables: CreateCategoryVariables): Promise<ApiCategory> {
  const body = toCategoryMutationBody(variables);

  if (variables.level === 2 && variables.parentId) {
    const res = await apiClient.post<CategoryMutationResponse>(
      `/categories/${variables.parentId}/subcategories`,
      body
    );
    return res.data.data;
  }

  const res = await apiClient.post<CategoryMutationResponse>("/categories", body);
  return res.data.data;
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agency", "categories"] });
    },
  });
}
