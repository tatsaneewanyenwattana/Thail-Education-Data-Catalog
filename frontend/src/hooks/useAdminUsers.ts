"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getAdminUsersMock,
  type AdminUsersFilters,
  type AdminUsersResult,
} from "@/data/mockData";
// import apiClient from "@/services/api";

async function fetchAdminUsers(
  filters?: AdminUsersFilters
): Promise<AdminUsersResult> {
  // TODO: เปลี่ยนเป็น API จริงเมื่อ Backend พร้อม
  // const res = await apiClient.get<{ data: AdminUser[]; pagination: Pagination }>(
  //   "/admin/users",
  //   { params: filters }
  // );
  // return res.data;
  await Promise.resolve();
  return getAdminUsersMock(filters);
}

/**
 * Pending users on Admin Dashboard — use filters: { status: "pending" }.
 * GET /api/v1/admin/users?status=pending
 */
export function useAdminUsers(filters?: AdminUsersFilters) {
  return useQuery({
    queryKey: ["admin", "users", filters],
    queryFn: () => fetchAdminUsers(filters),
    staleTime: 1000 * 60 * 5,
    placeholderData: () => getAdminUsersMock(filters),
  });
}
