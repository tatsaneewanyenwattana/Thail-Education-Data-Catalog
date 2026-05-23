"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAgencyCategoryMock } from "@/data/mockData";

type DeleteCategoryVariables = {
  id: string;
  level: 1 | 2;
};

async function deleteCategory(variables: DeleteCategoryVariables): Promise<void> {
  // TODO: เปลี่ยนเป็น API จริงเมื่อ Backend พร้อม
  // await apiClient.delete(`/agency/categories/${variables.id}`);

  await Promise.resolve();
  try {
    deleteAgencyCategoryMock(variables.level, variables.id);
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
      queryClient.invalidateQueries({ queryKey: ["agency", "categories"] });
    },
  });
}
