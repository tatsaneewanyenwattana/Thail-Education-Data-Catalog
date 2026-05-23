"use client";

import { useQuery } from "@tanstack/react-query";
import {
  mockAgencyDatasets,
  type AgencyDatasetRow,
} from "@/data/mockData";

export type AgencyDatasetStatusFilter = "all" | "draft" | "published";

export type AgencyDatasetsResponse = {
  data: AgencyDatasetRow[];
  total: number;
  page: number;
  totalPages: number;
};

const PAGE_SIZE = 10;

async function fetchAgencyDatasets(
  status: AgencyDatasetStatusFilter,
  page: number,
  limit?: number
): Promise<AgencyDatasetsResponse> {
  // TODO: เปลี่ยนเป็น API จริงเมื่อ Backend พร้อม
  // const response = await apiClient.get<{ data: AgencyDatasetsResponse }>(
  //   "/agency/datasets",
  //   { params: { status: status === "all" ? undefined : status, page, limit: limit ?? PAGE_SIZE } }
  // );
  // return response.data.data;

  await Promise.resolve();

  const filtered =
    status === "all"
      ? mockAgencyDatasets
      : mockAgencyDatasets.filter((dataset) => dataset.status === status);

  if (limit) {
    return {
      data: filtered.slice(0, limit),
      total: filtered.length,
      page: 1,
      totalPages: 1,
    };
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;

  return {
    data: filtered.slice(start, start + PAGE_SIZE),
    total: filtered.length,
    page: currentPage,
    totalPages,
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
  });
}
