"use client";

import { useTranslations } from "next-intl";
import type { AdminUser } from "@/data/mockData";
import { useDeleteUser } from "@/hooks/useDeleteUser";

type DeleteUserModalProps = {
  user: AdminUser | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
};

export default function DeleteUserModal({
  user,
  open,
  onClose,
  onSuccess,
  onError,
}: DeleteUserModalProps) {
  const t = useTranslations("admin.users");
  const deleteMutation = useDeleteUser();

  if (!open || !user) {
    return null;
  }

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(user.id);
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
      aria-labelledby="delete-user-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-surface-overlay backdrop-blur-sm"
        onClick={onClose}
        aria-label={t("cancel")}
      />
      <div className="relative w-full max-w-md rounded-radius-lg bg-surface-card p-6 shadow-level-3">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-radius-full bg-status-error-bg">
            <TrashIcon />
          </div>
          <h2
            id="delete-user-title"
            className="mb-2 font-kanit text-heading-3 font-semibold text-text-primary"
          >
            {t("deleteTitle")}
          </h2>
          <p className="mb-2 font-sarabun text-body-md text-text-secondary">
            {t("deleteMsg", { email: user.email })}
          </p>
          <p className="mb-8 font-sarabun text-[13px] font-medium text-status-error">
            {t("deleteWarning")}
          </p>

          <div className="flex w-full gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={deleteMutation.isPending}
              className="flex-1 rounded-radius-lg border border-border-default py-3 font-sarabun text-label font-medium text-text-secondary hover:bg-surface-container disabled:opacity-50"
            >
              {t("cancel")}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="flex-1 rounded-radius-lg bg-status-error py-3 font-sarabun text-label font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {deleteMutation.isPending ? t("deleting") : t("delete")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrashIcon() {
  return (
    <svg className="h-8 w-8 text-status-error" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v10h-2V9zm4 0h2v10h-2V9zM6 9h2v10H6V9z" />
    </svg>
  );
}

