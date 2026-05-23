"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTranslations } from "next-intl";
import type { DashboardGridWidget, DashboardWidgetType } from "@/data/mockData";
import BarChartWidget from "./widgets/BarChartWidget";
import LineChartWidget from "./widgets/LineChartWidget";
import PieChartWidget from "./widgets/PieChartWidget";
import StatWidget from "./widgets/StatWidget";

type DashboardWidgetProps = {
  widget: DashboardGridWidget;
  onRemove: (id: string) => void;
};

function widgetTitleKey(type: DashboardWidgetType): string {
  switch (type) {
    case "bar":
      return "barTitle";
    case "line":
      return "lineTitle";
    case "pie":
      return "pieTitle";
    case "stat":
      return "statTitle";
  }
}

function WidgetContent({ type }: { type: DashboardWidgetType }) {
  switch (type) {
    case "bar":
      return <BarChartWidget />;
    case "line":
      return <LineChartWidget />;
    case "pie":
      return <PieChartWidget />;
    case "stat":
      return <StatWidget />;
  }
}

const colSpanClass: Record<1 | 2 | 3, string> = {
  1: "lg:col-span-1",
  2: "lg:col-span-2",
  3: "lg:col-span-3",
};

export default function DashboardWidget({ widget, onRemove }: DashboardWidgetProps) {
  const t = useTranslations("agency.customDashboard.widgets");
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${colSpanClass[widget.colSpan]} ${
        isDragging ? "z-10 opacity-60" : ""
      }`}
    >
      <article className="overflow-hidden rounded-radius-lg border border-border-default bg-surface-card shadow-level-1 transition-shadow hover:shadow-level-2">
        <header className="flex items-center justify-between border-b border-border-default/30 bg-surface-container/50 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              className="cursor-grab touch-none text-text-muted hover:text-primary-dark active:cursor-grabbing"
              aria-label={t("remove")}
              {...attributes}
              {...listeners}
            >
              <DragIcon />
            </button>
            <h3 className="truncate font-kanit text-body-md font-semibold text-text-primary">
              {t(widgetTitleKey(widget.type))}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onRemove(widget.id)}
            className="shrink-0 text-text-muted transition-colors hover:text-status-error"
            aria-label={t("remove")}
          >
            <CloseIcon />
          </button>
        </header>
        <div className="p-4 md:p-6">
          <WidgetContent type={widget.type} />
        </div>
      </article>
    </div>
  );
}

function DragIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm10-8c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2 2zM3 10c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2 2zm8-8c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2 2zm0 16c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2 2z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.3 5.71 12 12.41 5.7 5.71 4.29 7.12 10.59 13.41 4.3 19.71 5.71 21.12 12 14.82 18.29 21.12 19.7 19.71 13.41 13.41 19.7 7.12 18.3 5.71Z" />
    </svg>
  );
}
