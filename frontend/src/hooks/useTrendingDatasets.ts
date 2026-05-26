"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/services/api";
import type { TrendingDatasetsData } from "@/types/stats";

const HOME_LIMIT = 6;

/** GET /api/v1/stats/trending — ไม่ต้อง Auth */
export function useTrendingDatasets(limit = HOME_LIMIT) {
  return useQuery<TrendingDatasetsData, Error>({
    queryKey: ["stats", "trending"],
    queryFn: async () => {
      const res = await apiClient.get<{ data: TrendingDatasetsData }>(
        "/stats/trending",
        { params: { limit } }
      );
      return res.data.data;
    },
    retry: 1,
    staleTime: 1000 * 60 * 2,
  });
}
