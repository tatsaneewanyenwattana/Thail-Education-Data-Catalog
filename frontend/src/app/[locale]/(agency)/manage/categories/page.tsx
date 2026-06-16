"use client";

import { useTranslations } from "next-intl";
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
  const { user } = useAuthStore();

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingCategory, setEditingCategory] = useState<CategoryTreeNode | null>(
    null
  );
  const [parentForCreate, setParentForCreate] = useState<CategoryTreeNode | null>(
    null
  );
  const [deleteTarget, setDeleteTarget] = useState<CategoryTreeNode | null>(null);
  const [deleteDisplayName, setDeleteDisplayName] = useState("");
  const [toastError, setToastError] = useState<string | null>(null);

  const { data, isLoading, isError } = useAgencyCategoryTree();
  const tree = data?.tree ?? [];

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
          onClick={openCreateRoot}
          className="inline-flex items-center justify-center gap-2 rounded-radius-lg bg-primary px-6 py-2.5 font-sarabun text-label font-bold text-surface-card shadow-level-1 transition-opacity hover:bg-primary-hover"
        >
          <PlusIcon />
          {t("addRoot")}
        </button>
      </header>

      {toastError && (
        <div
          className="rounded-radius-md border border-status-error bg-status-error-bg px-4 py-3 font-sarabun text-label text-status-error"
          role="alert"
        >
          {toastError}
        </div>
      )}

      {isError && (
        <div className="rounded-radius-lg border border-status-error bg-status-error-bg px-6 py-4 font-sarabun text-label text-status-error">
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

function PlusIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
  );
}
