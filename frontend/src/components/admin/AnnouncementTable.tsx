"use client";

import { useLocale, useTranslations } from "next-intl";
import ToggleSwitch from "@/components/admin/ToggleSwitch";
import type { Announcement } from "@/data/mockData";
import { useToggleAnnouncement } from "@/hooks/useToggleAnnouncement";

type AnnouncementTableProps = {
  announcements: Announcement[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  onEdit: (announcement: Announcement) => void;
  onDelete: (announcement: Announcement) => void;
  onError: (message: string) => void;
};

function formatDate(date: string, locale: string): string {
  return new Date(date).toLocaleDateString(locale === "th" ? "th-TH" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AnnouncementTable({
  announcements,
  total,
  page,
  pageSize,
  totalPages,
  isLoading,
  onPageChange,
  onEdit,
  onDelete,
  onError,
}: AnnouncementTableProps) {
  const t = useTranslations("admin.announcements");
  const locale = useLocale();
  const toggleMutation = useToggleAnnouncement();

  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const handleToggle = async (announcement: Announcement) => {
    try {
      await toggleMutation.mutateAsync({
        id: announcement.id,
        isActive: !announcement.isActive,
      });
    } catch {
      onError(t("toggleError"));
    }
  };

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-radius-lg border border-border-default bg-surface-card shadow-level-1">
        <div className="animate-pulse space-y-3 p-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-14 rounded-radius-sm bg-surface-container" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-radius-lg border border-border-default bg-surface-card shadow-level-1">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-surface-container-low">
            <tr>
              <th className="px-6 py-4 text-left font-kanit text-[13px] font-bold uppercase tracking-wider text-text-muted">
                {t("colTitle")}
              </th>
              <th className="px-6 py-4 text-left font-kanit text-[13px] font-bold uppercase tracking-wider text-text-muted">
                {t("colContent")}
              </th>
              <th className="px-6 py-4 text-center font-kanit text-[13px] font-bold uppercase tracking-wider text-text-muted">
                {t("colStatus")}
              </th>
              <th className="px-6 py-4 text-left font-kanit text-[13px] font-bold uppercase tracking-wider text-text-muted">
                {t("colDate")}
              </th>
              <th className="px-6 py-4 text-right font-kanit text-[13px] font-bold uppercase tracking-wider text-text-muted">
                {t("colAction")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default/30">
            {announcements.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center font-sarabun text-body-md text-text-muted"
                >
                  {t("empty")}
                </td>
              </tr>
            ) : (
              announcements.map((announcement) => (
                <tr
                  key={announcement.id}
                  className="h-16 transition-colors hover:bg-surface-page"
                >
                  <td className="px-6 py-4">
                    <span className="font-sarabun text-body-md font-medium text-text-primary">
                      {announcement.title}
                    </span>
                  </td>
                  <td className="max-w-xs px-6 py-4">
                    <span className="line-clamp-1 font-sarabun text-body-sm text-text-muted">
                      {announcement.content}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <ToggleSwitch
                      checked={announcement.isActive}
                      onChange={() => handleToggle(announcement)}
                      disabled={toggleMutation.isPending}
                      label={
                        announcement.isActive ? t("statusOn") : t("statusOff")
                      }
                    />
                  </td>
                  <td className="px-6 py-4 font-sarabun text-body-sm text-text-muted">
                    {formatDate(announcement.createdAt, locale)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex gap-1">
                      <button
                        type="button"
                        aria-label={t("edit")}
                        onClick={() => onEdit(announcement)}
                        className="rounded-radius-sm p-2 text-primary transition-colors hover:bg-surface-container"
                      >
                        <EditIcon />
                      </button>
                      <button
                        type="button"
                        aria-label={t("delete")}
                        onClick={() => onDelete(announcement)}
                        className="rounded-radius-sm p-2 text-status-error transition-colors hover:bg-status-error-bg"
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

      <div className="flex flex-col items-center justify-between gap-4 border-t border-border-default bg-surface-container-low px-6 py-4 sm:flex-row">
        <span className="font-sarabun text-body-sm text-text-muted">
          {t("paginationSummary", { start, end, total })}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="rounded-radius-sm border border-border-default px-3 py-1 font-sarabun text-body-sm text-text-muted transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t("prevPage")}
          </button>
          {Array.from({ length: totalPages }).map((_, index) => {
            const pageNumber = index + 1;
            return (
              <button
                key={pageNumber}
                type="button"
                onClick={() => onPageChange(pageNumber)}
                className={`rounded-radius-sm px-3 py-1 font-sarabun text-body-sm font-bold transition-colors ${
                  page === pageNumber
                    ? "bg-primary text-surface-card"
                    : "border border-border-default hover:bg-surface-container"
                }`}
              >
                {pageNumber}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="rounded-radius-sm border border-border-default px-3 py-1 font-sarabun text-body-sm text-text-muted transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t("nextPage")}
          </button>
        </div>
      </div>
    </div>
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
