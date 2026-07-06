"use client";

import { useTranslations } from "next-intl";
import type { AuditLog, AuditLogAction, AuditLogsFilters } from "@/types/admin";
import { useAuditLogs } from "@/hooks/useAuditLogs";

type AuditLogTableProps = {
  filters: AuditLogsFilters;
  onPageChange: (page: number) => void;
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

const ACTION_COLORS: Record<AuditLogAction, string> = {
  LOGIN: "bg-blue-50 text-blue-700",
  UPLOAD: "bg-emerald-50 text-emerald-700",
  DOWNLOAD: "bg-emerald-50 text-emerald-700",
  APPROVE: "bg-emerald-50 text-emerald-700",
  DELETE: "bg-red-50 text-red-600",
  REJECT: "bg-red-50 text-red-600",
};

function ActionBadge({
  action,
  label,
}: {
  action: AuditLogAction;
  label: string;
}) {
  return (
    <span
      className={`inline-flex rounded-full px-3.5 py-1 font-sarabun text-[12px] font-bold uppercase tracking-wide ${ACTION_COLORS[action]}`}
    >
      {label}
    </span>
  );
}

export default function AuditLogTable({
  filters,
  onPageChange,
}: AuditLogTableProps) {
  const t = useTranslations("admin.auditLogs");
  const { data, isLoading } = useAuditLogs(filters);

  const rows: AuditLog[] = data?.data ?? [];
  const total = data?.total ?? 0;
  const currentPage = data?.page ?? 1;
  const totalPages = data?.totalPages ?? 1;
  const pageSize = data?.pageSize ?? 6;

  const startItem = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  const actionLabel = (action: AuditLogAction) => {
    const key = action.toLowerCase() as
      | "login"
      | "upload"
      | "download"
      | "delete"
      | "approve"
      | "reject";
    return t(`actions.${key}`);
  };

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-white/80 bg-white shadow-md">
        <div className="animate-pulse space-y-3 p-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/80 bg-white shadow-md">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80 font-kanit text-[13px] font-bold uppercase tracking-wider text-text-secondary">
              <th className="px-6 py-4">{t("colTimestamp")}</th>
              <th className="px-6 py-4">{t("colUser")}</th>
              <th className="px-6 py-4">{t("colAction")}</th>
              <th className="px-6 py-4">{t("colDetail")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/60">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-12 text-center font-sarabun text-body-md text-text-muted"
                >
                  {t("empty")}
                </td>
              </tr>
            ) : (
              rows.map((log) => (
                <tr
                  key={log.id}
                  className="transition-colors hover:bg-gray-50/50"
                >
                  <td className="px-6 py-4 font-mono text-body-sm text-text-secondary">
                    {log.timestamp}
                  </td>
                  <td className="px-6 py-4 font-sarabun text-body-md text-text-primary">
                    {log.email}
                  </td>
                  <td className="px-6 py-4">
                    <ActionBadge
                      action={log.action}
                      label={actionLabel(log.action)}
                    />
                  </td>
                  <td
                    className="max-w-[350px] truncate px-6 py-4 font-sarabun text-body-sm text-text-muted"
                    title={log.detail}
                  >
                    {log.detail}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 bg-gray-50/50 px-6 py-4 sm:flex-row">
        <span className="font-sarabun text-body-sm text-text-muted">
          {t("paginationSummary", { start: startItem, end: endItem, total })}
        </span>
        {totalPages > 1 && (
          <nav className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-text-muted shadow-sm transition-all hover:bg-gray-50 hover:shadow-md disabled:opacity-30"
              aria-label={t("prevPage")}
            >
              <ChevronLeftIcon />
            </button>
            {pageNumbers.map((p, i) =>
              p === "ellipsis" ? (
                <span
                  key={`e-${i}`}
                  className="px-2 font-sarabun text-body-sm text-text-muted"
                >
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPageChange(p)}
                  className={`flex h-10 w-10 items-center justify-center rounded-full font-sarabun text-body-sm font-bold transition-all ${
                    currentPage === p
                      ? "bg-gradient-to-r from-[#053F5C] to-[#0081A7] text-white shadow-lg shadow-[#0081A7]/30"
                      : "border border-gray-200 bg-white text-text-muted hover:bg-gray-50 hover:shadow-sm"
                  }`}
                  aria-current={p === currentPage ? "page" : undefined}
                >
                  {p}
                </button>
              )
            )}
            <button
              type="button"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
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
