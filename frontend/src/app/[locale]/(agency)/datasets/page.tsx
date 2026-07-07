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
      {/* Breadcrumb */}
      <nav className="font-sarabun text-caption uppercase tracking-wider text-text-muted">
        <span>DATASETS</span>
        <span className="mx-2">›</span>
        <span className="font-semibold text-text-primary">MY REPOSITORY</span>
      </nav>

      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="font-kanit text-[28px] font-bold text-text-primary">
            {t("title")}
          </h1>
          <p className="mt-1 font-sarabun text-body-md text-text-muted">
            จัดการและตรวจสอบข้อมูลการศึกษาที่คุณเผยแพร่เข้าสู่ระบบ
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`${base}/datasets/create`}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0d5302] px-5 py-2.5 font-sarabun text-label font-medium text-white shadow-level-1 transition-opacity hover:opacity-90"
          >
            <PlusIcon />
            {t("uploadNew")}
          </Link>
        </div>
      </header>

      {/* Tabs + Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`inline-flex items-center gap-2 rounded-t-lg border-b-2 px-5 py-2.5 font-sarabun text-label font-medium transition-all ${
                  isActive
                    ? "border-b-primary-dark text-primary-dark"
                    : "border-b-transparent text-text-muted hover:border-b-border-default hover:text-text-secondary"
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span
                    className={`inline-flex min-w-[22px] items-center justify-center rounded-full px-1.5 py-0.5 font-sarabun text-[11px] font-bold ${
                      isActive
                        ? "bg-[#0d5302] text-white"
                        : "bg-surface-container text-text-muted"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
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
              placeholder="ค้นหาชื่อ Dataset หรือหมวดหมู่..."
              className="h-10 w-full rounded-xl border border-border-input bg-surface-card pl-10 pr-4 font-sarabun text-body-md text-text-primary placeholder:text-text-muted focus:border-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-dark/20 md:w-[260px]"
            />
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              <SearchIcon />
            </span>
          </div>
          <select
            value={selectedYear ?? ""}
            onChange={(e) => {
              setSelectedYear(e.target.value ? Number(e.target.value) : undefined);
              setPage(1);
            }}
            className="h-10 rounded-xl border border-border-input bg-surface-card px-3 font-sarabun text-label text-text-muted focus:border-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-dark/20"
          >
            <option value="">ทุกปี</option>
            {yearsList?.map((y) => (
              <option key={y} value={y}>ปีงบประมาณ {y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard
          icon={<PublishIcon />}
          iconBg="bg-primary-light"
          iconColor="text-primary-dark"
          label="เผยแพร่สำเร็จรวม"
          value={`${publishedCount} รายการ`}
        />
        <SummaryCard
          icon={<StarIcon />}
          iconBg="bg-[#fff3e0]"
          iconColor="text-[#f57c00]"
          label="Dataset ทั้งหมด"
          value={`${totalCount} รายการ`}
        />
        <SummaryCard
          icon={<TrendIcon />}
          iconBg="bg-[#e8f5e9]"
          iconColor="text-[#43a047]"
          label="การดาวน์โหลดรวม"
          value={`${totalDownloads.toLocaleString()} ครั้ง`}
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
          onConfirm={(targetCategoryId) => {
            moveMutation.mutate(
              { datasetId: moveTarget.id, categoryId: targetCategoryId },
              {
                onSuccess: () => setMoveTarget(null),
                onError: () => setToastError("ย้ายหมวดหมู่ไม่สำเร็จ"),
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
    <div className="flex items-center gap-4 rounded-2xl border border-border-default/60 bg-surface-card px-6 py-5 shadow-level-1">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-full ${iconBg} ${iconColor}`}
      >
        {icon}
      </div>
      <div>
        <p className="font-sarabun text-caption text-text-muted">{label}</p>
        <p className="font-kanit text-heading-3-mobile font-bold text-text-primary">
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
