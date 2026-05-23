"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import type { AgencyDatasetRow } from "@/data/mockData";
import {
  useAgencyDatasets,
  type AgencyDatasetStatusFilter,
} from "@/hooks/useAgencyDatasets";

type AgencyDatasetTableProps = {
  status: AgencyDatasetStatusFilter;
  page: number;
  onPageChange: (page: number) => void;
  onDelete: (dataset: AgencyDatasetRow, title: string) => void;
};

function StatusBadge({
  status,
  publishedLabel,
  draftLabel,
}: {
  status: AgencyDatasetRow["status"];
  publishedLabel: string;
  draftLabel: string;
}) {
  if (status === "published") {
    return (
      <span className="inline-flex rounded-radius-full bg-status-published-bg px-3 py-1 font-sarabun text-caption font-semibold text-status-published">
        {publishedLabel}
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-radius-full bg-status-draft-bg px-3 py-1 font-sarabun text-caption font-semibold text-status-draft">
      {draftLabel}
    </span>
  );
}

function QualityScoreBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-2 w-20 rounded-radius-full bg-surface-container">
        <div
          className="h-2 rounded-radius-full bg-primary"
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
      <span className="font-sarabun text-label font-bold text-text-primary">
        {score}
      </span>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="animate-pulse space-y-3 p-6">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="h-12 rounded-radius-sm bg-surface-container" />
      ))}
    </div>
  );
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

export default function AgencyDatasetTable({
  status,
  page,
  onPageChange,
  onDelete,
}: AgencyDatasetTableProps) {
  const t = useTranslations("agency.datasets");
  const tStatus = useTranslations("agency.status");
  const locale = useLocale();
  const base = `/${locale}`;
  const { data, isLoading } = useAgencyDatasets(status, page);

  const rows = data?.data ?? [];
  const total = data?.total ?? 0;
  const currentPage = data?.page ?? 1;
  const totalPages = data?.totalPages ?? 1;
  const pageSize = 10;
  const from = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, total);

  if (isLoading && rows.length === 0) {
    return (
      <div className="overflow-hidden rounded-radius-lg border border-border-default/80 bg-surface-card shadow-level-1">
        <TableSkeleton />
      </div>
    );
  }

  if (!isLoading && rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-radius-lg border border-border-default/80 bg-surface-card px-6 py-16 text-center shadow-level-1">
        <p className="font-sarabun text-body-lg text-text-secondary">{t("empty")}</p>
        <Link
          href={`${base}/datasets/create`}
          className="mt-4 rounded-radius-lg bg-primary-dark px-6 py-2.5 font-sarabun text-label font-medium text-surface-card transition-opacity hover:opacity-90"
        >
          {t("emptyAction")}
        </Link>
      </div>
    );
  }

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <>
      <div className="overflow-hidden rounded-radius-lg border border-border-default/80 bg-surface-card shadow-level-1">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-surface-container font-kanit text-label font-semibold text-text-secondary">
                <th className="px-6 py-4">{t("colTitle")}</th>
                <th className="px-6 py-4">{t("colCategory")}</th>
                <th className="px-6 py-4">{t("colStatus")}</th>
                <th className="px-6 py-4">{t("colQuality")}</th>
                <th className="px-6 py-4">{t("colUpdated")}</th>
                <th className="px-6 py-4 text-center">{t("colAction")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default/30">
              {rows.map((row) => {
                const title = locale === "th" ? row.title : row.titleEn;
                const categoryPath =
                  locale === "th"
                    ? `${row.category} > ${row.subcategory}`
                    : `${row.categoryEn} > ${row.subcategoryEn}`;
                const updated = new Date(row.updatedAt).toLocaleDateString(
                  locale === "th" ? "th-TH" : "en-US",
                  { year: "numeric", month: "short", day: "numeric" }
                );

                return (
                  <tr
                    key={row.id}
                    className="transition-colors hover:bg-surface-page"
                  >
                    <td className="max-w-xs truncate px-6 py-3">
                      <Link
                        href={`${base}/datasets/${row.id}`}
                        className="font-sarabun text-label font-semibold text-primary-dark hover:underline"
                      >
                        {title}
                      </Link>
                    </td>
                    <td className="px-6 py-3 font-sarabun text-label text-text-muted">
                      {categoryPath}
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge
                        status={row.status}
                        publishedLabel={tStatus("published")}
                        draftLabel={tStatus("draft")}
                      />
                    </td>
                    <td className="px-6 py-3">
                      <QualityScoreBar score={row.qualityScore} />
                    </td>
                    <td className="px-6 py-3 font-sarabun text-label text-text-muted">
                      {updated}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-center gap-4">
                        <Link
                          href={`${base}/datasets/${row.id}/edit`}
                          className="text-text-muted transition-colors hover:text-primary-dark"
                          aria-label={t("edit")}
                          title={t("edit")}
                        >
                          <EditIcon />
                        </Link>
                        <Link
                          href={`${base}/datasets/${row.id}/versions`}
                          className="text-text-muted transition-colors hover:text-primary-dark"
                          aria-label={t("versions")}
                          title={t("versions")}
                        >
                          <HistoryIcon />
                        </Link>
                        <button
                          type="button"
                          onClick={() => onDelete(row, title)}
                          className="text-text-muted transition-colors hover:text-status-error"
                          aria-label={t("delete")}
                          title={t("delete")}
                        >
                          <DeleteIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex flex-col gap-4 px-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-sarabun text-label text-text-muted">
            {t("paginationSummary", { from, to, total })}
          </p>
          <nav className="flex items-center gap-1" aria-label={t("pagination")}>
            <button
              type="button"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="flex h-10 w-10 items-center justify-center rounded-radius-md transition-colors hover:bg-surface-container disabled:opacity-40"
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
                  onClick={() => onPageChange(pageNum)}
                  className={`flex h-10 w-10 items-center justify-center rounded-radius-sm font-sarabun text-label font-bold transition-colors ${
                    pageNum === currentPage
                      ? "bg-primary text-surface-card shadow-level-1"
                      : "text-text-primary hover:bg-surface-container"
                  }`}
                  aria-current={pageNum === currentPage ? "page" : undefined}
                >
                  {pageNum}
                </button>
              )
            )}
            <button
              type="button"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="flex h-10 w-10 items-center justify-center rounded-radius-md transition-colors hover:bg-surface-container disabled:opacity-40"
              aria-label={t("nextPage")}
            >
              <ChevronRightIcon />
            </button>
          </nav>
        </div>
      )}
    </>
  );
}

function EditIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M13 3a9 9 0 1 0 9 9h-2a7 7 0 1 1-2.05-4.95L15 9h6V3l-2.24 2.24A8.96 8.96 0 0 0 13 3zm-1 5h2v5h-5V11h3V8z" />
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
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12l4.58-4.59z" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
    </svg>
  );
}
