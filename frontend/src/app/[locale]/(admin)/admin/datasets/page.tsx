"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import AdminDatasetTable from "@/components/admin/AdminDatasetTable";
import AdminStatsCard from "@/components/admin/AdminStatsCard";
import type { AdminDatasetsFilters } from "@/types/admin";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { useAdminDatasets } from "@/hooks/useAdminDatasets";

type StatusFilter = "all" | "published" | "draft";

export default function AdminDatasetsPage() {
  const t = useTranslations("admin.datasets");
  const locale = useLocale();
  const base = `/${locale}`;
  const numberLocale = locale === "th" ? "th-TH" : "en-US";

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
  const { data: dashData } = useAdminDashboard();

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
  const totalDatasets = dashData?.totalDatasets ?? 0;
  const publishedCount = agenciesData?.total ?? 0;
  const draftCount = totalDatasets - publishedCount;

  return (
    <div className="mx-auto max-w-container-max space-y-6 pb-24">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-kanit text-[28px] font-bold leading-tight text-text-primary">
            {t("title")}
          </h1>
          <nav className="mt-1 flex font-sarabun text-label text-text-muted">
            <Link href={base} className="hover:text-primary-dark">
              {t("breadcrumbHome")}
            </Link>
            <span className="mx-2">/</span>
            <span className="font-medium text-primary-dark">{t("breadcrumbDatasets")}</span>
          </nav>
        </div>
        <Link
          href={`${base}/datasets/create`}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-primary-dark px-6 py-2.5 font-sarabun text-label font-medium text-white shadow-md transition-all hover:bg-primary-hover hover:shadow-lg"
        >
          <UploadIcon />
          {t("uploadDataset")}
        </Link>
      </header>

      {dashData ? (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <AdminStatsCard
            label={t("totalDatasets")}
            value={totalDatasets.toLocaleString(numberLocale)}
            icon={<DatasetIcon />}
            iconClassName="bg-blue-50 text-blue-600"
            badge={
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-sarabun text-caption font-bold text-emerald-600">
                +{dashData.datasetTrendPercent}%
              </span>
            }
          />
          <AdminStatsCard
            label={t("publishedDatasets")}
            value={publishedCount.toLocaleString(numberLocale)}
            icon={<CheckCircleIcon />}
            iconClassName="bg-emerald-50 text-emerald-600"
            badge={
              <span className="flex items-center gap-1 font-sarabun text-caption font-medium text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {t("activeStatus")}
              </span>
            }
          />
          <AdminStatsCard
            label={t("draftPending")}
            value={draftCount > 0 ? draftCount.toLocaleString(numberLocale) : "0"}
            icon={<DraftIcon />}
            variant="warning"
            badge={
              <span className="flex items-center gap-1 font-sarabun text-caption font-medium text-status-warning">
                <span className="h-2 w-2 animate-pulse rounded-full bg-status-warning" />
                {t("awaitingReview")}
              </span>
            }
          />
        </section>
      ) : null}

      <section className="rounded-2xl border border-white/80 bg-white p-6 shadow-md">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[280px] flex-1">
            <label className="mb-2 block font-sarabun text-label font-medium text-text-muted">
              {t("search")}
            </label>
            <div className="relative">
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
                className="h-11 w-full rounded-full border border-gray-200 bg-gray-50 pl-10 pr-4 font-sarabun text-body-md shadow-sm transition-all hover:border-gray-300 focus:border-primary-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-dark/20"
              />
            </div>
          </div>

          <FilterDropdown
            label={t("owningAgency")}
            value={agencyFilter}
            onChange={(v) => {
              setAgencyFilter(v);
              applyFilters({ agency: v });
            }}
            options={[
              { value: "all", label: t("filterAllAgency") },
              ...agencies.map((a) => ({ value: a, label: a })),
            ]}
          />

          <FilterDropdown
            label={t("filterStatus")}
            value={statusFilter}
            onChange={(v) => {
              const val = v as StatusFilter;
              setStatusFilter(val);
              applyFilters({ status: val });
            }}
            options={[
              { value: "all", label: t("filterAllStatus") },
              { value: "published", label: t("status.published") },
              { value: "draft", label: t("status.draft") },
            ]}
          />

          <button
            type="button"
            onClick={() => applyFilters()}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-primary-dark px-6 py-2.5 font-sarabun text-label font-medium text-white shadow-md transition-all hover:bg-primary-hover hover:shadow-lg"
          >
            <FilterBtnIcon />
          </button>
        </div>
      </section>

      <AdminDatasetTable
        filters={queryFilters}
        onPageChange={setPage}
        onSuccess={showToast}
        onError={showError}
      />

      {toastMessage ? (
        <div className="fixed bottom-6 right-6 z-[110] rounded-2xl bg-primary-dark px-4 py-3 font-sarabun text-label text-white shadow-lg">
          {toastMessage}
        </div>
      ) : null}
      {toastError ? (
        <div className="fixed bottom-6 right-6 z-[110] rounded-2xl bg-status-error px-4 py-3 font-sarabun text-label text-white shadow-lg">
          {toastError}
        </div>
      ) : null}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function FilterBtnIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M10 18h4v-2h-4v2ZM3 6v2h18V6H3Zm3 7h12v-2H6v2Z" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.65 6.35A7.96 7.96 0 0 0 12 4c-3.73 0-6.85 2.55-7.73 6h-.27A4 4 0 0 0 4 18h13a3.5 3.5 0 0 0 .65-6.93zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
    </svg>
  );
}

function DatasetIcon() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  );
}

function DraftIcon() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zM6 20V4h5v7h7v9H6z" />
    </svg>
  );
}


function FilterDropdown({
  value,
  options,
  onChange,
  label,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative w-full sm:w-48" ref={ref}>
      <span className="mb-2 block font-sarabun text-label font-medium text-text-muted">
        {label}
      </span>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-full items-center justify-between rounded-full border border-gray-200 bg-gray-50 px-4 font-sarabun text-body-md text-text-primary shadow-sm transition-all hover:border-gray-300 hover:shadow-md"
      >
        <span className="truncate">{selected?.label ?? "—"}</span>
        <svg className="h-4 w-4 shrink-0 text-gray-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-1.5 max-h-60 w-full overflow-y-auto overflow-x-hidden rounded-2xl border border-gray-200 bg-white py-1 shadow-lg">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`flex w-full px-4 py-2.5 font-sarabun text-label transition-colors ${
                opt.value === value
                  ? "bg-primary-dark/10 font-bold text-primary-dark"
                  : "text-text-primary hover:bg-gray-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
