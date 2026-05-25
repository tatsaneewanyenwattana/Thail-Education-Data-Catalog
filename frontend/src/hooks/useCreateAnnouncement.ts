"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api";
import type { Announcement, AnnouncementInput } from "@/data/mockData";
import {
  mapAnnouncement,
  toAnnouncementCreateBody,
  type ApiAnnouncement,
} from "@/utils/announcementApi";

type CreateResponse = {
  success: boolean;
  data: ApiAnnouncement;
};

async function createAnnouncement(
  data: AnnouncementInput
): Promise<Announcement> {
  const res = await apiClient.post<CreateResponse>(
    "/admin/announcements",
    toAnnouncementCreateBody(data)
  );
  return mapAnnouncement(res.data.data);
}

/** POST /api/v1/admin/announcements */
export function useCreateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "announcements"] });
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });
}

export const useAdminCreateAnnouncement = useCreateAnnouncement;
