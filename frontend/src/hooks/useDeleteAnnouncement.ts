"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAnnouncementMock } from "@/data/mockData";

async function deleteAnnouncement(id: string): Promise<void> {
  // TODO: DELETE /api/v1/admin/announcements/{id}
  await Promise.resolve();
  deleteAnnouncementMock(id);
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "announcements"] });
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });
}
