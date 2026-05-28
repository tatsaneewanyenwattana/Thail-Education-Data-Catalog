"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/services/api";

export type AgencyActivityLogItem = {
  created_at: string;
  action: string;
  target_type: string;
  target_id: string | null;
  dataset_title: string | null;
  status: string;
};

type ActivityLogListResponse = {
  data: AgencyActivityLogItem[];
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
  };
};

export function useAgencyActivityLogs(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ["agency", "activity-logs", page, pageSize],
    queryFn: async () => {
      const res = await apiClient.get<ActivityLogListResponse>("/agency/activity-logs", {
        params: {
          page,
          page_size: pageSize,
          sort: "created_at",
          order: "desc",
        },
      });
      return res.data;
    },
    staleTime: 1000 * 60 * 3,
    retry: 1,
  });
}
