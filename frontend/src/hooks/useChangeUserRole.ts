"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api";

export type ChangeUserRolePayload = {
  userId: string;
  role: "admin" | "agency";
};

type ChangeUserRoleResponse = {
  success: boolean;
  data: {
    id: string;
    email: string;
    role: "admin" | "agency";
  };
  message: string;
};

async function changeUserRole({
  userId,
  role,
}: ChangeUserRolePayload): Promise<ChangeUserRoleResponse["data"]> {
  const res = await apiClient.patch<ChangeUserRoleResponse>(
    `/admin/users/${userId}/role`,
    { role }
  );
  return res.data.data;
}

/** PATCH /api/v1/admin/users/{id}/role */
export function useChangeUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changeUserRole,
    retry: 0,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
}
