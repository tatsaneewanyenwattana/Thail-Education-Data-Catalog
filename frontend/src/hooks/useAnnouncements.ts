"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/services/api";
import type { Announcement } from "@/data/mockData";
import { mapAnnouncement, type ApiAnnouncement } from "@/utils/announcementApi";

type AnnouncementsResponse = {
  success: boolean;
  data: ApiAnnouncement[];
};

/**
 * Banner หน้าหลัก — ประกาศที่ is_active = true
 * ใช้ GET /public/announcements (ไม่ต้อง login; Visitor เข้า /th ได้)
 */
async function fetchAnnouncements(): Promise<Announcement[]> {
  const res = await apiClient.get<AnnouncementsResponse>("/public/announcements");
  return (res.data.data ?? []).map(mapAnnouncement);
}

export function useAnnouncements() {
  return useQuery({
    queryKey: ["announcements"],
    queryFn: fetchAnnouncements,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
