"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import AgencyDatasetTable from "@/components/dataset/AgencyDatasetTable";
import DeleteDatasetModal from "@/components/dataset/DeleteDatasetModal";
import MoveDatasetCategoryModal from "@/components/dataset/MoveDatasetCategoryModal";
import type { AgencyDatasetRow } from "@/types/dataset";
import {
  useAgencyDatasets,
  useAgencyDatasetYears,
  type AgencyDatasetStatusFilter,
} from "@/hooks/useAgencyDatasets";
import { useAgencyDashboard } from "@/hooks/useAgencyDashboard";
import { useAgencyCategoryTree } from "@/hooks/useAgencyCategories";
import { useMoveDatasetCategory } from "@/hooks/useMoveDatasetCategory";

export default function AgencyDatasetsPage() {
  const t = useTranslations("agency.datasets");
  const locale = useLocale();
  const base = `/${locale}`;

  const [activeTab, setActiveTab] = useState<AgencyDatasetStatusFilter>("all");
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<AgencyDatasetRow | null>(
    null
  );
  const [deleteTitle, setDeleteTitle] = useState("");
  const [toastError, setToastError] = useState<string | null>(null);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const [moveTarget, setMoveTarget] = useState<AgencyDatasetRow | null>(null);
  const { data: categoryTree } = useAgencyCategoryTree();
  const moveMutation = useMoveDatasetCategory();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: yearsList } = useAgencyDatasetYears();
  const { data: dashStats } = useAgencyDashboard();
  const totalCount = dashStats?.totalDatasets ?? 0;
  const publishedCount = dashStats?.publishedDatasets ?? 0;
  const draftCount = dashStats?.draftDatasets ?? 0;
  const totalDownloads = dashStats?.totalDownloads ?? 0;

  const tabs: {
    id: AgencyDatasetStatusFilter;
    label: string;
    count: number;
  }[] = [
    { id: "all", label: t("filterAll"), count: totalCount },
    { id: "draft", label: t("filterDraft"), count: draftCount },
    { id: "published", label: t("filterPublished"), count: publishedCount },
  ];

  const handleTabChange = (tab: AgencyDatasetStatusFilter) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleDeleteRequest = (dataset: AgencyDatasetRow, title: string) => {
    setDeleteTarget(dataset);
    setDeleteTitle(title);
  };

  return (
    <div className="space-y-6">
      <header
        className="relative overflow-hidden rounded-2xl p-6 lg:p-7"
        style={{ background: "linear-gradient(135deg, #01579b 0%, #0277bd 60%, #0288d1 100%)" }}
      >
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-kanit text-xl font-bold text-white">
              {t("title")}
            </h1>
            <p className="mt-1 font-sarabun text-sm text-white/70">
              {t("subtitle")}
            </p>
          </div>
          <Link
            href={`${base}/datasets/create`}
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 font-sarabun text-label font-medium text-[#01579b] shadow-sm transition-all hover:bg-white/90 active:scale-[0.97]"
          >
            <PlusIcon />
            {t("uploadNew")}
          </Link>
        </div>
        <div className="absolute -right-5 -top-5 h-28 w-28 rounded-full bg-white/[0.06]" />
        <div className="absolute right-16 -bottom-8 h-20 w-20 rounded-full bg-white/[0.04]" />
      </header>

      {/* Tabs + Filters */}
      <div className="flex flex-col gap-4 border-b border-border-default/40 md:flex-row md:items-end md:justify-between">
        <div className="flex items-center gap-4">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`border-b-2 px-4 pb-2.5 font-sarabun text-label font-semibold transition-all ${
                  isActive
                    ? "border-b-[#01579b] text-[#01579b]"
                    : "border-b-transparent text-text-muted hover:text-text-secondary"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="h-10 w-full rounded-xl border-none bg-[#f0f2f5] pl-10 pr-4 font-sarabun text-body-md text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[#01579b]/25 md:w-[260px]"
            />
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              <SearchIcon />
            </span>
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setYearDropdownOpen((v) => !v)}
              onBlur={() => setTimeout(() => setYearDropdownOpen(false), 150)}
              className="flex h-10 items-center gap-2 rounded-xl border-none bg-[#f0f2f5] px-4 font-sarabun text-label text-text-primary transition-all focus:outline-none focus:ring-2 focus:ring-[#01579b]/25"
            >
              <span>{selectedYear ? t("fiscalYear", { year: selectedYear }) : t("allYears")}</span>
              <svg className={`h-4 w-4 text-text-muted transition-transform ${yearDropdownOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
              </svg>
            </button>
            {yearDropdownOpen && (
              <div className="absolute right-0 top-full z-20 mt-1 min-w-[180px] overflow-hidden rounded-xl border border-border-default/60 bg-white py-1 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                <button
                  type="button"
                  onMouseDown={() => { setSelectedYear(undefined); setPage(1); setYearDropdownOpen(false); }}
                  className={`flex w-full items-center px-4 py-2.5 font-sarabun text-label transition-colors hover:bg-primary-light/50 ${selectedYear === undefined ? "font-semibold text-primary-dark" : "text-text-primary"}`}
                >
                  {t("allYears")}
                </button>
                {yearsList?.map((y) => (
                  <button
                    key={y}
                    type="button"
                    onMouseDown={() => { setSelectedYear(y); setPage(1); setYearDropdownOpen(false); }}
                    className={`flex w-full items-center px-4 py-2.5 font-sarabun text-label transition-colors hover:bg-primary-light/50 ${selectedYear === y ? "font-semibold text-primary-dark" : "text-text-primary"}`}
                  >
                    {t("fiscalYear", { year: y })}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          icon={<PublishIcon />}
          iconBg="bg-primary-light"
          iconColor="text-primary-dark"
          label={t("publishedTotal")}
          value={t("itemCount", { count: publishedCount })}
        />
        <SummaryCard
          icon={<StarIcon />}
          iconBg="bg-[#ffddb5]"
          iconColor="text-[#f9a825]"
          label={t("totalDatasetsLabel")}
          value={t("itemCount", { count: totalCount })}
        />
        <SummaryCard
          icon={<TrendIcon />}
          iconBg="bg-[#e8f5e9]"
          iconColor="text-[#43a047]"
          label={t("downloadTotal")}
          value={t("downloadCount", { count: totalDownloads.toLocaleString() })}
        />
      </div>

      {toastError && (
        <div
          className="rounded-xl border border-status-error bg-status-error-bg px-4 py-3 font-sarabun text-label text-status-error"
          role="alert"
        >
          {toastError}
        </div>
      )}

      <AgencyDatasetTable
        status={activeTab}
        page={page}
        onPageChange={setPage}
        onDelete={handleDeleteRequest}
        onMoveCategory={(dataset) => { setMoveTarget(dataset); setToastError(null); }}
        search={debouncedSearch || undefined}
        year={selectedYear}
      />

      <DeleteDatasetModal
        open={Boolean(deleteTarget)}
        dataset={deleteTarget}
        locale={locale}
        title={deleteTitle}
        onClose={() => {
          setDeleteTarget(null);
          setDeleteTitle("");
        }}
        onError={(message) => setToastError(message)}
      />

      {moveTarget && categoryTree && (
        <MoveDatasetCategoryModal
          datasetTitle={moveTarget.title}
          currentCategoryId={moveTarget.categoryId}
          allNodes={categoryTree.tree}
          isLoading={moveMutation.isPending}
          onCancel={() => setMoveTarget(null)}
          theme="agency"
          onConfirm={(targetCategoryId) => {
            moveMutation.mutate(
              { datasetId: moveTarget.id, categoryId: targetCategoryId },
              {
                onSuccess: () => setMoveTarget(null),
                onError: () => setToastError(t("moveCategoryError")),
              }
            );
          }}
        />
      )}
    </div>
  );
}

function SummaryCard({
  icon,
  iconBg,
  iconColor,
  label,
  value,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white px-6 py-6 shadow-[0_4px_12px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-full ${iconBg} ${iconColor}`}
      >
        {icon}
      </div>
      <div>
        <p className="font-sarabun text-[11px] font-medium uppercase tracking-wide text-text-muted">{label}</p>
        <p className="font-kanit text-[22px] font-bold leading-tight text-text-primary">
          {value}
        </p>
      </div>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}


function PublishIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 9h-4V3H9v6H5l7 7 7-7ZM5 18v2h14v-2H5Z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}

function TrendIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="m16 6 2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z" />
    </svg>
  );
}
