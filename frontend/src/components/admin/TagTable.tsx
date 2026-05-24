"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import type { AdminTag } from "@/data/mockData";
import { useDeleteTag } from "@/hooks/useAdminTags";

type TagTableProps = {
  tags: AdminTag[];
  isLoading?: boolean;
  onEdit: (tag: AdminTag) => void;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
};

function formatCount(value: number, locale: string): string {
  return value.toLocaleString(locale === "th" ? "th-TH" : "en-US");
}

export default function TagTable({
  tags,
  isLoading,
  onEdit,
  onError,
  onSuccess,
}: TagTableProps) {
  const t = useTranslations("admin.tags");
  const locale = useLocale();
  const deleteMutation = useDeleteTag();
  const [deleteTarget, setDeleteTarget] = useState<AdminTag | null>(null);

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-radius-lg border border-border-default bg-surface-card shadow-level-1">
        <div className="animate-pulse space-y-3 p-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-10 rounded-radius-sm bg-surface-container" />
          ))}
        </div>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      onSuccess(t("deleteSuccess"));
      setDeleteTarget(null);
    } catch (error) {
      if (error instanceof Error && error.message === "TAG_HAS_DATASETS") {
        onError(t("deleteError"));
      } else {
        onError(t("deleteError"));
      }
      setDeleteTarget(null);
    }
  };

  return (
    <>
      <div className="overflow-hidden rounded-radius-lg border border-border-default bg-surface-card shadow-level-1">
        <table className="w-full text-left">
          <thead className="border-b border-border-default/30 bg-surface-container-low">
            <tr>
              <th className="px-6 py-4 font-kanit text-[13px] font-bold uppercase text-text-muted">
                {t("colName")}
              </th>
              <th className="px-6 py-4 text-center font-kanit text-[13px] font-bold uppercase text-text-muted">
                {t("colDatasets")}
              </th>
              <th className="px-6 py-4 text-right font-kanit text-[13px] font-bold uppercase text-text-muted">
                {t("colAction")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default/20">
            {tags.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-6 py-12 text-center font-sarabun text-body-md text-text-muted"
                >
                  {t("empty")}
                </td>
              </tr>
            ) : (
              tags.map((tag) => (
                <tr
                  key={tag.id}
                  className="transition-colors hover:bg-surface-container-lowest"
                >
                  <td className="px-6 py-4">
                    <span className="rounded-radius-sm bg-surface-container px-2 py-1 font-sarabun text-body-sm font-medium text-text-primary">
                      #{tag.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-sarabun text-body-md font-medium text-text-primary">
                    {formatCount(tag.datasetCount, locale)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        aria-label={t("edit")}
                        onClick={() => onEdit(tag)}
                        className="rounded-radius-sm p-1 text-text-muted transition-colors hover:text-primary"
                      >
                        <EditIcon />
                      </button>
                      <button
                        type="button"
                        aria-label={t("delete")}
                        onClick={() => setDeleteTarget(tag)}
                        className="rounded-radius-sm p-1 text-text-muted transition-colors hover:text-status-error"
                      >
                        <DeleteIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {deleteTarget && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="absolute inset-0 bg-surface-navy/40 backdrop-blur-sm"
            onClick={() => setDeleteTarget(null)}
            aria-label={t("cancel")}
          />
          <div className="relative w-full max-w-md rounded-radius-lg bg-surface-card p-6 shadow-level-3">
            <h3 className="mb-2 font-kanit text-heading-3 font-bold text-text-primary">
              {deleteTarget.datasetCount > 0 ? t("deleteError") : t("deleteTitle")}
            </h3>
            <p className="mb-6 font-sarabun text-body-md text-text-secondary">
              {deleteTarget.datasetCount > 0
                ? t("deleteErrorDetail", { name: deleteTarget.name })
                : t("deleteMsg", { name: deleteTarget.name })}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-radius-sm border border-border-default py-2 font-kanit text-label font-medium text-text-secondary"
              >
                {deleteTarget.datasetCount > 0 ? t("close") : t("cancel")}
              </button>
              {deleteTarget.datasetCount === 0 && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="flex-1 rounded-radius-sm bg-status-error py-2 font-kanit text-label font-medium text-surface-card disabled:opacity-50"
                >
                  {deleteMutation.isPending ? t("deleting") : t("confirmDelete")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function EditIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
    </svg>
  );
}
