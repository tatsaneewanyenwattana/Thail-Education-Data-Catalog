"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  fetchAgencyCategoriesTree,
  type AgencyCategoriesTreeCache,
} from "@/utils/categoryApi";

export function useAgencyCategoryTree() {
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery<AgencyCategoriesTreeCache>({
    queryKey: ["agency", "categories", userId],
    queryFn: () => fetchAgencyCategoriesTree(),
    enabled: Boolean(userId),
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });
}
