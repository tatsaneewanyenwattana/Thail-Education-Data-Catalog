"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/services/api";

export type AgencyActivityLogItem = {
  id: string;
  created_at: string;
  itemType: "dataset" | "scholarship";
  activityType: "upload" | "draft" | "update" | "delete";
  title: string | null;
};

export type AgencyActivityLogsResult = {
  items: AgencyActivityLogItem[];
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
  };
};

type ActivityLogListResponse = {
  success: boolean;
  data: AgencyActivityLogItem[];
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
  };
};

export const ACTIVITY_LOG_PAGE_SIZE = 20;

export function useAgencyActivityLogs(page = 1, pageSize = ACTIVITY_LOG_PAGE_SIZE) {
  return useQuery<AgencyActivityLogsResult>({
    queryKey: ["agency", "activity-logs", page, pageSize],
    queryFn: async () => {
      const res = await apiClient.get<ActivityLogListResponse>(
        "/agency/activity-logs",
        {
          params: {
            page,
            page_size: pageSize,
            sort: "created_at",
            order: "desc",
          },
        }
      );
      return {
        items: res.data.data ?? [],
        pagination: res.data.pagination ?? {
          page,
          page_size: pageSize,
          total_items: 0,
          total_pages: 1,
        },
      };
    },
    staleTime: 1000 * 60 * 3,
    retry: 1,
  });
}
