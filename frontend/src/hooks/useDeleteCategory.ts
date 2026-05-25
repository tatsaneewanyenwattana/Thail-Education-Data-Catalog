"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api";

type DeleteCategoryVariables = {
  id: string;
  level: 1 | 2;
};

async function deleteCategory(variables: DeleteCategoryVariables): Promise<void> {
  await apiClient.delete(`/categories/${variables.id}`);
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    retry: 0,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agency", "categories"] });
    },
  });
}
