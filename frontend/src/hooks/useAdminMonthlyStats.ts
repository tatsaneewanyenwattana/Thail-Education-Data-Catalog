"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/services/api";

export type MonthlyDataPoint = {
  month: number;
  count: number;
};

export type MonthlyStats = {
  datasets_by_month: MonthlyDataPoint[];
  downloads_by_month: MonthlyDataPoint[];
};

const MONTH_NAMES_TH = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];
const MONTH_NAMES_EN = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export type ChartDataPoint = {
  month: string;
  count: number;
};

export function toChartData(
  points: MonthlyDataPoint[],
  locale: string
): ChartDataPoint[] {
  const names = locale === "th" ? MONTH_NAMES_TH : MONTH_NAMES_EN;
  // fill all 12 months
  const byMonth = Object.fromEntries(points.map((p) => [p.month, p.count]));
  return Array.from({ length: 12 }, (_, i) => ({
    month: names[i],
    count: byMonth[i + 1] ?? 0,
  }));
}

async function fetchMonthlyStats(year: number): Promise<MonthlyStats> {
  const res = await apiClient.get<{ data: MonthlyStats }>(
    "/admin/stats/monthly",
    { params: { year } }
  );
  return res.data.data;
}

export function useAdminMonthlyStats(year: number) {
  return useQuery({
    queryKey: ["admin", "stats", "monthly", year],
    queryFn: () => fetchMonthlyStats(year),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

async function fetchAvailableYears(): Promise<number[]> {
  const res = await apiClient.get<{ data: number[] }>("/admin/stats/years");
  return res.data.data ?? [];
}

export function useAdminStatsYears() {
  return useQuery({
    queryKey: ["admin", "stats", "years"],
    queryFn: fetchAvailableYears,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });
}
