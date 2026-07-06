"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import AdminStatsCard from "@/components/admin/AdminStatsCard";
import AuditLogFilter, {
  type AuditLogFilterValues,
} from "@/components/admin/AuditLogFilter";
import AuditLogTable from "@/components/admin/AuditLogTable";
import type { AuditLogsFilters } from "@/types/admin";
import { exportAuditLogsCsv, useAuditLogStats } from "@/hooks/useAuditLogs";

const emptyFilters: AuditLogFilterValues = {
  dateFrom: "",
  dateTo: "",
  action: "all",
  search: "",
};

export default function AdminAuditLogsPage() {
  const t = useTranslations("admin.auditLogs");
  const locale = useLocale();
  const base = `/${locale}`;

  const { data: stats } = useAuditLogStats();

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
      // Export errors surface via browser download failure
    }
  };

  return (
    <div className="space-y-8 pb-24">
      {/* Header + Breadcrumb */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <nav className="mb-2 flex font-sarabun text-body-sm text-text-muted">
            <Link href={`${base}/admin`} className="hover:text-[#0081A7]">
              Admin
            </Link>
            <span className="mx-2">&gt;</span>
            <span className="font-semibold text-[#053F5C]">{t("title")}</span>
          </nav>
          <h1 className="font-kanit text-[32px] font-bold leading-tight text-[#053F5C]">
            {t("title")}
          </h1>
          <p className="mt-1 font-sarabun text-body-md text-text-muted">
            {t("subtitle")}
          </p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-full border-2 border-[#053F5C] px-6 py-2.5 font-sarabun text-body-md font-semibold text-[#053F5C] transition-all hover:bg-[#053F5C]/5"
        >
          <DownloadIcon />
          {t("export")}
        </button>
      </header>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <AdminStatsCard
          label={t("statSessions")}
          value={stats?.logins?.toLocaleString() ?? "—"}
          icon={<SessionIcon />}
          iconClassName="bg-blue-50 text-blue-600"
        />
        <AdminStatsCard
          label={t("statDeletions")}
          value={stats?.deletions?.toLocaleString() ?? "—"}
          icon={<DeleteStatIcon />}
          iconClassName="bg-red-50 text-red-500"
        />
        <AdminStatsCard
          label={t("statUploads")}
          value={stats?.uploads?.toLocaleString() ?? "—"}
          icon={<UploadStatIcon />}
          iconClassName="bg-blue-50 text-blue-600"
        />
      </section>

      {/* Filters */}
      <AuditLogFilter
        values={draftFilters}
        onChange={setDraftFilters}
        onSearch={handleSearch}
      />

      {/* Table */}
      <AuditLogTable filters={queryFilters} onPageChange={setPage} />
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}

function SessionIcon() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );
}

function DeleteStatIcon() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
    </svg>
  );
}

function UploadStatIcon() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
    </svg>
  );
}
