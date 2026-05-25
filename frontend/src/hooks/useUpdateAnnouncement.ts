"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api";
import type { Announcement, AnnouncementInput } from "@/data/mockData";
import {
  mapAnnouncement,
  toAnnouncementUpdateBody,
  type ApiAnnouncement,
} from "@/utils/announcementApi";

type UpdateAnnouncementVariables = {
  id: string;
  data: AnnouncementInput;
};

type UpdateResponse = {
  success: boolean;
  data: ApiAnnouncement;
};

async function updateAnnouncement({
  id,
  data,
}: UpdateAnnouncementVariables): Promise<Announcement> {
  const res = await apiClient.patch<UpdateResponse>(
    `/admin/announcements/${id}`,
    toAnnouncementUpdateBody(data)
  );
  return mapAnnouncement(res.data.data);
}

/** PATCH /api/v1/admin/announcements/{id} */
export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "announcements"] });
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });
}

export const useAdminUpdateAnnouncement = useUpdateAnnouncement;
