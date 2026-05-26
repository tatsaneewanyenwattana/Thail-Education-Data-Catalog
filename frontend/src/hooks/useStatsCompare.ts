"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/services/api";
import type { ApiDataset } from "@/types/dataset";

export type StatsCompareData = {
  datasets: ApiDataset[];
};

/** GET /api/v1/stats/compare — ไม่ต้อง Auth (query: ids) */
export function useStatsCompare(ids: string[], enabled = true) {
  const sortedIds = [...ids].sort();

  return useQuery<StatsCompareData, Error>({
    queryKey: ["stats", "compare", sortedIds],
    queryFn: async () => {
      const res = await apiClient.get<{ data: StatsCompareData }>(
        "/stats/compare",
        { params: { ids: sortedIds } }
      );
      return res.data.data;
    },
    enabled: enabled && sortedIds.length >= 2,
    retry: 1,
    staleTime: 1000 * 60 * 2,
  });
}
