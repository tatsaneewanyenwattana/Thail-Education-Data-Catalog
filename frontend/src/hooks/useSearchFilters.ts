"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/services/api";

export type SearchFilterCategory = {
  id: string;
  parent_id: string | null;
  level: number;
  name_th: string;
  name_en: string;
  slug: string;
};

export type SearchFilterAgency = {
  agency_user_id: string;
  agency_name: string;
};

export type SearchFilterOptions = {
  categories: SearchFilterCategory[];
  agencies: SearchFilterAgency[];
  years: number[];
  provinces: string[];
  formats: string[];
  tags: string[];
};

export type SearchFilterScope = {
  categoryId?: string | null;
  agencyUserId?: string | null;
  province?: string | null;
};

type SearchFiltersResponse = {
  success: boolean;
  data: SearchFilterOptions;
};

const EMPTY_FILTERS: SearchFilterOptions = {
  categories: [],
  agencies: [],
  years: [],
  provinces: [],
  formats: [],
  tags: [],
};

async function fetchSearchFilters(
  scope: SearchFilterScope
): Promise<SearchFilterOptions> {
  const params: Record<string, string> = {};
  if (scope.categoryId) {
    params.category_id = scope.categoryId;
  }
  if (scope.agencyUserId) {
    params.agency_user_id = scope.agencyUserId;
  }
  if (scope.province) {
    params.province = scope.province;
  }

  const res = await apiClient.get<SearchFiltersResponse>("/search/filters", {
    params,
  });
  const body = res.data as SearchFiltersResponse;
  return body.data ?? EMPTY_FILTERS;
}

/** GET /api/v1/search/filters — ตัวเลือก filter จากข้อมูลจริง (scope ตามหมวด/หน่วยงานที่เลือก) */
export function useSearchFilters(scope: SearchFilterScope = {}) {
  return useQuery({
    queryKey: [
      "search",
      "filters",
      scope.categoryId ?? null,
      scope.agencyUserId ?? null,
      scope.province ?? null,
    ],
    queryFn: () => fetchSearchFilters(scope),
    retry: 2,
    staleTime: 1000 * 60 * 5,
    placeholderData: (previous) => previous ?? EMPTY_FILTERS,
  });
}
