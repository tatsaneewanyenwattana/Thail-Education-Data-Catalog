"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import AdminStatsCard from "@/components/admin/AdminStatsCard";
import AnnouncementForm from "@/components/admin/AnnouncementForm";
import AnnouncementTable from "@/components/admin/AnnouncementTable";
import DeleteAnnouncementModal from "@/components/admin/DeleteAnnouncementModal";
import type { Announcement } from "@/data/mockData";
import { useAdminAnnouncements } from "@/hooks/useAdminAnnouncements";

export default function AdminAnnouncementsPage() {
  const t = useTranslations("admin.announcements");
  const locale = useLocale();
  const numberLocale = locale === "th" ? "th-TH" : "en-US";

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<Announcement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);

  const { data, isLoading } = useAdminAnnouncements({ page });

  const allAnnouncements = data?.data ?? [];
  const activeCount = allAnnouncements.filter((a) => a.isActive).length;
  const totalCount = data?.total ?? 0;

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
      {/* Stats Cards */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <AdminStatsCard
          label={t("activeAnnouncements")}
          value={`${activeCount.toLocaleString(numberLocale)} รายการ`}
          icon={<MegaphoneIcon />}
          iconClassName="bg-blue-50 text-blue-600"
          badge={
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-sarabun text-caption font-bold text-emerald-600">
              +12%
            </span>
          }
        />
        <AdminStatsCard
          label={t("scheduledReminders")}
          value={`0${totalCount > 9 ? totalCount - activeCount : 8} รายการ`}
          icon={<CalendarIcon />}
          iconClassName="bg-blue-50 text-blue-600"
          badge={
            <span className="rounded-full bg-blue-50 px-2.5 py-1 font-sarabun text-caption font-bold text-blue-600">
              {t("upcoming")}
            </span>
          }
        />
        <AdminStatsCard
          label={t("totalViews")}
          value={(12405).toLocaleString(numberLocale) + " ครั้ง"}
          icon={<EyeIcon />}
          iconClassName="bg-blue-50 text-blue-600"
          badge={
            <span className="rounded-full bg-blue-50 px-2.5 py-1 font-sarabun text-caption font-bold text-blue-600">
              {t("today")}
            </span>
          }
        />
      </section>

      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-4">
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
          className="inline-flex items-center gap-2 rounded-full bg-primary-dark px-6 py-2.5 font-sarabun text-label font-medium text-white shadow-md transition-all hover:bg-primary-hover hover:shadow-lg"
        >
          <PlusCircleIcon />
          {t("add")}
        </button>
      </header>

      {/* Search */}
      <section className="rounded-2xl border border-white/80 bg-white p-6 shadow-md">
        <div className="relative max-w-xl">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
            <SearchIcon />
          </span>
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="ค้นหาประกาศ..."
            className="h-11 w-full rounded-full border border-gray-200 bg-gray-50 pl-10 pr-4 font-sarabun text-body-md shadow-sm transition-all hover:border-gray-300 focus:border-primary-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-dark/20"
          />
        </div>
      </section>

      {/* Table */}
      <AnnouncementTable
        announcements={allAnnouncements}
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

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[110] rounded-2xl bg-primary-dark px-4 py-3 font-sarabun text-label text-white shadow-lg">
          {toastMessage}
        </div>
      )}
      {toastError && (
        <div className="fixed bottom-6 right-6 z-[110] rounded-2xl bg-status-error px-4 py-3 font-sarabun text-label text-white shadow-lg">
          {toastError}
        </div>
      )}
    </div>
  );
}

function MegaphoneIcon() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18 11v2h4v-2h-4zm-2 6.61c.96.71 2.21 1.65 3.2 2.39.4-.53.8-1.07 1.2-1.6-.99-.74-2.24-1.68-3.2-2.4-.4.54-.8 1.08-1.2 1.61zM20.4 5.6c-.4-.53-.8-1.07-1.2-1.6-.99.74-2.24 1.68-3.2 2.4.4.53.8 1.07 1.2 1.6.96-.72 2.21-1.65 3.2-2.4zM4 9c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h1l5 3V6L5 9H4zm11.5 3c0-1.33-.58-2.53-1.5-3.35v6.69c.92-.81 1.5-2.01 1.5-3.34z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
    </svg>
  );
}

function PlusCircleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}
