"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  fetchAgencyCategoriesTree,
  type AgencyCategoriesTreeCache,
} from "@/utils/categoryApi";
import apiClient from "@/services/api";

export type CategoryWithCount = {
  id: string;
  name: string;
  nameEn: string;
  datasetCount: number;
};

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

async function fetchAgencyCategories(): Promise<CategoryWithCount[]> {
  const res = await apiClient.get<{ data: Array<{ id: string; name: string; name_en: string; dataset_count: number }> }>(
    "/agency/categories"
  );
  const data = res.data?.data || [];
  return data.map((item) => ({
    id: item.id,
    name: item.name,
    nameEn: item.name_en,
    datasetCount: item.dataset_count || 0,
  }));
}

export function useAgencyCategories() {
  return useQuery({
    queryKey: ["agency", "categories-count"],
    queryFn: fetchAgencyCategories,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
