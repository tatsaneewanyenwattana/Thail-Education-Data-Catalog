"use client";

import { useLocale, useTranslations } from "next-intl";
import type {
  AgencyCategoryL1,
  AgencyCategoryL2,
} from "@/data/mockData";
import { useAgencyCategories } from "@/hooks/useAgencyCategories";

type CategoryTab = "level1" | "level2";

type CategoryTableProps = {
  tab: CategoryTab;
  page: number;
  onPageChange: (page: number) => void;
  onEdit: (category: AgencyCategoryL1 | AgencyCategoryL2) => void;
  onDelete: (
    category: AgencyCategoryL1 | AgencyCategoryL2,
    displayName: string
  ) => void;
};

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

function TableSkeleton() {
  return (
    <div className="animate-pulse space-y-3 p-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-12 rounded-radius-sm bg-surface-container"
        />
      ))}
    </div>
  );
}

export default function CategoryTable({
  tab,
  page,
  onPageChange,
  onEdit,
  onDelete,
}: CategoryTableProps) {
  const t = useTranslations("agency.categories");
  const locale = useLocale();
  const level = tab === "level1" ? 1 : 2;
  const { data, isLoading, isError } = useAgencyCategories(level, page);

  const rows = data?.data ?? [];
  const total = data?.total ?? 0;
  const currentPage = data?.page ?? 1;
  const totalPages = data?.totalPages ?? 1;
  const pageSize = 4;
  const from = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, total);

  if (isError) {
    return (
      <div className="rounded-radius-lg border border-status-error bg-status-error-bg px-6 py-4 font-sarabun text-label text-status-error">
        {t("loadError")}
      </div>
    );
  }

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
      </div>
    );
  }

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <div className="overflow-hidden rounded-radius-lg border border-border-default/80 bg-surface-card shadow-level-1">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border-default/30 bg-surface-container font-kanit text-label font-semibold text-text-secondary">
              <th className="px-6 py-4">{t("colNameTh")}</th>
              <th className="px-6 py-4">{t("colNameEn")}</th>
              <th className="px-6 py-4">{t("colSlug")}</th>
              {level === 2 && (
                <th className="px-6 py-4">{t("colParent")}</th>
              )}
              <th className="px-6 py-4">{t("colDatasets")}</th>
              <th className="px-6 py-4 text-center">{t("colAction")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default/20">
            {rows.map((row) => {
              const nameTh = row.nameTh;
              const nameEn = row.nameEn;
              const l2Row =
                level === 2 ? (row as AgencyCategoryL2) : null;
              const parentLabel = l2Row
                ? locale === "th"
                  ? l2Row.parentNameTh
                  : l2Row.parentNameEn
                : "";

              return (
                <tr
                  key={row.id}
                  className="h-12 transition-colors hover:bg-surface-page"
                >
                  <td className="px-6 py-3 font-sarabun text-body-md text-text-primary">
                    {nameTh}
                  </td>
                  <td className="px-6 py-3 font-sarabun text-body-md text-text-primary">
                    {nameEn}
                  </td>
                  <td className="px-6 py-3 font-mono text-code text-text-muted">
                    {row.slug}
                  </td>
                  {level === 2 && (
                    <td className="px-6 py-3 font-sarabun text-label text-text-secondary">
                      {parentLabel}
                    </td>
                  )}
                  <td className="px-6 py-3">
                    <span className="inline-flex rounded-radius-full bg-primary-light px-3 py-1 font-sarabun text-caption font-bold text-primary-dark">
                      {t("datasetCount", { count: row.datasetCount })}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => onEdit(row)}
                        className="rounded-radius-md p-1.5 text-text-muted transition-colors hover:bg-primary-light hover:text-primary-dark"
                        aria-label={t("formTitleEditL1")}
                      >
                        <EditIcon />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onDelete(row, locale === "th" ? nameTh : nameEn)
                        }
                        className="rounded-radius-md p-1.5 text-text-muted transition-colors hover:bg-status-error-bg hover:text-status-error"
                        aria-label={t("confirmDelete")}
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

      <div className="flex flex-col gap-4 border-t border-border-default/30 bg-surface-card p-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-sarabun text-label text-text-muted">
          {t("paginationSummary", { from, to, total })}
        </p>
        {totalPages > 1 && (
          <nav className="flex items-center gap-2" aria-label={t("pagination")}>
            <button
              type="button"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="flex h-10 w-10 items-center justify-center rounded-radius-md border border-border-default transition-colors hover:bg-surface-container disabled:opacity-40"
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
                  …
                </span>
              ) : (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => onPageChange(pageNum)}
                  className={`flex h-10 w-10 items-center justify-center rounded-radius-md font-sarabun text-label font-bold transition-colors ${
                    pageNum === currentPage
                      ? "bg-primary text-surface-card"
                      : "border border-border-default text-text-secondary hover:bg-surface-container"
                  }`}
                >
                  {pageNum}
                </button>
              )
            )}
            <button
              type="button"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="flex h-10 w-10 items-center justify-center rounded-radius-md border border-border-default transition-colors hover:bg-surface-container disabled:opacity-40"
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
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
    </svg>
  );
}
