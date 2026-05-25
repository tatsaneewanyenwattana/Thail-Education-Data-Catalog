"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { rejectAdminUserMock } from "@/data/mockData";
// import apiClient from "@/services/api";

type RejectUserInput = {
  userId: string;
  reason: string;
};

async function rejectUser({ userId, reason }: RejectUserInput): Promise<void> {
  // TODO: เปลี่ยนเป็น API จริงเมื่อ Backend พร้อม
  // await apiClient.post(`/admin/users/${userId}/reject`, { reason });
  await Promise.resolve();
  rejectAdminUserMock(userId, reason);
}

export function useRejectUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rejectUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}
