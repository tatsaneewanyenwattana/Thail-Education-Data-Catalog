"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/services/api";
import type { StatsOverviewData } from "@/types/stats";

/** GET /api/v1/stats/overview — ไม่ต้อง Auth */
export function useStatsOverview() {
  return useQuery<StatsOverviewData, Error>({
    queryKey: ["stats", "overview"],
    queryFn: async () => {
      const res = await apiClient.get<{ data: StatsOverviewData }>(
        "/stats/overview"
      );
      return res.data.data;
    },
    retry: 1,
    staleTime: 1000 * 60 * 2,
  });
}
