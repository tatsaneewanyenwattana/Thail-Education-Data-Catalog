"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getAdminDashboardMock,
  mockAdminDashboard,
  type AdminDashboardData,
} from "@/data/mockData";
// import apiClient from "@/services/api";

/**
 * API response shape from GET /api/v1/admin/stats (snake_case).
 * Map to AdminDashboardData (camelCase) when backend is ready.
 */
// type AdminStatsApiData = {
//   total_users: number;
//   total_datasets: number;
//   pending_users: number;
//   today_downloads: number;
//   datasets_by_month: { month: string; count: number }[];
//   downloads_by_month: { month: string; count: number }[];
// };

async function fetchAdminDashboard(): Promise<AdminDashboardData> {
  // TODO: เปลี่ยนเป็น API จริงเมื่อ Backend พร้อม
  // const statsRes = await apiClient.get<{ data: AdminStatsApiData }>(
  //   "/admin/stats"
  // );
  // const stats = statsRes.data.data;
  // const pendingRes = await apiClient.get<{ data: AdminUser[] }>(
  //   "/admin/users",
  //   { params: { status: "pending" } }
  // );
  // return mapAdminStatsToDashboard(stats, pendingRes.data.data);
  await Promise.resolve();
  return getAdminDashboardMock();
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: fetchAdminDashboard,
    staleTime: 1000 * 60 * 5,
    placeholderData: mockAdminDashboard,
  });
}
