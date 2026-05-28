"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import DeleteDatasetModal from "@/components/admin/DeleteDatasetModal";
import type { AdminDataset, AdminDatasetsFilters } from "@/data/mockData";
import { useAdminDatasets } from "@/hooks/useAdminDatasets";
import { useHideDataset } from "@/hooks/useHideDataset";

type AdminDatasetTableProps = {
  filters: AdminDatasetsFilters;
  onPageChange: (page: number) => void;
  onSuccess: (message: string) => void;
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

function StatusBadge({
  status,
  label,
}: {
  status: AdminDataset["status"];
  label: string;
}) {
  const styles: Record<AdminDataset["status"], string> = {
    published: "bg-status-published-bg text-status-published",
    draft: "bg-status-draft-bg text-status-draft",
  };

  return (
    <span
      className={`inline-flex rounded-radius-full px-3 py-1 font-sarabun text-caption font-semibold ${
        styles[status] ?? styles.draft
      }`}
    >
      {label}
    </span>
  );
}

function QualityScoreBar({ score }: { score: number }) {
  const safeScore = Math.min(100, Math.max(0, score));
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-[60px] overflow-hidden rounded-radius-full bg-surface-container">
        <div
          className="h-full bg-primary-container"
          style={{ width: `${safeScore}%` }}
        />
      </div>
      <span className="font-sarabun text-caption font-medium text-primary-dark">
        {safeScore}%
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

export default function AdminDatasetTable({
  filters,
  onPageChange,
  onSuccess,
  onError,
}: AdminDatasetTableProps) {
  const t = useTranslations("admin.datasets");
  const tAdmin = useTranslations("admin");
  const locale = useLocale();
  const router = useRouter();
  const base = `/${locale}`;
  const { data, isLoading } = useAdminDatasets(filters);
  const hideMutation = useHideDataset();

  const [deleteTarget, setDeleteTarget] = useState<AdminDataset | null>(null);
  const [deleteTitle, setDeleteTitle] = useState("");

  const rows = data?.data ?? [];
  const total = data?.total ?? 0;
  const currentPage = data?.page ?? 1;
  const totalPages = data?.totalPages ?? 1;
  const pageSize = data?.pageSize ?? 5;

  const startItem = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  const handleEdit = (id: string) => {
    router.push(`${base}/datasets/${id}/edit`);
  };

  const handleDeleteRequest = (dataset: AdminDataset) => {
    const title = locale === "th" ? dataset.title : dataset.titleEn;
    setDeleteTarget(dataset);
    setDeleteTitle(title);
  };

  const handleHide = async (datasetId: string) => {
    try {
      await hideMutation.mutateAsync(datasetId);
      onSuccess(tAdmin("datasetHidden"));
    } catch {
      onError(t("actionError"));
    }
  };

  return (
    <>
      <div className="overflow-hidden rounded-radius-lg border border-border-default bg-surface-card shadow-level-1">
        {isLoading && !data ? (
          <TableSkeleton />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] text-left">
                <thead className="bg-surface-container">
                  <tr className="font-sarabun text-caption font-semibold uppercase tracking-wide text-text-muted">
                    <th className="px-6 py-4">{t("colTitle")}</th>
                    <th className="px-6 py-4">{t("colAgency")}</th>
                    <th className="px-6 py-4">{t("colCategory")}</th>
                    <th className="px-6 py-4 text-center">{t("colStatus")}</th>
                    <th className="px-6 py-4">{t("colQuality")}</th>
                    <th className="px-6 py-4">{t("colUpdated")}</th>
                    <th className="px-6 py-4 text-right">{t("colAction")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default/30">
                  {rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-12 text-center font-sarabun text-body-md text-text-muted"
                      >
                        {t("empty")}
                      </td>
                    </tr>
                  ) : (
                    rows.map((dataset) => {
                      const title =
                        locale === "th" ? dataset.title : dataset.titleEn;
                      const agency =
                        locale === "th" ? dataset.agency : dataset.agencyEn;
                      const category =
                        locale === "th" ? dataset.category : dataset.categoryEn;

                      return (
                        <tr
                          key={dataset.id}
                          className="transition-colors hover:bg-surface-page"
                        >
                          <td className="px-6 py-3">
                            <Link
                              href={`${base}/datasets/${dataset.id}`}
                              className="font-sarabun text-body-md font-medium text-primary-dark hover:underline"
                            >
                              {title}
                            </Link>
                          </td>
                          <td className="px-6 py-3 font-sarabun text-label text-text-muted">
                            {agency}
                          </td>
                          <td className="px-6 py-3">
                            <span className="rounded-radius-sm bg-surface-container px-2.5 py-1 font-sarabun text-caption text-text-secondary">
                              {category}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-center">
                            <StatusBadge
                              status={dataset.status}
                              label={t(`status.${dataset.status}`)}
                            />
                          </td>
                          <td className="px-6 py-3">
                            <QualityScoreBar score={dataset.qualityScore} />
                          </td>
                          <td className="px-6 py-3 font-sarabun text-label text-text-muted">
                            {formatDate(dataset.updatedAt, locale)}
                          </td>
                          <td className="px-6 py-3 text-right">
                            <div className="flex items-center justify-end gap-3">
                              {dataset.status === "published" ? (
                                <button
                                  type="button"
                                  onClick={() => handleHide(dataset.id)}
                                  disabled={hideMutation.isPending}
                                  className="rounded-radius-sm bg-[#ffefc9] px-3 py-1.5 font-sarabun text-caption font-bold text-[#795900] hover:opacity-90 disabled:opacity-50"
                                >
                                  {tAdmin("hide")}
                                </button>
                              ) : null}
                              <button
                                type="button"
                                onClick={() => handleEdit(dataset.id)}
                                className="text-text-muted transition-colors hover:text-primary-dark"
                                aria-label={t("edit")}
                              >
                                <EditIcon />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteRequest(dataset)}
                                className="text-text-muted transition-colors hover:text-status-error"
                                aria-label={t("delete")}
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

            {totalPages > 0 ? (
              <div className="flex flex-col gap-4 border-t border-border-default/30 bg-surface-container/50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-sarabun text-label text-text-muted">
                  {t("paginationSummary", {
                    start: startItem,
                    end: endItem,
                    total,
                  })}
                </p>
                {totalPages > 1 ? (
                  <DatasetTablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                  />
                ) : null}
              </div>
            ) : null}
          </>
        )}
      </div>

      <DeleteDatasetModal
        dataset={deleteTarget}
        title={deleteTitle}
        open={Boolean(deleteTarget)}
        onClose={() => {
          setDeleteTarget(null);
          setDeleteTitle("");
        }}
        onSuccess={() => onSuccess(t("deleteSuccess"))}
        onError={onError}
      />
    </>
  );
}

function DatasetTablePagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
}) {
  const t = useTranslations("common");
  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <nav className="flex items-center gap-2" aria-label={t("pagination.page")}>
      <button
        type="button"
        onClick={() => onPageChange?.(currentPage - 1)}
        disabled={currentPage <= 1}
        className="flex h-10 w-10 items-center justify-center rounded-radius-md border border-border-default bg-surface-card text-text-muted transition-colors hover:bg-surface-container disabled:opacity-30"
        aria-label={t("pagination.previous")}
      >
        <ChevronLeftIcon />
      </button>
      {pages.map((page, index) =>
        page === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="px-2 font-sarabun text-label text-text-muted"
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange?.(page)}
            className={`flex h-10 w-10 items-center justify-center rounded-radius-sm font-sarabun text-label font-bold transition-colors ${
              page === currentPage
                ? "bg-primary-dark text-white shadow-level-1"
                : "border border-border-default bg-surface-card text-text-muted hover:bg-surface-container"
            }`}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </button>
        )
      )}
      <button
        type="button"
        onClick={() => onPageChange?.(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="flex h-10 w-10 items-center justify-center rounded-radius-md border border-border-default bg-surface-card text-text-muted transition-colors hover:bg-surface-container disabled:opacity-30"
        aria-label={t("pagination.next")}
      >
        <ChevronRightIcon />
      </button>
    </nav>
  );
}

function EditIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
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
