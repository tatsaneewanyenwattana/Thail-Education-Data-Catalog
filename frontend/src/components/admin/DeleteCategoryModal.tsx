"use client";

import { useTranslations } from "next-intl";
import type { AdminCategory, AdminSubcategory } from "@/data/mockData";
import { useDeleteCategory } from "@/hooks/useAdminCategories";

export type DeleteCategoryTarget =
  | { level: 1; category: AdminCategory; displayName: string }
  | { level: 2; category: AdminSubcategory; displayName: string };

type DeleteCategoryModalProps = {
  open: boolean;
  target: DeleteCategoryTarget | null;
  onClose: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
};

function getDatasetCount(target: DeleteCategoryTarget): number {
  if (target.level === 1) {
    return target.category.datasetCount;
  }
  return target.category.datasetCount;
}

export default function DeleteCategoryModal({
  open,
  target,
  onClose,
  onSuccess,
  onError,
}: DeleteCategoryModalProps) {
  const t = useTranslations("admin.categories");
  const deleteMutation = useDeleteCategory();

  if (!open || !target) {
    return null;
  }

  const datasetCount = getDatasetCount(target);
  const hasDatasets = datasetCount > 0;

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync({
        id: target.category.id,
        level: target.level,
      });
      onSuccess();
      onClose();
    } catch {
      onError(t("deleteError"));
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-delete-category-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-surface-navy/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label={hasDatasets ? t("close") : t("cancel")}
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-radius-lg bg-surface-card p-8 shadow-level-3">
        <div className="flex flex-col items-center text-center">
          <div
            className={`mb-6 flex h-16 w-16 items-center justify-center rounded-radius-full ${
              hasDatasets ? "bg-status-error-bg" : "bg-status-error-bg"
            }`}
          >
            <WarningIcon />
          </div>
          <h2
            id="admin-delete-category-title"
            className="mb-2 font-kanit text-heading-3 font-bold text-text-primary"
          >
            {hasDatasets ? t("deleteBlockedTitle") : t("deleteTitle")}
          </h2>
          <p className="mb-6 px-4 font-sarabun text-body-md text-text-secondary">
            {hasDatasets
              ? t("deleteErrorDetail", {
                  name: target.displayName,
                  count: datasetCount,
                })
              : t("deleteMsg", { name: target.displayName })}
          </p>
          <div className="flex w-full flex-col gap-3">
            {hasDatasets ? (
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-radius-lg bg-surface-container-highest py-3 font-kanit text-label font-bold text-text-primary transition-colors hover:bg-surface-container"
              >
                {t("close")}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={deleteMutation.isPending}
                  className="w-full rounded-radius-lg border border-border-default py-3 font-kanit text-label font-medium text-text-secondary transition-colors hover:bg-surface-container disabled:opacity-50"
                >
                  {t("cancel")}
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="w-full rounded-radius-lg bg-status-error py-3 font-kanit text-label font-medium text-surface-card transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {deleteMutation.isPending ? t("deleting") : t("confirmDelete")}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function WarningIcon() {
  return (
    <svg
      className="h-10 w-10 text-status-error"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2V9h2v5z" />
    </svg>
  );
}
