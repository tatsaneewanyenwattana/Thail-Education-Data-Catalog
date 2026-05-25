"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api";
import type { Announcement } from "@/data/mockData";
import { mapAnnouncement, type ApiAnnouncement } from "@/utils/announcementApi";

type ToggleAnnouncementVariables = {
  id: string;
  isActive: boolean;
};

type ToggleResponse = {
  success: boolean;
  data: ApiAnnouncement;
};

async function toggleAnnouncement({
  id,
  isActive,
}: ToggleAnnouncementVariables): Promise<Announcement> {
  const res = await apiClient.patch<ToggleResponse>(
    `/admin/announcements/${id}`,
    { is_active: isActive }
  );
  return mapAnnouncement(res.data.data);
}

/** PATCH /api/v1/admin/announcements/{id} — toggle is_active */
export function useToggleAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "announcements"] });
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });
}

export const useAdminToggleAnnouncement = useToggleAnnouncement;
