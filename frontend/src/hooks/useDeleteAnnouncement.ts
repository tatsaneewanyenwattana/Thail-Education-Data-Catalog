"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api";

async function deleteAnnouncement(id: string): Promise<void> {
  await apiClient.delete(`/admin/announcements/${id}`);
}

/** DELETE /api/v1/admin/announcements/{id} */
export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAnnouncement,
    retry: 0,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "announcements"] });
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });
}

export const useAdminDeleteAnnouncement = useDeleteAnnouncement;
