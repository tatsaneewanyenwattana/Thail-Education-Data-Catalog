"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchAgencyCategoriesMock,
  type AgencyCategoriesResponse,
} from "@/data/mockData";

export function useAgencyCategories(level: 1 | 2, page = 1) {
  return useQuery<AgencyCategoriesResponse>({
    queryKey: ["agency", "categories", level, page],
    queryFn: async () => {
      // TODO: เปลี่ยนเป็น API จริงเมื่อ Backend พร้อม
      // const res = await apiClient.get<{ data: AgencyCategoriesResponse }>(
      //   "/agency/categories",
      //   { params: { level, page, page_size: 4 } }
      // );
      // return res.data.data;

      await Promise.resolve();
      return fetchAgencyCategoriesMock(level, page);
    },
    staleTime: 1000 * 60 * 5,
  });
}
