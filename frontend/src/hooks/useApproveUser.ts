"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { approveAdminUserMock } from "@/data/mockData";
// import apiClient from "@/services/api";

async function approveUser(userId: string): Promise<void> {
  // TODO: เปลี่ยนเป็น API จริงเมื่อ Backend พร้อม
  // await apiClient.post(`/admin/users/${userId}/approve`);
  await Promise.resolve();
  approveAdminUserMock(userId);
}

export function useApproveUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}
