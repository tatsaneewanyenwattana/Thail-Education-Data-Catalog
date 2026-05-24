"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateAnnouncementMock,
  type AnnouncementInput,
} from "@/data/mockData";

type UpdateAnnouncementVariables = {
  id: string;
  data: AnnouncementInput;
};

async function updateAnnouncement({
  id,
  data,
}: UpdateAnnouncementVariables): Promise<void> {
  // TODO: PUT /api/v1/admin/announcements/{id}
  await Promise.resolve();
  updateAnnouncementMock(id, data);
}

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
