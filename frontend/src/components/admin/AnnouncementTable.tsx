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

function getPageNumbers(
  current: number,
  total: number
): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 3) {
    return [1, 2, 3, "ellipsis", total];
  }
  if (current >= total - 2) {
    return [1, "ellipsis", total - 2, total - 1, total];
  }
  return [1, "ellipsis", current, "ellipsis", total];
}

const CATEGORY_LABELS = [
  "System Maintenance",
  "Policy Update",
  "Announcement",
  "General",
  "Update",
];

const CATEGORY_COLORS: Record<string, string> = {
  "System Maintenance": "bg-blue-50 text-blue-700",
  "Policy Update": "bg-emerald-50 text-emerald-700",
  Announcement: "bg-amber-50 text-amber-700",
  General: "bg-gray-100 text-gray-700",
  Update: "bg-purple-50 text-purple-700",
};

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
      <div className="overflow-hidden rounded-2xl border border-white/80 bg-white shadow-md">
        <div className="animate-pulse space-y-3 p-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-14 rounded-xl bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/80 bg-white shadow-md">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-left">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80 font-sarabun text-caption font-semibold uppercase tracking-wide text-text-muted">
              <th className="px-6 py-4">{t("colTitle")}</th>
              <th className="px-6 py-4">{t("colContent")}</th>
              <th className="px-6 py-4">{t("colCategory")}</th>
              <th className="px-6 py-4 text-center">{t("colStatus")}</th>
              <th className="px-6 py-4">{t("colDate")}</th>
              <th className="px-6 py-4 text-right">{t("colAction")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/60">
            {announcements.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center font-sarabun text-body-md text-text-muted"
                >
                  {t("empty")}
                </td>
              </tr>
            ) : (
              announcements.map((announcement, index) => {
                const categoryLabel =
                  CATEGORY_LABELS[index % CATEGORY_LABELS.length];
                const categoryColor =
                  CATEGORY_COLORS[categoryLabel] ?? CATEGORY_COLORS.General;

                return (
                  <tr
                    key={announcement.id}
                    className="transition-colors hover:bg-gray-50/50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                            announcement.isActive
                              ? "bg-primary-dark"
                              : "bg-gray-300"
                          }`}
                        />
                        <span className="font-sarabun text-body-md font-semibold text-text-primary">
                          {announcement.title}
                        </span>
                      </div>
                    </td>
                    <td className="max-w-[200px] px-6 py-4">
                      <span className="line-clamp-1 font-sarabun text-label text-text-muted">
                        {announcement.content}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 font-sarabun text-caption font-semibold ${categoryColor}`}
                      >
                        {categoryLabel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <ToggleSwitch
                        checked={announcement.isActive}
                        onChange={() => handleToggle(announcement)}
                        disabled={toggleMutation.isPending}
                        label={
                          announcement.isActive
                            ? t("statusOn")
                            : t("statusOff")
                        }
                      />
                    </td>
                    <td className="px-6 py-4 font-sarabun text-label text-text-muted">
                      {formatDate(announcement.createdAt, locale)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex gap-1">
                        <button
                          type="button"
                          aria-label={t("edit")}
                          onClick={() => onEdit(announcement)}
                          className="rounded-full p-2 text-text-muted transition-colors hover:bg-blue-50 hover:text-primary-dark"
                        >
                          <EditIcon />
                        </button>
                        <button
                          type="button"
                          aria-label={t("delete")}
                          onClick={() => onDelete(announcement)}
                          className="rounded-full p-2 text-text-muted transition-colors hover:bg-red-50 hover:text-status-error"
                        >
                          <DeleteIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 bg-gray-50/50 px-6 py-4 sm:flex-row">
        <span className="font-sarabun text-label text-text-muted">
          {t("paginationSummary", { start, end, total })}
        </span>
        {totalPages > 1 && (
          <nav className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-text-muted shadow-sm transition-all hover:bg-gray-50 hover:shadow-md disabled:opacity-30"
              aria-label={t("prevPage")}
            >
              <ChevronLeftIcon />
            </button>
            {getPageNumbers(page, totalPages).map((p, index) =>
              p === "ellipsis" ? (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 font-sarabun text-label text-text-muted"
                >
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPageChange(p)}
                  className={`flex h-10 w-10 items-center justify-center rounded-full font-sarabun text-label font-bold transition-all ${
                    page === p
                      ? "bg-primary-dark text-white shadow-md"
                      : "border border-gray-200 bg-white text-text-muted hover:bg-gray-50 hover:shadow-sm"
                  }`}
                >
                  {p}
                </button>
              )
            )}
            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-text-muted shadow-sm transition-all hover:bg-gray-50 hover:shadow-md disabled:opacity-30"
              aria-label={t("nextPage")}
            >
              <ChevronRightIcon />
            </button>
          </nav>
        )}
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

function ChevronLeftIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}
