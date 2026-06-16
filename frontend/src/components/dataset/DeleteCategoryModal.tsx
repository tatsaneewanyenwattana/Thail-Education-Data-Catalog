"use client";

import { useTranslations } from "next-intl";
import { useDeleteCategory } from "@/hooks/useDeleteCategory";
import type { CategoryTreeNode } from "@/utils/categoryTreeUtils";

type DeleteCategoryModalProps = {
  open: boolean;
  category: CategoryTreeNode | null;
  displayName: string;
  onClose: () => void;
  onError: (message: string) => void;
};

export default function DeleteCategoryModal({
  open,
  category,
  displayName,
  onClose,
  onError,
}: DeleteCategoryModalProps) {
  const t = useTranslations("agency.categories");
  const deleteMutation = useDeleteCategory();

  if (!open || !category) {
    return null;
  }

  const hasDatasets = category.datasetCount > 0;
  const hasChildren = category.childCount > 0;
  const blocked = hasDatasets || hasChildren;

  const blockMessage = hasChildren
    ? t("deleteErrorChildren")
    : t("deleteError");

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync({ id: category.id });
      onClose();
    } catch (error) {
      const code =
        error instanceof Error && "code" in error
          ? (error as Error & { code?: string }).code
          : "";
      if (code === "CATEGORY_HAS_CHILDREN") {
        onError(t("deleteErrorChildren"));
      } else if (code === "CATEGORY_HAS_DATASETS") {
        onError(t("deleteError"));
      } else {
        onError(t("deleteErrorGeneric"));
      }
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-category-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-surface-navy/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label={blocked ? t("close") : t("cancel")}
      />
      <div className="relative w-full max-w-md rounded-radius-lg bg-surface-card p-6 shadow-level-3">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-text-muted transition-colors hover:text-text-primary"
          aria-label={blocked ? t("close") : t("cancel")}
        >
          <CloseIcon />
        </button>
        <div className="flex flex-col items-center text-center">
          <div
            className={`mb-4 flex h-16 w-16 items-center justify-center rounded-radius-full ${
              blocked ? "bg-status-warning-bg" : "bg-status-error-bg"
            }`}
          >
            <WarningIcon blocked={blocked} />
          </div>
          <h2
            id="delete-category-title"
            className="mb-2 font-kanit text-heading-3 font-bold text-text-primary"
          >
            {blocked ? blockMessage : t("deleteTitle")}
          </h2>
          <p className="mb-1 font-sarabun text-body-md text-text-secondary">
            {blocked
              ? blockMessage
              : t("deleteMsg", { name: displayName })}
          </p>
          {!blocked && (
            <p className="mb-8 font-sarabun text-label italic text-status-error">
              {t("deleteWarning")}
            </p>
          )}
          <div className="flex w-full gap-4">
            {blocked ? (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-radius-lg bg-primary py-3 font-sarabun text-label font-medium text-surface-card transition-opacity hover:opacity-90"
              >
                {t("close")}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={deleteMutation.isPending}
                  className="flex-1 rounded-radius-lg border border-border-default py-3 font-sarabun text-label font-medium text-text-secondary transition-colors hover:bg-surface-container disabled:opacity-50"
                >
                  {t("cancel")}
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="flex-1 rounded-radius-lg bg-status-error py-3 font-sarabun text-label font-medium text-surface-card transition-opacity hover:opacity-90 disabled:opacity-50"
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

function WarningIcon({ blocked }: { blocked: boolean }) {
  return (
    <svg
      className={`h-8 w-8 ${blocked ? "text-status-warning" : "text-status-error"}`}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2V9h2v5z" />
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
