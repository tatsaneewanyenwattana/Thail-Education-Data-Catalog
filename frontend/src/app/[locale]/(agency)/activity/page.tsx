"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import {
  ACTIVITY_LOG_PAGE_SIZE,
  type AgencyActivityLogItem,
  useAgencyActivityLogs,
} from "@/hooks/useAgencyActivityLogs";

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

function mapActivityLabel(
  activityType: AgencyActivityLogItem["activityType"],
  t: ReturnType<typeof useTranslations<"agency.activity">>
) {
  switch (activityType) {
    case "upload":
      return t("actionUpload");
    case "draft":
      return t("actionDraft");
    case "update":
      return t("actionUpdate");
    case "delete":
      return t("actionDelete");
    default:
      return t("actionOther");
  }
}

function mapItemTypeLabel(
  itemType: AgencyActivityLogItem["itemType"],
  t: ReturnType<typeof useTranslations<"agency.activity">>
) {
  return itemType === "scholarship" ? t("typeScholarship") : t("typeDataset");
}

export default function AgencyActivityPage() {
  const t = useTranslations("agency.activity");
  const locale = useLocale();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useAgencyActivityLogs(
    page,
    ACTIVITY_LOG_PAGE_SIZE
  );

  const items = data?.items ?? [];
  const pagination = data?.pagination;
  const totalPages = Math.max(1, pagination?.total_pages ?? 1);
  const totalItems = pagination?.total_items ?? 0;
  const currentPage = Math.min(page, totalPages);
  const from =
    totalItems === 0 ? 0 : (currentPage - 1) * ACTIVITY_LOG_PAGE_SIZE + 1;
  const to = Math.min(currentPage * ACTIVITY_LOG_PAGE_SIZE, totalItems);
  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-kanit text-[28px] font-bold text-text-primary">
          {t("title")}
        </h1>
        <p className="mt-1 font-sarabun text-body-md text-text-muted">
          {t("subtitle")}
        </p>
      </header>

      {isError ? (
        <div className="rounded-radius-lg border border-status-error/30 bg-status-error/5 px-4 py-3 font-sarabun text-label text-status-error">
          {error instanceof Error ? error.message : t("loadError")}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-radius-lg border border-border-default/80 bg-surface-card shadow-level-1">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-surface-container font-sarabun text-label font-semibold text-text-secondary">
                <th className="px-6 py-4">{t("colDateTime")}</th>
                <th className="px-6 py-4">{t("colType")}</th>
                <th className="px-6 py-4">{t("colAction")}</th>
                <th className="px-6 py-4">{t("colTitle")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default/30">
              {isLoading ? (
                <tr>
                  <td
                    className="px-6 py-6 font-sarabun text-label text-text-muted"
                    colSpan={4}
                  >
                    {t("loading")}
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    className="px-6 py-6 font-sarabun text-label text-text-muted"
                    colSpan={4}
                  >
                    {t("empty")}
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-3 font-sarabun text-label text-text-muted">
                      {new Date(item.created_at).toLocaleString(
                        locale === "th" ? "th-TH" : "en-US"
                      )}
                    </td>
                    <td className="px-6 py-3 font-sarabun text-label text-text-primary">
                      {mapItemTypeLabel(item.itemType, t)}
                    </td>
                    <td className="px-6 py-3 font-sarabun text-label text-text-primary">
                      {mapActivityLabel(item.activityType, t)}
                    </td>
                    <td className="px-6 py-3 font-sarabun text-label text-text-primary">
                      {item.title ?? "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {totalPages > 1 && (
        <div className="flex flex-col gap-4 px-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-sarabun text-label text-text-muted">
            {t("paginationSummary", { from, to, total: totalItems })}
          </p>
          <nav
            className="flex items-center justify-center gap-1 sm:justify-end"
            aria-label={t("pagination")}
          >
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="flex h-10 w-10 items-center justify-center rounded-radius-md border border-border-input text-text-muted transition-colors hover:bg-surface-container disabled:opacity-40"
              aria-label={t("prevPage")}
            >
              <ChevronLeftIcon />
            </button>
            {pages.map((pageNum, index) =>
              pageNum === "ellipsis" ? (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 font-sarabun text-label text-text-muted"
                >
                  ...
                </span>
              ) : (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setPage(pageNum)}
                  className={`flex h-10 w-10 items-center justify-center rounded-radius-sm font-sarabun text-label font-bold transition-colors ${
                    pageNum === currentPage
                      ? "bg-primary text-surface-card shadow-level-1"
                      : "border border-border-input text-text-primary hover:bg-surface-container"
                  }`}
                  aria-current={pageNum === currentPage ? "page" : undefined}
                >
                  {pageNum}
                </button>
              )
            )}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="flex h-10 w-10 items-center justify-center rounded-radius-md border border-border-input text-text-muted transition-colors hover:bg-surface-container disabled:opacity-40"
              aria-label={t("nextPage")}
            >
              <ChevronRightIcon />
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}

function ChevronLeftIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 19l-7-7 7-7"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </svg>
  );
}
