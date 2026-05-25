"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api";
import type { AgencyCategoryInput } from "@/data/mockData";
import {
  toCategoryUpdateBody,
  type ApiCategory,
} from "@/utils/categoryApi";

type UpdateCategoryVariables = AgencyCategoryInput & {
  id: string;
  level: 1 | 2;
  originalNameTh?: string;
  originalNameEn?: string;
};

type CategoryMutationResponse = {
  success: boolean;
  data: ApiCategory;
};

async function updateCategory(
  variables: UpdateCategoryVariables
): Promise<ApiCategory> {
  const body = toCategoryUpdateBody(
    { nameTh: variables.nameTh, nameEn: variables.nameEn },
    variables.originalNameTh !== undefined &&
      variables.originalNameEn !== undefined
      ? {
          nameTh: variables.originalNameTh,
          nameEn: variables.originalNameEn,
        }
      : undefined
  );

  const res = await apiClient.patch<CategoryMutationResponse>(
    `/categories/${variables.id}`,
    body
  );

  if (!res.data.data) {
    throw new Error("Invalid category update response");
  }

  return res.data.data;
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agency", "categories"] });
    },
  });
}
