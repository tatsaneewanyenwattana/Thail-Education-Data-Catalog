"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import AnnouncementForm from "@/components/admin/AnnouncementForm";
import AnnouncementTable from "@/components/admin/AnnouncementTable";
import DeleteAnnouncementModal from "@/components/admin/DeleteAnnouncementModal";
import type { Announcement } from "@/data/mockData";
import { useAdminAnnouncements } from "@/hooks/useAdminAnnouncements";

export default function AdminAnnouncementsPage() {
  const t = useTranslations("admin.announcements");

  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<Announcement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);

  const { data, isLoading } = useAdminAnnouncements({ page });

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastError(null);
    window.setTimeout(() => setToastMessage(null), 3000);
  };

  const showError = (message: string) => {
    setToastError(message);
    setToastMessage(null);
    window.setTimeout(() => setToastError(null), 3000);
  };

  const openCreateForm = () => {
    setFormMode("create");
    setEditingAnnouncement(null);
    setFormOpen(true);
  };

  const openEditForm = (announcement: Announcement) => {
    setFormMode("edit");
    setEditingAnnouncement(announcement);
    setFormOpen(true);
  };

  return (
    <div className="mx-auto max-w-container-max space-y-6 pb-24">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-kanit text-[28px] font-bold leading-tight text-text-primary">
            {t("title")}
          </h1>
          <p className="mt-1 font-sarabun text-body-md text-text-muted">
            {t("subtitle")}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          className="flex items-center justify-center gap-2 rounded-radius-lg bg-primary px-6 py-2.5 font-kanit text-label font-semibold text-surface-card shadow-level-1 transition-all hover:bg-primary-hover active:scale-95"
        >
          <PlusIcon />
          {t("add")}
        </button>
      </header>

      <AnnouncementTable
        announcements={data?.data ?? []}
        total={data?.total ?? 0}
        page={data?.page ?? 1}
        pageSize={data?.pageSize ?? 10}
        totalPages={data?.totalPages ?? 1}
        isLoading={isLoading}
        onPageChange={setPage}
        onEdit={openEditForm}
        onDelete={setDeleteTarget}
        onError={showError}
      />

      <AnnouncementForm
        open={formOpen}
        mode={formMode}
        announcement={editingAnnouncement}
        onClose={() => setFormOpen(false)}
        onSuccess={() =>
          showToast(
            formMode === "create" ? t("createSuccess") : t("updateSuccess")
          )
        }
        onError={showError}
      />

      <DeleteAnnouncementModal
        open={Boolean(deleteTarget)}
        announcement={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onSuccess={() => showToast(t("deleteSuccess"))}
        onError={showError}
      />

      {toastMessage && <Toast message={toastMessage} variant="success" />}
      {toastError && <Toast message={toastError} variant="error" />}
    </div>
  );
}

function Toast({
  message,
  variant,
}: {
  message: string;
  variant: "success" | "error";
}) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-[110] rounded-radius-lg px-5 py-3 font-sarabun text-body-md shadow-level-2 ${
        variant === "success"
          ? "bg-status-published text-surface-card"
          : "bg-status-error text-surface-card"
      }`}
      role="status"
    >
      {message}
    </div>
  );
}

function PlusIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
    </svg>
  );
}
