"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/services/api";
import type { NewReleasesData } from "@/types/stats";

const HOME_LIMIT = 6;

/** GET /api/v1/stats/new-releases — ไม่ต้อง Auth */
export function useNewReleases(limit = HOME_LIMIT) {
  return useQuery<NewReleasesData, Error>({
    queryKey: ["stats", "new-releases"],
    queryFn: async () => {
      const res = await apiClient.get<{ data: NewReleasesData }>(
        "/stats/new-releases",
        { params: { limit } }
      );
      return res.data.data;
    },
    retry: 1,
    staleTime: 1000 * 60 * 2,
  });
}
