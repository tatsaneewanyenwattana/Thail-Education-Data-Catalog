"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import AuditLogFilter, {
  type AuditLogFilterValues,
} from "@/components/admin/AuditLogFilter";
import AuditLogTable from "@/components/admin/AuditLogTable";
import type { AuditLogsFilters } from "@/data/mockData";
import { exportAuditLogsCsv } from "@/hooks/useAuditLogs";

const emptyFilters: AuditLogFilterValues = {
  dateFrom: "",
  dateTo: "",
  action: "all",
  search: "",
};

function DownloadIcon() {
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
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  );
}

export default function AdminAuditLogsPage() {
  const t = useTranslations("admin.auditLogs");

  const [draftFilters, setDraftFilters] =
    useState<AuditLogFilterValues>(emptyFilters);
  const [appliedFilters, setAppliedFilters] =
    useState<AuditLogFilterValues>(emptyFilters);
  const [page, setPage] = useState(1);

  const queryFilters: AuditLogsFilters = {
    dateFrom: appliedFilters.dateFrom || undefined,
    dateTo: appliedFilters.dateTo || undefined,
    action: appliedFilters.action,
    search: appliedFilters.search || undefined,
    page,
  };

  const handleSearch = () => {
    setAppliedFilters(draftFilters);
    setPage(1);
  };

  const handleExport = async () => {
    try {
      await exportAuditLogsCsv({
        dateFrom: appliedFilters.dateFrom || undefined,
        dateTo: appliedFilters.dateTo || undefined,
        action: appliedFilters.action,
        search: appliedFilters.search || undefined,
      });
    } catch {
      // Export errors surface via browser download failure only
    }
  };

  return (
    <div className="mx-auto max-w-container-max space-y-8 pb-24">
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
          onClick={handleExport}
          className="inline-flex items-center justify-center gap-2 rounded-radius-md border border-secondary px-4 py-2 font-sarabun text-label text-secondary transition-colors hover:bg-secondary/5"
        >
          <DownloadIcon />
          {t("export")}
        </button>
      </header>

      <AuditLogFilter
        values={draftFilters}
        onChange={setDraftFilters}
        onSearch={handleSearch}
      />

      <AuditLogTable
        filters={queryFilters}
        onPageChange={setPage}
      />
    </div>
  );
}
