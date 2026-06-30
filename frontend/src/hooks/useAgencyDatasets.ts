"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/services/api";
import type { AgencyDatasetRow } from "@/types/dataset";

export type AgencyDatasetStatusFilter =
  | "all"
  | "draft"
  | "published";

export type AgencyDatasetsResponse = {
  data: AgencyDatasetRow[];
  total: number;
  page: number;
  totalPages: number;
};

type ApiAgencyDataset = {
  id: string;
  title: string;
  titleEn?: string;
  title_en?: string;
  category: string;
  categoryEn?: string;
  category_en?: string;
  subcategory: string;
  subcategoryEn?: string;
  subcategory_en?: string;
  status: string;
  qualityScore?: number;
  quality_score?: number;
  downloadCount?: number;
  download_count?: number;
  updatedAt?: string;
  updated_at?: string;
  fileFormat?: string | null;
  file_format?: string | null;
};

type ListResponse = {
  success: boolean;
  data: ApiAgencyDataset[];
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
  };
};

const PAGE_SIZE = 10;

function normalizeStatus(raw: string): AgencyDatasetRow["status"] {
  const status = raw?.toLowerCase?.() ?? raw;
  return status === "published" ? "published" : "draft";
}

function mapDataset(item: ApiAgencyDataset): AgencyDatasetRow {
  return {
    id: String(item.id),
    title: item.title,
    titleEn: item.titleEn ?? item.title_en ?? item.title,
    category: item.category,
    categoryEn: item.categoryEn ?? item.category_en ?? item.category,
    subcategory: item.subcategory,
    subcategoryEn: item.subcategoryEn ?? item.subcategory_en ?? item.subcategory,
    status: normalizeStatus(item.status),
    qualityScore: item.qualityScore ?? item.quality_score ?? 0,
    downloadCount: item.downloadCount ?? item.download_count ?? 0,
    updatedAt: item.updatedAt ?? item.updated_at ?? new Date().toISOString(),
    fileFormat: item.fileFormat ?? item.file_format ?? null,
  };
}

async function fetchAgencyDatasets(
  status: AgencyDatasetStatusFilter,
  page: number,
  limit?: number,
  search?: string,
  year?: number,
): Promise<AgencyDatasetsResponse> {
  const pageSize = limit ?? PAGE_SIZE;
  const res = await apiClient.get<ListResponse>("/agency/datasets", {
    params: {
      page,
      page_size: pageSize,
      sort: "updated_at",
      order: "desc",
      ...(status !== "all" ? { status } : {}),
      ...(search ? { search } : {}),
      ...(year ? { year } : {}),
    },
  });

  const body = res.data;
  if (!body?.data || !body.pagination) {
    throw new Error("โหลดรายการ Dataset ไม่สำเร็จ");
  }

  return {
    data: body.data.map(mapDataset),
    total: body.pagination.total_items,
    page: body.pagination.page,
    totalPages: body.pagination.total_pages,
  };
}

export function useAgencyDatasets(
  status: AgencyDatasetStatusFilter = "all",
  page = 1,
  limit?: number,
  search?: string,
  year?: number,
) {
  return useQuery({
    queryKey: ["agency", "datasets", status, page, limit ?? PAGE_SIZE, search, year],
    queryFn: () => fetchAgencyDatasets(status, page, limit, search, year),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useAgencyDatasetYears() {
  return useQuery({
    queryKey: ["agency", "datasets", "years"],
    queryFn: async () => {
      const res = await apiClient.get<{ success: boolean; data: number[] }>("/agency/datasets/years");
      return res.data.data;
    },
    staleTime: 1000 * 60 * 10,
  });
}
