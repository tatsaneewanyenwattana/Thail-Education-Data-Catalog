"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createAgencyCategoryMock,
  type AgencyCategoryInput,
} from "@/data/mockData";

type CreateCategoryVariables = AgencyCategoryInput & {
  level: 1 | 2;
};

async function createCategory(
  variables: CreateCategoryVariables
): Promise<void> {
  // TODO: เปลี่ยนเป็น API จริงเมื่อ Backend พร้อม
  // await apiClient.post("/agency/categories", {
  //   name_th: variables.nameTh,
  //   name_en: variables.nameEn,
  //   slug: variables.slug,
  //   parent_id: variables.parentId,
  //   level: variables.level,
  // });

  await Promise.resolve();
  createAgencyCategoryMock(variables.level, variables);
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategory,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["agency", "categories"] });
      void variables;
    },
  });
}
