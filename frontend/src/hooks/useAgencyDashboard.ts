"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/services/api";
import type {
  AgencyDashboardStats,
  AgencyMonthlyDownload,
} from "@/data/mockData";

type ApiMonthlyDownload = {
  month: string;
  count: number;
  monthEn?: string;
  month_en?: string;
};

type ApiAgencyDashboardData = {
  total_datasets: number;
  published_datasets: number;
  draft_datasets: number;
  submitted_datasets: number;
  total_downloads: number;
  monthly_downloads: ApiMonthlyDownload[];
  datasets_created_this_month: number;
  datasets_created_last_month: number;
  datasets_month_change_percent: number | null;
  downloads_this_month: number;
  top_download_format: string | null;
  top_download_format_percent: number | null;
};

function mapMonthlyDownloads(
  items: ApiMonthlyDownload[]
): AgencyMonthlyDownload[] {
  return items.map((item) => ({
    month: item.month,
    monthEn: item.monthEn ?? item.month_en ?? item.month,
    count: item.count,
  }));
}

function mapAgencyDashboard(data: ApiAgencyDashboardData): AgencyDashboardStats {
  return {
    totalDatasets: data.total_datasets,
    publishedDatasets: data.published_datasets,
    draftDatasets: data.draft_datasets,
    submittedDatasets: data.submitted_datasets,
    totalDownloads: data.total_downloads,
    monthlyDownloads: mapMonthlyDownloads(data.monthly_downloads ?? []),
    datasetsCreatedThisMonth: data.datasets_created_this_month ?? 0,
    datasetsCreatedLastMonth: data.datasets_created_last_month ?? 0,
    datasetsMonthChangePercent: data.datasets_month_change_percent ?? null,
    downloadsThisMonth: data.downloads_this_month ?? 0,
    topDownloadFormat: data.top_download_format ?? null,
    topDownloadFormatPercent: data.top_download_format_percent ?? null,
  };
}

async function fetchAgencyDashboard(): Promise<AgencyDashboardStats> {
  const res = await apiClient.get<{ data: ApiAgencyDashboardData }>(
    "/agency/dashboard"
  );
  const data = res.data?.data;
  if (!data) {
    throw new Error("โหลดข้อมูล Dashboard ไม่สำเร็จ");
  }
  return mapAgencyDashboard(data);
}

export function useAgencyDashboard() {
  return useQuery({
    queryKey: ["agency", "dashboard"],
    queryFn: fetchAgencyDashboard,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
