"use client";

import type { ReactNode } from "react";
import { useDraggable } from "@dnd-kit/core";
import { useTranslations } from "next-intl";
import type { DashboardWidgetType } from "@/data/mockData";

type WidgetPanelProps = {
  snapToGrid: boolean;
  showGuides: boolean;
  onSnapToGridChange: (value: boolean) => void;
  onShowGuidesChange: (value: boolean) => void;
};

type PaletteItem = {
  type: DashboardWidgetType;
  icon: ReactNode;
  labelKey: "bar" | "line" | "pie" | "stat";
};

const PALETTE_ITEMS: PaletteItem[] = [
  { type: "bar", labelKey: "bar", icon: <BarIcon /> },
  { type: "line", labelKey: "line", icon: <LineIcon /> },
  { type: "pie", labelKey: "pie", icon: <PieIcon /> },
  { type: "stat", labelKey: "stat", icon: <StatIcon /> },
];

function DraggablePaletteItem({
  type,
  icon,
  labelKey,
}: {
  type: DashboardWidgetType;
  icon: ReactNode;
  labelKey: PaletteItem["labelKey"];
}) {
  const t = useTranslations("agency.customDashboard.palette");
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: { type, fromPalette: true },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex cursor-grab items-center gap-3 rounded-radius-lg border border-border-default bg-surface-page p-4 transition-all hover:border-primary-dark hover:bg-primary-light active:cursor-grabbing ${
        isDragging ? "opacity-50" : ""
      }`}
      {...listeners}
      {...attributes}
    >
      <span className="text-text-muted">{icon}</span>
      <div>
        <p className="font-kanit text-body-md font-semibold text-text-primary">
          {t(labelKey)}
        </p>
        <p className="text-[11px] text-text-muted">{t(`${labelKey}Sub`)}</p>
      </div>
    </div>
  );
}

function Toggle({
  enabled,
  onChange,
  label,
}: {
  enabled: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between font-sarabun text-body-md">
      <span className="text-text-secondary">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative flex h-5 w-10 items-center rounded-radius-full px-0.5 transition-colors ${
          enabled ? "bg-primary-dark" : "bg-surface-container"
        }`}
      >
        <span
          className={`h-3.5 w-3.5 rounded-radius-full bg-surface-card transition-transform ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

export default function WidgetPanel({
  snapToGrid,
  showGuides,
  onSnapToGridChange,
  onShowGuidesChange,
}: WidgetPanelProps) {
  const t = useTranslations("agency.customDashboard");

  return (
    <aside className="w-full shrink-0 border-t border-border-sidebar bg-surface-card p-6 md:w-[280px] md:border-l md:border-t-0 lg:sticky lg:top-0 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
      <h3 className="font-kanit text-label font-semibold uppercase tracking-wider text-text-primary">
        {t("widgetPanelTitle")}
      </h3>
      <p className="mb-6 mt-1 font-sarabun text-caption text-text-muted">
        {t("widgetPanelHint")}
      </p>

      <div className="space-y-3">
        {PALETTE_ITEMS.map((item) => (
          <DraggablePaletteItem
            key={item.type}
            type={item.type}
            icon={item.icon}
            labelKey={item.labelKey}
          />
        ))}
      </div>

      <div className="mt-8 border-t border-border-default/30 pt-6">
        <h4 className="mb-4 font-kanit text-[13px] font-semibold text-text-secondary">
          {t("gridSettings")}
        </h4>
        <div className="space-y-4">
          <Toggle
            enabled={snapToGrid}
            onChange={onSnapToGridChange}
            label={t("snapToGrid")}
          />
          <Toggle
            enabled={showGuides}
            onChange={onShowGuidesChange}
            label={t("showGuides")}
          />
        </div>
      </div>
    </aside>
  );
}

function BarIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M5 9.2h3V19H5V9.2zM10.6 5h2.8v14h-2.8V5zm5.6 8H19v6h-2.8v-6z" />
    </svg>
  );
}

function LineIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="m16 6 2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
    </svg>
  );
}

function PieIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M11 2v20c-5.07-.5-9-4.79-9-10s3.93-9.5 9-10zm2.03 0v8.99H22c-.47-4.74-4.24-8.52-8.97-8.99zm0 11.01V22c4.74-.47 8.5-4.25 8.97-8.99h-8.97z" />
    </svg>
  );
}

function StatIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M7 11h2v9H7v-9zm4-4h2v13h-2V7zm4 7h2v6h-2v-6z" />
    </svg>
  );
}
