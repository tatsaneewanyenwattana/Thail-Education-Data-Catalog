"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import AgencyCategoryTree from "@/components/dataset/AgencyCategoryTree";
import CategoryForm from "@/components/dataset/CategoryForm";
import DeleteCategoryModal from "@/components/dataset/DeleteCategoryModal";
import MoveCategoryModal from "@/components/dataset/MoveCategoryModal";
import { useAgencyCategoryTree } from "@/hooks/useAgencyCategories";
import { useMoveCategory } from "@/hooks/useMoveCategory";
import { useAuthStore } from "@/stores/useAuthStore";
import type { CategoryTreeNode } from "@/utils/categoryTreeUtils";

export default function AgencyCategoriesPage() {
  const t = useTranslations("agency.categories");
  const tDashboard = useTranslations("agency.dashboard");
  const locale = useLocale();
  const base = `/${locale}`;
  const { user } = useAuthStore();

  const [activeLevel, setActiveLevel] = useState<number>(1);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingCategory, setEditingCategory] =
    useState<CategoryTreeNode | null>(null);
  const [parentForCreate, setParentForCreate] =
    useState<CategoryTreeNode | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryTreeNode | null>(
    null
  );
  const [deleteDisplayName, setDeleteDisplayName] = useState("");
  const [toastError, setToastError] = useState<string | null>(null);
  const [moveTarget, setMoveTarget] = useState<CategoryTreeNode | null>(null);

  const { data, isLoading, isError } = useAgencyCategoryTree();
  const moveMutation = useMoveCategory();
  const tree = data?.tree ?? [];
  const lastUpdatedAt = data?.lastUpdatedAt ?? null;

  const totalCategories = countNodes(tree);
  const totalDatasets = sumDatasets(tree);

  function getMaxLevel(nodes: CategoryTreeNode[]): number {
    let max = 1;
    for (const node of nodes) {
      if (node.level > max) max = node.level;
      if (node.children.length > 0) {
        const childMax = getMaxLevel(node.children);
        if (childMax > max) max = childMax;
      }
    }
    return max;
  }
  const maxLevel = tree.length > 0 ? getMaxLevel(tree) : 2;

  const openCreateRoot = () => {
    setFormMode("create");
    setEditingCategory(null);
    setParentForCreate(null);
    setFormOpen(true);
    setToastError(null);
  };

  const openCreateChild = (parent: CategoryTreeNode) => {
    setFormMode("create");
    setEditingCategory(null);
    setParentForCreate(parent);
    setFormOpen(true);
    setToastError(null);
  };

  const openEditForm = (category: CategoryTreeNode) => {
    setFormMode("edit");
    setEditingCategory(category);
    setParentForCreate(null);
    setFormOpen(true);
    setToastError(null);
  };

  const handleDeleteRequest = (
    category: CategoryTreeNode,
    displayName: string
  ) => {
    setDeleteTarget(category);
    setDeleteDisplayName(displayName);
    setToastError(null);
  };

  return (
    <div className="space-y-6">
      <header
        className="relative overflow-hidden rounded-2xl p-6 lg:p-7"
        style={{ background: "linear-gradient(135deg, #01579b 0%, #0277bd 60%, #0288d1 100%)" }}
      >
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-kanit text-xl font-bold text-white">
              {t("title")}
            </h1>
            <p className="mt-1 font-sarabun text-sm text-white/70">
              {t("subtitle", {
                agency: user?.agency_name ?? tDashboard("agencyFallback"),
              })}
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateRoot}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-2 font-sarabun text-label font-medium text-[#01579b] shadow-sm transition-all hover:bg-white/90 active:scale-[0.97]"
          >
            <PlusIcon />
            {t("addRoot")}
          </button>
        </div>
        <div className="absolute -right-5 -top-5 h-28 w-28 rounded-full bg-white/[0.06]" />
        <div className="absolute right-16 -bottom-8 h-20 w-20 rounded-full bg-white/[0.04]" />
      </header>

      {/* Summary cards */}
      {!isLoading && tree.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            icon={<GridIcon />}
            iconBg="bg-[#e1f5fe]"
            iconColor="text-[#039be5]"
            label={t("totalCategories")}
            value={t("categoryCount", { count: totalCategories })}
            waveColor="rgba(3,155,229,0.07)"
          />
          <SummaryCard
            icon={<DataIcon />}
            iconBg="bg-[#e8f5e9]"
            iconColor="text-[#43a047]"
            label={t("totalDatasetsInCategory")}
            value={t("datasetCountLabel", { count: totalDatasets })}
            waveColor="rgba(67,160,71,0.07)"
          />
          <SummaryCard
            icon={<ClockIcon />}
            iconBg="bg-[#fff3e0]"
            iconColor="text-[#f57c00]"
            label={t("lastUpdated")}
            value={formatRelativeTime(lastUpdatedAt, t)}
            waveColor="rgba(245,124,0,0.07)"
          />
        </div>
      )}

      {/* Level tabs */}
      <div className="flex items-center gap-2">
        {Array.from({ length: maxLevel }, (_, i) => i + 1).map((lvl) => (
          <button
            key={lvl}
            type="button"
            onClick={() => setActiveLevel(lvl)}
            className={`rounded-t-lg border-b-2 px-5 py-2.5 font-sarabun text-label font-medium transition-all ${
              activeLevel === lvl
                ? "border-b-[#01579b] text-[#01579b]"
                : "border-b-transparent text-text-muted hover:border-b-border-default hover:text-text-secondary"
            }`}
          >
            {t("levelTab", { level: lvl })}
          </button>
        ))}
      </div>

      {toastError && (
        <div
          className="rounded-xl border border-status-error bg-status-error-bg px-4 py-3 font-sarabun text-label text-status-error"
          role="alert"
        >
          {toastError}
        </div>
      )}

      {isError && (
        <div className="rounded-2xl border border-status-error bg-status-error-bg px-6 py-4 font-sarabun text-label text-status-error">
          {t("loadError")}
        </div>
      )}

      <AgencyCategoryTree
        nodes={tree}
        isLoading={isLoading}
        onAddRoot={openCreateRoot}
        onAddChild={openCreateChild}
        onEdit={openEditForm}
        onDelete={handleDeleteRequest}
        onMove={(node) => { setMoveTarget(node); setToastError(null); }}
        filterLevel={activeLevel}
      />

      <CategoryForm
        open={formOpen}
        mode={formMode}
        category={editingCategory}
        parent={parentForCreate}
        onClose={() => {
          setFormOpen(false);
          setEditingCategory(null);
          setParentForCreate(null);
        }}
        onError={(message) => setToastError(message)}
      />

      <DeleteCategoryModal
        open={Boolean(deleteTarget)}
        category={deleteTarget}
        displayName={deleteDisplayName}
        onClose={() => {
          setDeleteTarget(null);
          setDeleteDisplayName("");
        }}
        onError={(message) => setToastError(message)}
      />

      {moveTarget && (
        <MoveCategoryModal
          node={moveTarget}
          allNodes={tree}
          isLoading={moveMutation.isPending}
          onCancel={() => setMoveTarget(null)}
          onConfirm={(targetParentId) => {
            moveMutation.mutate(
              { id: moveTarget.id, parentId: targetParentId },
              {
                onSuccess: () => setMoveTarget(null),
                onError: () => setToastError(t("moveCategoryError")),
              }
            );
          }}
        />
      )}
    </div>
  );
}

