"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateAgencyCategoryMock,
  type AgencyCategoryInput,
} from "@/data/mockData";

type UpdateCategoryVariables = AgencyCategoryInput & {
  id: string;
  level: 1 | 2;
};

async function updateCategory(variables: UpdateCategoryVariables): Promise<void> {
  // TODO: เปลี่ยนเป็น API จริงเมื่อ Backend พร้อม
  // await apiClient.put(`/agency/categories/${variables.id}`, {
  //   name_th: variables.nameTh,
  //   name_en: variables.nameEn,
  //   slug: variables.slug,
  //   parent_id: variables.parentId,
  // });

  await Promise.resolve();
  updateAgencyCategoryMock(variables.level, variables.id, variables);
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
