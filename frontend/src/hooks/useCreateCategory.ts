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
  const utf8JsonHeaders = {
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      Accept: "application/json; charset=UTF-8",
    },
  };

  if (variables.level === 2 && variables.parentId) {
    const res = await apiClient.post<CategoryMutationResponse>(
      `/categories/${variables.parentId}/subcategories`,
      body,
      utf8JsonHeaders
    );
    return res.data.data;
  }

  const res = await apiClient.post<CategoryMutationResponse>(
    "/categories",
    body,
    utf8JsonHeaders
  );
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
