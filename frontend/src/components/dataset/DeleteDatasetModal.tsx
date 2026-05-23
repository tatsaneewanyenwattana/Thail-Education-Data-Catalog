"use client";

import { useTranslations } from "next-intl";
import type { AgencyDatasetRow } from "@/data/mockData";
import { useDeleteDataset } from "@/hooks/useDeleteDataset";

type DeleteDatasetModalProps = {
  dataset: AgencyDatasetRow | null;
  locale: string;
  title: string;
  open: boolean;
  onClose: () => void;
  onError: (message: string) => void;
};

export default function DeleteDatasetModal({
  dataset,
  title,
  open,
  onClose,
  onError,
}: DeleteDatasetModalProps) {
  const t = useTranslations("agency.datasets");
  const deleteMutation = useDeleteDataset();

  if (!open || !dataset) {
    return null;
  }

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(dataset.id);
      onClose();
    } catch {
      onError(t("deleteError"));
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dataset-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-surface-navy/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label={t("cancel")}
      />
      <div className="relative w-full max-w-md rounded-radius-lg bg-surface-card p-6 shadow-level-3">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-text-muted transition-colors hover:text-text-primary"
          aria-label={t("cancel")}
        >
          <CloseIcon />
        </button>
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-radius-full bg-status-error-bg">
            <WarningIcon />
          </div>
          <h2
            id="delete-dataset-title"
            className="mb-2 font-kanit text-heading-3 font-bold text-text-primary"
          >
            {t("deleteConfirmTitle")}
          </h2>
          <p className="mb-1 font-sarabun text-body-md text-text-secondary">
            {t("deleteConfirmMsg", { title })}
          </p>
          <p className="mb-8 font-sarabun text-label italic text-status-error">
            {t("deleteWarning")}
          </p>
          <div className="flex w-full gap-4">
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
          </div>
        </div>
      </div>
    </div>
  );
}

function WarningIcon() {
  return (
    <svg
      className="h-8 w-8 text-status-error"
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
