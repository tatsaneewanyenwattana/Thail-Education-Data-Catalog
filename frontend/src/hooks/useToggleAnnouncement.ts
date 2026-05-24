"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleAnnouncementMock } from "@/data/mockData";

type ToggleAnnouncementVariables = {
  id: string;
  isActive: boolean;
};

async function toggleAnnouncement({
  id,
  isActive,
}: ToggleAnnouncementVariables): Promise<void> {
  // TODO: PUT /api/v1/admin/announcements/{id}
  await Promise.resolve();
  toggleAnnouncementMock(id, isActive);
}

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
