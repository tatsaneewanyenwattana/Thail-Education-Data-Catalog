"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getActiveAnnouncementsMock,
  type Announcement,
} from "@/data/mockData";

async function fetchAnnouncements(): Promise<Announcement[]> {
  // TODO: GET /api/v1/announcements (public)
  await Promise.resolve();
  return getActiveAnnouncementsMock();
}

export function useAnnouncements() {
  return useQuery({
    queryKey: ["announcements", "active"],
    queryFn: fetchAnnouncements,
    staleTime: 1000 * 60 * 5,
    placeholderData: () => getActiveAnnouncementsMock(),
  });
}
