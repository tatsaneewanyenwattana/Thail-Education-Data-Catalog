"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import AgencyCategoryTree from "@/components/dataset/AgencyCategoryTree";
import CategoryForm from "@/components/dataset/CategoryForm";
import DeleteCategoryModal from "@/components/dataset/DeleteCategoryModal";
import { useAgencyCategoryTree } from "@/hooks/useAgencyCategories";
import { useAuthStore } from "@/stores/useAuthStore";
import type { CategoryTreeNode } from "@/utils/categoryTreeUtils";

export default function AgencyCategoriesPage() {
  const t = useTranslations("agency.categories");
  const tDashboard = useTranslations("agency.dashboard");
  const locale = useLocale();
  const base = `/${locale}`;
  const { user } = useAuthStore();

  const [activeLevel, setActiveLevel] = useState<1 | 2>(1);
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

  const { data, isLoading, isError } = useAgencyCategoryTree();
  const tree = data?.tree ?? [];
  const lastUpdatedAt = data?.lastUpdatedAt ?? null;

  const totalCategories = countNodes(tree);
  const totalDatasets = sumDatasets(tree);

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
      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-2 font-sarabun text-caption uppercase tracking-wider text-text-muted">
        <Link href={`${base}/dashboard`} className="hover:text-primary-dark">
          หน้าหลัก
        </Link>
        <span>›</span>
        <span className="font-semibold text-text-primary">จัดการหมวดหมู่</span>
      </nav>

      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <h1 className="font-kanit text-[28px] font-bold text-text-primary">
            {t("title")}
          </h1>
          <p className="mt-1 font-sarabun text-body-md text-text-muted">
            {t("subtitle", {
              agency: user?.agency_name ?? tDashboard("agencyFallback"),
            })}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateRoot}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-dark px-6 py-2.5 font-sarabun text-label font-bold text-white shadow-level-1 transition-opacity hover:opacity-90"
        >
          <PlusIcon />
          {t("addRoot")}
        </button>
      </header>

      {/* Summary cards */}
      {!isLoading && tree.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            icon={<GridIcon />}
            iconBg="bg-primary-light"
            iconColor="text-primary-dark"
            label="หมวดหมู่ทั้งหมด"
            value={`${totalCategories} หมวดหมู่`}
          />
          <SummaryCard
            icon={<DataIcon />}
            iconBg="bg-[#e8f5e9]"
            iconColor="text-[#43a047]"
            label="ชุดข้อมูลรวม"
            value={`${totalDatasets} ชุดข้อมูล`}
          />
          <SummaryCard
            icon={<ClockIcon />}
            iconBg="bg-[#fff3e0]"
            iconColor="text-[#f57c00]"
            label="อัปเดตล่าสุด"
            value={formatRelativeTime(lastUpdatedAt)}
          />
        </div>
      )}

      {/* Level tabs */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveLevel(1)}
          className={`rounded-t-lg border-b-2 px-5 py-2.5 font-sarabun text-label font-medium transition-all ${
            activeLevel === 1
              ? "border-b-primary-dark text-primary-dark"
              : "border-b-transparent text-text-muted hover:border-b-border-default hover:text-text-secondary"
          }`}
        >
          หมวดระดับ 1
        </button>
        <button
          type="button"
          onClick={() => setActiveLevel(2)}
          className={`rounded-t-lg border-b-2 px-5 py-2.5 font-sarabun text-label font-medium transition-all ${
            activeLevel === 2
              ? "border-b-primary-dark text-primary-dark"
              : "border-b-transparent text-text-muted hover:border-b-border-default hover:text-text-secondary"
          }`}
        >
          หมวดระดับ 2
        </button>
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
    </div>
  );
}

function formatRelativeTime(isoDate: string | null): string {
  if (!isoDate) return "-";
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "เมื่อสักครู่";
  if (mins < 60) return `${mins} นาทีที่แล้ว`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ชม. ที่ผ่านมา`;
  const days = Math.floor(hours / 24);
  return `${days} วันที่แล้ว`;
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
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border-default/60 bg-surface-card px-6 py-5 shadow-level-1">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-full ${iconBg} ${iconColor}`}
      >
        {icon}
      </div>
      <div>
        <p className="font-sarabun text-caption text-text-muted">{label}</p>
        <p className="font-kanit text-heading-3-mobile font-bold text-text-primary">
          {value}
        </p>
      </div>
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
