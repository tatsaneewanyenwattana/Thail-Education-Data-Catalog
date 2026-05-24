"use client";

import { useTranslations } from "next-intl";
import type { Announcement } from "@/data/mockData";
import { useDeleteAnnouncement } from "@/hooks/useDeleteAnnouncement";

type DeleteAnnouncementModalProps = {
  open: boolean;
  announcement: Announcement | null;
  onClose: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
};

export default function DeleteAnnouncementModal({
  open,
  announcement,
  onClose,
  onSuccess,
  onError,
}: DeleteAnnouncementModalProps) {
  const t = useTranslations("admin.announcements");
  const deleteMutation = useDeleteAnnouncement();

  if (!open || !announcement) {
    return null;
  }

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(announcement.id);
      onClose();
      onSuccess();
    } catch {
      onError(t("deleteError"));
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-announcement-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-surface-navy/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label={t("cancel")}
      />
      <div className="relative w-full max-w-[400px] overflow-hidden rounded-radius-lg bg-surface-card shadow-level-3">
        <div className="space-y-4 p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-radius-full bg-status-error-bg text-status-error">
            <WarningIcon />
          </div>
          <h2
            id="delete-announcement-title"
            className="font-kanit text-heading-3 font-semibold text-text-primary"
          >
            {t("deleteTitle")}
          </h2>
          <p className="font-sarabun text-body-md text-text-secondary">
            {t("deleteMsg", { title: announcement.title })}
          </p>
        </div>
        <div className="flex justify-center gap-3 bg-surface-container-low px-8 py-6">
          <button
            type="button"
            onClick={onClose}
            disabled={deleteMutation.isPending}
            className="flex-1 rounded-radius-sm border border-border-default py-2.5 font-kanit text-label font-medium text-text-secondary transition-colors hover:bg-surface-container disabled:opacity-50"
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="flex-1 rounded-radius-sm bg-status-error py-2.5 font-kanit text-label font-medium text-surface-card transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {deleteMutation.isPending ? t("deleting") : t("confirmDelete")}
          </button>
        </div>
      </div>
    </div>
  );
}

function WarningIcon() {
  return (
    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2V9h2v5z" />
    </svg>
  );
}
