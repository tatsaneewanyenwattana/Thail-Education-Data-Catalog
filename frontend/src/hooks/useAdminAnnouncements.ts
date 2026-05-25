"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/services/api";
import {
  ADMIN_ANNOUNCEMENTS_PAGE_SIZE,
  type AdminAnnouncementsResult,
} from "@/data/mockData";
import { mapAnnouncement, type ApiAnnouncement } from "@/utils/announcementApi";

type AdminAnnouncementsFilters = {
  page?: number;
};

type AnnouncementsListResponse = {
  success: boolean;
  data: ApiAnnouncement[];
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
  };
};

async function fetchAdminAnnouncements(
  filters?: AdminAnnouncementsFilters
): Promise<AdminAnnouncementsResult> {
  const page = filters?.page ?? 1;
  const res = await apiClient.get<AnnouncementsListResponse>(
    "/admin/announcements",
    {
      params: {
        page,
        page_size: ADMIN_ANNOUNCEMENTS_PAGE_SIZE,
        sort: "created_at",
        order: "desc",
      },
    }
  );

  const pagination = res.data.pagination;
  return {
    data: (res.data.data ?? []).map(mapAnnouncement),
    total: pagination.total_items,
    page: pagination.page,
    pageSize: pagination.page_size,
    totalPages: pagination.total_pages,
  };
}

/** GET /api/v1/admin/announcements */
export function useAdminAnnouncements(filters?: AdminAnnouncementsFilters) {
  return useQuery({
    queryKey: ["admin", "announcements", filters],
    queryFn: () => fetchAdminAnnouncements(filters),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
