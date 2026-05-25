"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import DashboardGrid from "@/components/dashboard/DashboardGrid";
import WidgetPanel from "@/components/dashboard/WidgetPanel";
import {
  DEFAULT_DASHBOARD_WIDGETS,
  type DashboardGridWidget,
} from "@/data/mockData";
import {
  useGetDashboardLayout,
  useSaveDashboardLayout,
} from "@/hooks/useDashboardLayout";

export default function CustomDashboardPage() {
  const t = useTranslations("agency.customDashboard");
  const { data: loadedWidgets, isLoading, isError, isSuccess } =
    useGetDashboardLayout();
  const saveMutation = useSaveDashboardLayout();

  const [widgets, setWidgets] = useState<DashboardGridWidget[]>(
    DEFAULT_DASHBOARD_WIDGETS
  );
  const [initialized, setInitialized] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [showGuides, setShowGuides] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isSuccess && loadedWidgets) {
      setWidgets(loadedWidgets);
      setInitialized(true);
    }
  }, [isSuccess, loadedWidgets]);

  const handleSave = async () => {
    try {
      await saveMutation.mutateAsync(widgets);
      setToastMessage(t("saveSuccess"));
      window.setTimeout(() => setToastMessage(null), 3000);
    } catch {
      setToastMessage(t("saveError"));
      window.setTimeout(() => setToastMessage(null), 3000);
    }
  };

  if (isLoading || !initialized) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 animate-pulse rounded-radius-md bg-surface-container" />
        <div className="min-h-[600px] animate-pulse rounded-radius-lg bg-surface-container" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-radius-md border border-status-error bg-status-error-bg px-4 py-3 font-sarabun text-label text-status-error">
        {t("loadError")}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 border-b border-border-default/20 pb-6 md:flex-row md:items-end">
        <div>
          <h1 className="font-kanit text-[28px] font-bold leading-tight text-text-primary">
            {t("title")}
          </h1>
          <p className="mt-1 font-sarabun text-label text-text-muted">
            {t("subtitle")}
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="inline-flex items-center justify-center gap-2 rounded-radius-lg bg-primary px-6 py-2.5 font-sarabun text-label font-bold text-surface-card shadow-level-1 transition-opacity hover:bg-primary-hover disabled:opacity-50"
        >
          <SaveIcon />
          {saveMutation.isPending ? t("saving") : t("saveLayout")}
        </button>
      </header>

      {toastMessage && (
        <div
          className="rounded-radius-md border border-primary-dark/30 bg-primary-light px-4 py-3 font-sarabun text-label text-primary-dark"
          role="status"
        >
          {toastMessage}
        </div>
      )}

      <div className="flex flex-col gap-0 lg:flex-row">
        <div className="min-w-0 flex-1">
          <DashboardGrid
            widgets={widgets}
            onWidgetsChange={setWidgets}
            showGuides={showGuides}
          />
        </div>
        <WidgetPanel
          snapToGrid={snapToGrid}
          showGuides={showGuides}
          onSnapToGridChange={setSnapToGrid}
          onShowGuidesChange={setShowGuides}
        />
      </div>
    </div>
  );
}

function SaveIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" />
    </svg>
  );
}
