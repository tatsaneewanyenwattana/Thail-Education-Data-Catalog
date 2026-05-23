"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import AgencyDatasetTable from "@/components/dataset/AgencyDatasetTable";
import DeleteDatasetModal from "@/components/dataset/DeleteDatasetModal";
import type { AgencyDatasetRow } from "@/data/mockData";
import type { AgencyDatasetStatusFilter } from "@/hooks/useAgencyDatasets";

export default function AgencyDatasetsPage() {
  const t = useTranslations("agency.datasets");
  const locale = useLocale();
  const base = `/${locale}`;

  const [activeTab, setActiveTab] = useState<AgencyDatasetStatusFilter>("all");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<AgencyDatasetRow | null>(
    null
  );
  const [deleteTitle, setDeleteTitle] = useState("");
  const [toastError, setToastError] = useState<string | null>(null);

  const tabs: { id: AgencyDatasetStatusFilter; label: string }[] = [
    { id: "all", label: t("filterAll") },
    { id: "draft", label: t("filterDraft") },
    { id: "published", label: t("filterPublished") },
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
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="font-kanit text-[28px] font-bold text-text-primary">
            {t("title")}
          </h1>
        </div>
        <Link
          href={`${base}/datasets/create`}
          className="inline-flex items-center justify-center gap-2 rounded-radius-lg bg-primary px-6 py-2.5 font-sarabun text-label font-medium text-surface-card shadow-level-1 transition-opacity hover:opacity-90"
        >
          <PlusIcon />
          {t("uploadNew")}
        </Link>
      </header>

      <div className="flex items-center gap-6 border-b border-border-default">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`border-b-2 pb-3 font-kanit text-label font-medium transition-colors ${
                isActive
                  ? "border-primary-dark text-primary-dark"
                  : "border-transparent text-text-muted hover:text-primary-dark"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {toastError && (
        <div
          className="rounded-radius-md border border-status-error bg-status-error-bg px-4 py-3 font-sarabun text-label text-status-error"
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
    </div>
  );
}

function PlusIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
    </svg>
  );
}
