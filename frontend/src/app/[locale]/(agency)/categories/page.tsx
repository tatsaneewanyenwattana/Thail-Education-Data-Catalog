"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import CategoryForm from "@/components/dataset/CategoryForm";
import CategoryTable from "@/components/dataset/CategoryTable";
import DeleteCategoryModal from "@/components/dataset/DeleteCategoryModal";
import type { AgencyCategoryL1, AgencyCategoryL2 } from "@/data/mockData";
import { getAgencyCategoriesL1Mock } from "@/data/mockData";
import { useAuthStore } from "@/stores/useAuthStore";

type CategoryTab = "level1" | "level2";

export default function AgencyCategoriesPage() {
  const t = useTranslations("agency.categories");
  const tDashboard = useTranslations("agency.dashboard");
  const { user } = useAuthStore();

  const [tab, setTab] = useState<CategoryTab>("level1");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingCategory, setEditingCategory] = useState<
    AgencyCategoryL1 | AgencyCategoryL2 | null
  >(null);
  const [deleteTarget, setDeleteTarget] = useState<
    AgencyCategoryL1 | AgencyCategoryL2 | null
  >(null);
  const [deleteDisplayName, setDeleteDisplayName] = useState("");
  const [toastError, setToastError] = useState<string | null>(null);

  const level = tab === "level1" ? 1 : 2;
  const parentOptions = getAgencyCategoriesL1Mock();

  useEffect(() => {
    setPage(1);
  }, [tab]);

  const openCreateForm = () => {
    setFormMode("create");
    setEditingCategory(null);
    setFormOpen(true);
    setToastError(null);
  };

  const openEditForm = (category: AgencyCategoryL1 | AgencyCategoryL2) => {
    setFormMode("edit");
    setEditingCategory(category);
    setFormOpen(true);
    setToastError(null);
  };

  const handleDeleteRequest = (
    category: AgencyCategoryL1 | AgencyCategoryL2,
    displayName: string
  ) => {
    setDeleteTarget(category);
    setDeleteDisplayName(displayName);
    setToastError(null);
  };

  const tabs: { id: CategoryTab; label: string }[] = [
    { id: "level1", label: t("tabL1") },
    { id: "level2", label: t("tabL2") },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 border-b border-border-default/20 pb-6 md:flex-row md:items-end">
        <div>
          <h1 className="font-kanit text-[28px] font-bold leading-tight text-text-primary">
            {t("title")}
          </h1>
          <p className="mt-1 font-sarabun text-label text-text-muted">
            {t("subtitle", {
              agency: user?.agency_name ?? tDashboard("agencyFallback"),
            })}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center justify-center gap-2 rounded-radius-lg bg-primary px-6 py-2.5 font-sarabun text-label font-bold text-surface-card shadow-level-1 transition-opacity hover:bg-primary-hover"
        >
          <PlusIcon />
          {tab === "level1" ? t("addL1") : t("addL2")}
        </button>
      </header>

      <div className="flex gap-8 border-b border-border-default">
        {tabs.map((item) => {
          const isActive = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`border-b-2 pb-3 font-kanit text-label font-bold transition-colors ${
                isActive
                  ? "border-primary-dark text-primary-dark"
                  : "border-transparent text-text-muted hover:text-primary-dark"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {toastError && (
        <div
          className="rounded-radius-md border border-status-error bg-status-error-bg px-4 py-3 font-sarabun text-label text-status-error"
          role="alert"
        >
          {toastError}
        </div>
      )}

      <CategoryTable
        tab={tab}
        page={page}
        onPageChange={setPage}
        onEdit={openEditForm}
        onDelete={handleDeleteRequest}
      />

      <CategoryForm
        open={formOpen}
        level={level}
        mode={formMode}
        category={editingCategory}
        parentOptions={parentOptions}
        onClose={() => {
          setFormOpen(false);
          setEditingCategory(null);
        }}
        onError={(message) => setToastError(message)}
      />

      <DeleteCategoryModal
        open={Boolean(deleteTarget)}
        level={level}
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

function PlusIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
  );
}
