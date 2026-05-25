"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api";
import {
  DEFAULT_DASHBOARD_WIDGETS,
  type DashboardGridWidget,
} from "@/data/mockData";

type DashboardLayoutRecord = {
  id: string;
  user_id: string;
  layout: { widgets?: DashboardGridWidget[] } | DashboardGridWidget[];
  created_at: string;
  updated_at: string;
};

type DashboardLayoutResponse = {
  success: boolean;
  data: DashboardLayoutRecord | null;
};

function isValidWidget(widget: unknown): widget is DashboardGridWidget {
  if (!widget || typeof widget !== "object") return false;
  const w = widget as DashboardGridWidget;
  return (
    typeof w.id === "string" &&
    (w.type === "bar" ||
      w.type === "line" ||
      w.type === "pie" ||
      w.type === "stat") &&
    (w.colSpan === 1 || w.colSpan === 2 || w.colSpan === 3)
  );
}

export function parseWidgetsFromLayout(
  record: DashboardLayoutRecord | null | undefined
): DashboardGridWidget[] {
  if (!record?.layout) {
    return DEFAULT_DASHBOARD_WIDGETS;
  }

  const { layout } = record;
  const list = Array.isArray(layout)
    ? layout
    : Array.isArray(layout.widgets)
      ? layout.widgets
      : null;

  if (!list || list.length === 0) {
    return DEFAULT_DASHBOARD_WIDGETS;
  }

  const parsed = list.filter(isValidWidget);
  return parsed.length > 0 ? parsed : DEFAULT_DASHBOARD_WIDGETS;
}

export function useGetDashboardLayout() {
  return useQuery({
    queryKey: ["agency", "dashboard-layout"],
    queryFn: async () => {
      const res = await apiClient.get<DashboardLayoutResponse>(
        "/dashboard-layouts"
      );
      return res.data.data;
    },
    retry: 1,
    staleTime: 1000 * 60 * 5,
    select: parseWidgetsFromLayout,
  });
}

export function useSaveDashboardLayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (widgets: DashboardGridWidget[]) => {
      const res = await apiClient.put<{
        success: boolean;
        data: DashboardLayoutRecord;
      }>("/dashboard-layouts", {
        layout: { widgets },
      });
      return res.data.data;
    },
    retry: 1,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agency", "dashboard-layout"] });
    },
  });
}