function formatRelativeTime(isoDate: string | null, t: ReturnType<typeof useTranslations>): string {
  if (!isoDate) return "-";
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t("timeJustNow");
  if (mins < 60) return t("timeMinutesAgo", { mins });
  const hours = Math.floor(mins / 60);
  if (hours < 24) return t("timeHoursAgo", { hours });
  const days = Math.floor(hours / 24);
  return t("timeDaysAgo", { days });
}

function countNodes(nodes: CategoryTreeNode[]): number {
  let count = 0;
  for (const node of nodes) {
    count += 1;
    count += countNodes(node.children);
  }
  return count;
}

function sumDatasets(nodes: CategoryTreeNode[]): number {
  let total = 0;
  for (const node of nodes) {
    total += node.datasetCount;
    total += sumDatasets(node.children);
  }
  return total;
}

function SummaryCard({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  waveColor = "rgba(3,155,229,0.08)",
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  waveColor?: string;
}) {
  return (
    <div className="relative flex items-center gap-4 overflow-hidden rounded-2xl border border-border-default/60 bg-surface-card px-6 py-10 shadow-md">
      <div
        className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full ${iconBg} ${iconColor}`}
      >
        {icon}
      </div>
      <div className="relative z-10">
        <p className="font-sarabun text-caption text-text-muted">{label}</p>
        <p className="font-kanit text-heading-3-mobile font-bold text-text-primary">
          {value}
        </p>
      </div>
      <svg className="absolute bottom-0 left-0 w-full pointer-events-none" viewBox="0 0 400 60" preserveAspectRatio="none" style={{ height: "40%" }}>
        <path d="M0,35 C80,10 150,50 250,30 C320,15 370,40 400,25 L400,60 L0,60 Z" fill={waveColor} />
        <path d="M0,45 C100,25 200,55 300,35 C360,25 390,45 400,40 L400,60 L0,60 Z" fill={waveColor} />
      </svg>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z" />
    </svg>
  );
}

function DataIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H5v-2h7v2zm7-4H5v-2h14v2zm0-4H5V7h14v2z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
    </svg>
  );
}
