"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createAnnouncementMock,
  type AnnouncementInput,
} from "@/data/mockData";

async function createAnnouncement(data: AnnouncementInput): Promise<void> {
  // TODO: POST /api/v1/admin/announcements
  await Promise.resolve();
  createAnnouncementMock(data);
}

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
