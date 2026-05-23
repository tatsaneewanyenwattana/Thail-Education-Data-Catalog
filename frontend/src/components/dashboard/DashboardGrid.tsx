"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";
import {
  createDashboardWidgetId,
  defaultColSpanForWidgetType,
  type DashboardGridWidget,
  type DashboardWidgetType,
} from "@/data/mockData";
import DashboardWidget from "./DashboardWidget";

type DashboardGridProps = {
  widgets: DashboardGridWidget[];
  onWidgetsChange: (widgets: DashboardGridWidget[]) => void;
  showGuides: boolean;
};

function DroppableGrid({
  children,
  showGuides,
  isEmpty,
}: {
  children: ReactNode;
  showGuides: boolean;
  isEmpty: boolean;
}) {
  const t = useTranslations("agency.customDashboard");
  const { setNodeRef, isOver } = useDroppable({ id: "dashboard-grid" });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[600px] rounded-radius-lg border-2 border-dashed p-4 transition-colors ${
        showGuides
          ? "border-primary/40 bg-[repeating-linear-gradient(0deg,transparent,transparent_23px,rgba(0,107,95,0.06)_23px,rgba(0,107,95,0.06)_24px),repeating-linear-gradient(90deg,transparent,transparent_23px,rgba(0,107,95,0.06)_23px,rgba(0,107,95,0.06)_24px)]"
          : "border-border-default bg-surface-page"
      } ${isOver ? "border-primary bg-primary-light/30" : ""}`}
    >
      {isEmpty ? (
        <p className="flex min-h-[560px] items-center justify-center text-center font-sarabun text-body-md text-text-muted">
          {t("gridEmpty")}
        </p>
      ) : (
        children
      )}
    </div>
  );
}

export default function DashboardGrid({
  widgets,
  onWidgetsChange,
  showGuides,
}: DashboardGridProps) {
  const t = useTranslations("agency.customDashboard.palette");
  const [activePaletteType, setActivePaletteType] =
    useState<DashboardWidgetType | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleRemove = (id: string) => {
    onWidgetsChange(widgets.filter((w) => w.id !== id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActivePaletteType(null);

    const activeData = active.data.current as
      | { fromPalette?: boolean; type?: DashboardWidgetType }
      | undefined;

    if (activeData?.fromPalette && activeData.type) {
      if (over?.id === "dashboard-grid") {
        onWidgetsChange([
          ...widgets,
          {
            id: createDashboardWidgetId(),
            type: activeData.type,
            colSpan: defaultColSpanForWidgetType(activeData.type),
          },
        ]);
      }
      return;
    }

    if (over && active.id !== over.id) {
      const oldIndex = widgets.findIndex((w) => w.id === active.id);
      const newIndex = widgets.findIndex((w) => w.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        onWidgetsChange(arrayMove(widgets, oldIndex, newIndex));
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={(event) => {
        const data = event.active.data.current as
          | { fromPalette?: boolean; type?: DashboardWidgetType }
          | undefined;
        if (data?.fromPalette && data.type) {
          setActivePaletteType(data.type);
        }
      }}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActivePaletteType(null)}
    >
      <DroppableGrid showGuides={showGuides} isEmpty={widgets.length === 0}>
        {widgets.length > 0 && (
          <SortableContext items={widgets.map((w) => w.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {widgets.map((widget) => (
                <DashboardWidget
                  key={widget.id}
                  widget={widget}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          </SortableContext>
        )}
      </DroppableGrid>

      <DragOverlay>
        {activePaletteType ? (
          <div className="rounded-radius-lg border border-primary-dark bg-primary-light px-4 py-3 font-kanit text-label font-semibold text-primary-dark shadow-level-2">
            {t(activePaletteType)}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
