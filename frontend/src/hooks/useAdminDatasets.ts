"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/services/api";
import {
  ADMIN_DATASETS_PAGE_SIZE,
  type AdminDataset,
  type AdminDatasetsFilters,
  type AdminDatasetsResult,
} from "@/data/mockData";

type ApiAdminDataset = {
  id: string;
  title: string;
  titleEn?: string;
  title_en?: string;
  agency: string;
  agencyEn?: string;
  agency_en?: string;
  category: string;
  categoryEn?: string;
  category_en?: string;
  status: string;
  qualityScore?: number;
  quality_score?: number;
  updatedAt?: string;
  updated_at?: string;
};

type AdminDatasetsListResponse = {
  success: boolean;
  data: ApiAdminDataset[];
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
  };
};

function mapAdminDataset(item: ApiAdminDataset): AdminDataset {
  const status = item.status as AdminDataset["status"];
  return {
    id: String(item.id),
    title: item.title,
    titleEn: item.titleEn ?? item.title_en ?? item.title,
    agency: item.agency,
    agencyEn: item.agencyEn ?? item.agency_en ?? item.agency,
    category: item.category,
    categoryEn: item.categoryEn ?? item.category_en ?? item.category,
    status: status === "published" || status === "draft" ? status : "draft",
    qualityScore: item.qualityScore ?? item.quality_score ?? 0,
    updatedAt: item.updatedAt ?? item.updated_at ?? new Date().toISOString(),
  };
}

function buildQueryParams(filters?: AdminDatasetsFilters) {
  const params: Record<string, string | number | boolean> = {
    all: true,
    page: filters?.page ?? 1,
    page_size: ADMIN_DATASETS_PAGE_SIZE,
    sort: "updated_at",
    order: "desc",
  };

  if (filters?.status && filters.status !== "all") {
    params.status = filters.status;
  }
  if (filters?.agency && filters.agency !== "all") {
    params.agency = filters.agency;
  }
  if (filters?.search?.trim()) {
    params.search = filters.search.trim();
  }

  return params;
}

async function fetchAgencyNames(): Promise<string[]> {
  const res = await apiClient.get<AdminDatasetsListResponse>("/datasets", {
    params: {
      all: true,
      page: 1,
      page_size: 100,
      sort: "updated_at",
      order: "desc",
    },
  });

  const names = new Set<string>();
  for (const row of res.data.data ?? []) {
    const agency = row.agency?.trim();
    if (agency) {
      names.add(agency);
    }
  }
  return [...names].sort();
}

async function fetchAdminDatasets(
  filters?: AdminDatasetsFilters
): Promise<AdminDatasetsResult> {
  const [listRes, agencies] = await Promise.all([
    apiClient.get<AdminDatasetsListResponse>("/datasets", {
      params: buildQueryParams(filters),
    }),
    fetchAgencyNames(),
  ]);

  const pagination = listRes.data.pagination;

  return {
    data: (listRes.data.data ?? []).map(mapAdminDataset),
    total: pagination.total_items,
    page: pagination.page,
    pageSize: pagination.page_size,
    totalPages: pagination.total_pages,
    agencies,
  };
}

/** GET /api/v1/datasets?all=true — Admin ดู Dataset ทุกหน่วยงาน ทุก status */
export function useAdminDatasets(filters?: AdminDatasetsFilters) {
  return useQuery({
    queryKey: ["admin", "datasets", filters],
    queryFn: () => fetchAdminDatasets(filters),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
