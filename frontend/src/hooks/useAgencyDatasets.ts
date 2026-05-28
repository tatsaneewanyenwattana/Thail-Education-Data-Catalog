"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/services/api";
import type { AgencyDatasetRow } from "@/data/mockData";

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

function mapDataset(item: ApiAgencyDataset): AgencyDatasetRow {
  const status = item.status as AgencyDatasetRow["status"];
  return {
    id: String(item.id),
    title: item.title,
    titleEn: item.titleEn ?? item.title_en ?? item.title,
    category: item.category,
    categoryEn: item.categoryEn ?? item.category_en ?? item.category,
    subcategory: item.subcategory,
    subcategoryEn: item.subcategoryEn ?? item.subcategory_en ?? item.subcategory,
    status:
      status === "published" || status === "draft"
        ? status
        : "draft",
    qualityScore: item.qualityScore ?? item.quality_score ?? 0,
    downloadCount: item.downloadCount ?? item.download_count ?? 0,
    updatedAt: item.updatedAt ?? item.updated_at ?? new Date().toISOString(),
  };
}

async function fetchAgencyDatasets(
  status: AgencyDatasetStatusFilter,
  page: number,
  limit?: number
): Promise<AgencyDatasetsResponse> {
  const pageSize = limit ?? PAGE_SIZE;
  const res = await apiClient.get<ListResponse>("/agency/datasets", {
    params: {
      page,
      page_size: pageSize,
      sort: "updated_at",
      order: "desc",
      ...(status !== "all" ? { status } : {}),
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
  limit?: number
) {
  return useQuery({
    queryKey: ["agency", "datasets", status, page, limit ?? PAGE_SIZE],
    queryFn: () => fetchAgencyDatasets(status, page, limit),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
