"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import AdminDatasetTable from "@/components/admin/AdminDatasetTable";
import type { AdminDatasetsFilters } from "@/data/mockData";
import { useAdminDatasets } from "@/hooks/useAdminDatasets";

type StatusFilter = "all" | "published" | "draft";

export default function AdminDatasetsPage() {
  const t = useTranslations("admin.datasets");
  const locale = useLocale();
  const base = `/${locale}`;

  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [agencyFilter, setAgencyFilter] = useState("all");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedStatus, setAppliedStatus] = useState<StatusFilter>("all");
  const [appliedAgency, setAppliedAgency] = useState("all");
  const [page, setPage] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);

  const { data: agenciesData } = useAdminDatasets({ page: 1 });

  const queryFilters: AdminDatasetsFilters = useMemo(
    () => ({
      search: appliedSearch || undefined,
      status: appliedStatus,
      agency: appliedAgency,
      page,
    }),
    [appliedSearch, appliedStatus, appliedAgency, page]
  );

  const applyFilters = (next?: {
    search?: string;
    status?: StatusFilter;
    agency?: string;
  }) => {
    setAppliedSearch(next?.search ?? searchInput.trim());
    setAppliedStatus(next?.status ?? statusFilter);
    setAppliedAgency(next?.agency ?? agencyFilter);
    setPage(1);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastError(null);
    window.setTimeout(() => setToastMessage(null), 3000);
  };

  const showError = (message: string) => {
    setToastError(message);
    setToastMessage(null);
    window.setTimeout(() => setToastError(null), 3000);
  };

  const agencies = agenciesData?.agencies ?? [];

  return (
    <div className="mx-auto max-w-container-max space-y-spacing-8 pb-24">
      <header>
        <h1 className="font-kanit text-[28px] font-bold leading-tight text-text-primary">
          {t("title")}
        </h1>
      </header>

      <section className="rounded-radius-lg border border-border-default bg-surface-card p-4 shadow-level-1 md:p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative min-w-[280px] flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              <SearchIcon />
            </span>
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  applyFilters();
                }
              }}
              placeholder={t("searchPlaceholder")}
              className="h-10 w-full rounded-radius-sm border border-border-input bg-surface-card pl-10 pr-4 font-sarabun text-body-md focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-primary-dark/20"
            />
          </div>

          <select
            value={agencyFilter}
            onChange={(event) => {
              const value = event.target.value;
              setAgencyFilter(value);
              applyFilters({ agency: value });
            }}
            aria-label={t("filterAgency")}
            className="h-10 min-w-[180px] rounded-radius-sm border border-border-input bg-surface-card px-3 font-sarabun text-body-md focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-primary-dark/20"
          >
            <option value="all">{t("filterAllAgency")}</option>
            {agencies.map((agency) => (
              <option key={agency} value={agency}>
                {agency}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => {
              const value = event.target.value as StatusFilter;
              setStatusFilter(value);
              applyFilters({ status: value });
            }}
            aria-label={t("filterStatus")}
            className="h-10 min-w-[140px] rounded-radius-sm border border-border-input bg-surface-card px-3 font-sarabun text-body-md focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-primary-dark/20"
          >
            <option value="all">{t("filterAllStatus")}</option>
            <option value="published">{t("status.published")}</option>
            <option value="draft">{t("status.draft")}</option>
          </select>

          <Link
            href={`${base}/datasets/create`}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-radius-sm bg-primary-dark px-6 py-2.5 font-sarabun text-label font-medium text-white shadow-level-1 transition-colors hover:bg-primary-hover"
          >
            <PlusIcon />
            {t("createDataset")}
          </Link>
        </div>
      </section>

      <AdminDatasetTable
        filters={queryFilters}
        onPageChange={setPage}
        onSuccess={showToast}
        onError={showError}
      />

      {toastMessage ? (
        <div className="fixed bottom-6 right-6 z-[110] rounded-radius-md bg-primary-dark px-4 py-3 font-sarabun text-label text-white shadow-level-3">
          {toastMessage}
        </div>
      ) : null}
      {toastError ? (
        <div className="fixed bottom-6 right-6 z-[110] rounded-radius-md bg-status-error px-4 py-3 font-sarabun text-label text-white shadow-level-3">
          {toastError}
        </div>
      ) : null}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
  );
}
