"use client";

import { useQuery } from "@tanstack/react-query";
import type { AgencyCategoriesResponse, AgencyCategoryL1 } from "@/data/mockData";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  fetchAgencyCategoriesCache,
  paginateAgencyCategories,
  type AgencyCategoriesCache,
} from "@/utils/categoryApi";

export function useAgencyCategories(level: 1 | 2, page = 1) {
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery<AgencyCategoriesCache, Error, AgencyCategoriesResponse>({
    queryKey: ["agency", "categories"],
    queryFn: () => fetchAgencyCategoriesCache(userId!),
    enabled: Boolean(userId),
    retry: 1,
    staleTime: 1000 * 60 * 5,
    select: (cache) => paginateAgencyCategories(cache, level, page),
  });
}

export function useAgencyCategoryParents() {
  const userId = useAuthStore((s) => s.user?.id);

  return useQuery<AgencyCategoriesCache, Error, AgencyCategoryL1[]>({
    queryKey: ["agency", "categories"],
    queryFn: () => fetchAgencyCategoriesCache(userId!),
    enabled: Boolean(userId),
    retry: 1,
    staleTime: 1000 * 60 * 5,
    select: (cache) => cache.l1,
  });
}
