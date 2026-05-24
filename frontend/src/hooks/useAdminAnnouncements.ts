"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getAdminAnnouncementsMock,
  type AdminAnnouncementsResult,
} from "@/data/mockData";

type AdminAnnouncementsFilters = {
  page?: number;
};

async function fetchAdminAnnouncements(
  filters?: AdminAnnouncementsFilters
): Promise<AdminAnnouncementsResult> {
  // TODO: GET /api/v1/admin/announcements
  await Promise.resolve();
  return getAdminAnnouncementsMock(filters?.page);
}

export function useAdminAnnouncements(filters?: AdminAnnouncementsFilters) {
  return useQuery({
    queryKey: ["admin", "announcements", filters],
    queryFn: () => fetchAdminAnnouncements(filters),
    staleTime: 1000 * 60 * 5,
    placeholderData: () => getAdminAnnouncementsMock(filters?.page),
  });
}
