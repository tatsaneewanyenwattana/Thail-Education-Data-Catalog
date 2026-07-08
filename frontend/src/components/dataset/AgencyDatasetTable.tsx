"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import DownloadModal from "@/components/dataset/DownloadModal";
import type { AgencyDatasetRow } from "@/types/dataset";
import {
  useAgencyDatasets,
  type AgencyDatasetStatusFilter,
} from "@/hooks/useAgencyDatasets";
import { usePublishDataset } from "@/hooks/usePublishDataset";

type AgencyDatasetTableProps = {
  status: AgencyDatasetStatusFilter;
  page: number;
  onPageChange: (page: number) => void;
  onDelete: (dataset: AgencyDatasetRow, title: string) => void;
  onMoveCategory?: (dataset: AgencyDatasetRow) => void;
  search?: string;
  year?: number;
};

function DatasetRowIcon() {
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded bg-surface-container text-primary-dark transition-colors group-hover:bg-primary-light">
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
      </svg>
    </div>
  );
}

function CategoryPill({ label }: { label: string }) {
  return (
    <span className="inline-flex max-w-[140px] truncate rounded-full bg-primary-light px-3 py-1 font-sarabun text-caption font-medium text-primary-dark">
      {label}
    </span>
  );
}

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
      <span className="inline-flex items-center gap-1.5 rounded-full bg-status-published-bg px-3 py-1 font-sarabun text-caption font-semibold text-status-published">
        <span className="h-2 w-2 rounded-full bg-status-published" />
        {publishedLabel}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-status-draft-bg px-3 py-1 font-sarabun text-caption font-semibold text-status-draft">
      <span className="h-2 w-2 rounded-full bg-status-draft" />
      {draftLabel}
    </span>
  );
}

function QualityScoreBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-8 font-sarabun text-caption font-bold text-text-primary">
        {score}
      </span>
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-surface-container">
        <div
          className="h-full rounded-full bg-primary-dark"
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="animate-pulse space-y-3 p-6">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="h-14 rounded-xl bg-surface-container" />
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
  onMoveCategory,
  search,
  year,
}: AgencyDatasetTableProps) {
  const t = useTranslations("agency.datasets");
  const tStatus = useTranslations("agency.status");
  const locale = useLocale();
  const base = `/${locale}`;
  const { data, isLoading, isError, error } = useAgencyDatasets(status, page, 10, search, year);
  const publishMutation = usePublishDataset();
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [downloadTarget, setDownloadTarget] = useState<{
    id: string;
    fileFormat: string | null;
  } | null>(null);

  const rows = data?.data ?? [];
  const total = data?.total ?? 0;
  const currentPage = data?.page ?? 1;
  const totalPages = data?.totalPages ?? 1;
  const pageSize = 10;
  const from = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, total);

  if (isError) {
    return (
      <div className="rounded-2xl border border-status-error/30 bg-status-error/5 px-6 py-8 text-center shadow-level-1">
        <p className="font-sarabun text-body-md text-status-error">
          {error instanceof Error
            ? error.message
            : "โหลดรายการ Dataset ไม่สำเร็จ"}
        </p>
      </div>
    );
  }

  if (isLoading && rows.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-border-default/60 bg-surface-card shadow-level-1">
        <TableSkeleton />
      </div>
    );
  }

  if (!isLoading && rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border-default/60 bg-surface-card px-6 py-16 text-center shadow-level-1">
        <p className="font-sarabun text-body-lg text-text-secondary">{t("empty")}</p>
        <Link
          href={`${base}/datasets/create`}
          className="mt-4 rounded-xl bg-primary-dark px-6 py-2.5 font-sarabun text-label font-medium text-white transition-opacity hover:opacity-90"
        >
          {t("emptyAction")}
        </Link>
      </div>
    );
  }

  const pages = getPageNumbers(currentPage, totalPages);

  const handlePublish = async (row: AgencyDatasetRow) => {
    setPublishError(null);
    setPublishingId(row.id);
    try {
      await publishMutation.mutateAsync(row.id);
    } catch (err) {
      setPublishError(
        err instanceof Error ? err.message : t("publishError")
      );
    } finally {
      setPublishingId(null);
    }
  };

  return (
    <>
      {publishError && (
        <div
          className="mb-4 rounded-xl border border-status-error bg-status-error-bg px-4 py-3 font-sarabun text-label text-status-error"
          role="alert"
        >
          {publishError}
        </div>
      )}
      <div className="overflow-hidden rounded-2xl border border-border-default/60 bg-surface-card shadow-level-1">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className="bg-[#eceef1]">
              <tr className="font-sarabun text-[15px] font-bold text-text-muted">
                <th className="px-6 py-3.5">{t("colTitle")}</th>
                <th className="px-6 py-3.5">{t("colCategory")}</th>
                <th className="px-6 py-3.5">{t("colStatus")}</th>
                <th className="px-6 py-3.5">{t("colQuality")}</th>
                <th className="px-6 py-3.5">{t("colUpdated")}</th>
                <th className="px-6 py-3.5 text-center">{t("colAction")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default/20">
              {rows.map((row) => {
                const title = locale === "th" ? row.title : row.titleEn;
                const categoryLabel =
                  locale === "th" ? row.category : row.categoryEn;
                const updated = new Date(row.updatedAt).toLocaleDateString(
                  locale === "th" ? "th-TH" : "en-US",
                  { year: "numeric", month: "short", day: "numeric" }
                );

                return (
                  <tr
                    key={row.id}
                    className="group transition-colors hover:bg-[#f7f9fc]"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <DatasetRowIcon />
                        <div className="min-w-0">
                          <Link
                            href={`${base}/datasets/${row.id}`}
                            className="block max-w-[200px] truncate font-sarabun text-body-md font-semibold text-text-primary hover:underline"
                          >
                            {title}
                          </Link>
                          {row.fileFormat && (
                            <p className="mt-0.5 font-sarabun text-[11px] text-text-muted">
                              {row.fileFormat}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <CategoryPill label={categoryLabel} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge
                        status={row.status}
                        publishedLabel={tStatus("published")}
                        draftLabel={tStatus("draft")}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <QualityScoreBar score={row.qualityScore} />
                    </td>
                    <td className="px-6 py-4 font-sarabun text-label text-text-muted">
                      {updated}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {row.status === "draft" && (
                          <button
                            type="button"
                            onClick={() => void handlePublish(row)}
                            disabled={publishingId === row.id}
                            className="rounded-lg bg-primary-dark px-2.5 py-1 font-sarabun text-caption font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                          >
                            {publishingId === row.id
                              ? t("publishing")
                              : t("publish")}
                          </button>
                        )}
                        <Link
                          href={`${base}/datasets/${row.id}/edit`}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-[#01579b] transition-colors hover:bg-[#e1f5fe]"
                          aria-label={t("edit")}
                          title={t("edit")}
                        >
                          <EditIcon />
                        </Link>
                        {onMoveCategory && (
                          <button
                            type="button"
                            onClick={() => onMoveCategory(row)}
                            className="flex h-7 w-7 items-center justify-center rounded-full text-[#2baf2b] transition-colors hover:bg-[#e8f5e9]"
                            aria-label="ย้ายหมวดหมู่"
                            title="ย้ายหมวดหมู่"
                          >
                            <MoveIcon />
                          </button>
                        )}
                        <Link
                          href={`${base}/datasets/${row.id}/versions`}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-[#5d4037] transition-colors hover:bg-[#efebe9]"
                          aria-label={t("versions")}
                          title={t("versions")}
                        >
                          <HistoryIcon />
                        </Link>
                        <button
                          type="button"
                          onClick={() =>
                            setDownloadTarget({
                              id: row.id,
                              fileFormat: row.fileFormat ?? null,
                            })
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-container"
                          aria-label={t("download")}
                          title={t("download")}
                        >
                          <DownloadIcon />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(row, title)}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-[#d01716] transition-colors hover:bg-[#ffdad6]"
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

      {totalPages > 0 && (
        <div className="flex flex-col gap-4 border-t border-border-default/30 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-sarabun text-label text-text-muted">
            {t("paginationSummary", { from, to, total })}
          </p>
          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-1" aria-label={t("pagination")}>
              <button
                type="button"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-container disabled:opacity-30"
                aria-label={t("prevPage")}
              >
                <ChevronLeftIcon />
              </button>
              {pages.map((pageNum, index) =>
                pageNum === "ellipsis" ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-1 font-sarabun text-label text-text-muted"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => onPageChange(pageNum)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg font-sarabun text-caption font-bold transition-colors ${
                      pageNum === currentPage
                        ? "bg-[#01579b] text-white"
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
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-container disabled:opacity-30"
                aria-label={t("nextPage")}
              >
                <ChevronRightIcon />
              </button>
            </nav>
          </div>
        </div>
      )}
      </div>

      <DownloadModal
        open={Boolean(downloadTarget)}
        datasetId={downloadTarget?.id ?? ""}
        sourceFileFormat={downloadTarget?.fileFormat}
        onClose={() => setDownloadTarget(null)}
        theme="agency"
      />
    </>
  );
}

function DownloadIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 9h-4V3H9v6H5l7 7 7-7ZM5 18v2h14v-2H5Z" />
    </svg>
  );
}

function MoveIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M13 3a9 9 0 1 0 9 9h-2a7 7 0 1 1-2.05-4.95L15 9h6V3l-2.24 2.24A8.96 8.96 0 0 0 13 3zm-1 5h2v5h-5V11h3V8z" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
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
