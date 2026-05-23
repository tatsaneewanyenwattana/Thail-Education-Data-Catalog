"use client";

import { useCallback } from "react";
import {
  DEFAULT_DASHBOARD_WIDGETS,
  type DashboardGridWidget,
} from "@/data/mockData";

const STORAGE_KEY = "dashboard-layout";

export function useDashboardLayout() {
  const save = useCallback((widgets: DashboardGridWidget[]) => {
    // TODO: เปลี่ยนเป็น API จริงเมื่อ Backend พร้อม
    // await apiClient.put("/dashboard-layouts", { layout: widgets });

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
    }
  }, []);

  const load = useCallback((): DashboardGridWidget[] => {
    // TODO: เปลี่ยนเป็น API จริงเมื่อ Backend พร้อม
    // const res = await apiClient.get("/dashboard-layouts");
    // return res.data.data.layout;

    if (typeof window === "undefined") {
      return DEFAULT_DASHBOARD_WIDGETS;
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return DEFAULT_DASHBOARD_WIDGETS;
    }

    try {
      const parsed = JSON.parse(saved) as DashboardGridWidget[];
      return Array.isArray(parsed) && parsed.length > 0
        ? parsed
        : DEFAULT_DASHBOARD_WIDGETS;
    } catch {
      return DEFAULT_DASHBOARD_WIDGETS;
    }
  }, []);

  return { save, load };
}
