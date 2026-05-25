"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import AdminDatasetChart from "@/components/admin/AdminDatasetChart";
import AdminDownloadChart from "@/components/admin/AdminDownloadChart";
import AdminStatsCard from "@/components/admin/AdminStatsCard";
import PendingUserTable from "@/components/admin/PendingUserTable";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";

function UsersIcon() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3Zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3Zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5Zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5Z" />
    </svg>
  );
}

function DatasetsIcon() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M5 9.2h3V19H5V9.2zM10.6 5h2.8v14h-2.8V5zm5.6 8H19v6h-2.8v-6z" />
    </svg>
  );
}

function HourglassIcon() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6 2v6h.01L6 8.01 10 12l-4 4 0.01 0.01H6V22h12v-5.99h-0.01L18 16l-4-4 4-3.99-0.01-0.01H18V2H6zm10 14.5V20H8v-3.5l4-4 4 4zm-4-7-4-4V4h8v1.5l-4 4z" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 9h-4V3H9v6H5l7 7 7-7ZM5 18v2h14v-2H5Z" />
    </svg>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-spacing-6 md:grid-cols-2 xl:grid-cols-4">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="h-36 animate-pulse rounded-radius-lg bg-surface-container"
        />
      ))}
    </div>
  );
}

export default function AdminDashboardPage() {
  const t = useTranslations("admin.dashboard");
  const locale = useLocale();
  const { data, isLoading } = useAdminDashboard();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);

  const numberLocale = locale === "th" ? "th-TH" : "en-US";

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

  return (
    <div className="mx-auto max-w-container-max space-y-spacing-8 pb-24">
      <header>
        <h1 className="font-kanit text-[32px] font-bold leading-tight text-text-primary">
          {t("title")}
        </h1>
        <p className="mt-1 font-sarabun text-body-md text-text-muted">
          {t("subtitle")}
        </p>
      </header>

      {isLoading && !data ? (
        <StatsSkeleton />
      ) : data ? (
        <>
          <section className="grid grid-cols-1 gap-spacing-6 md:grid-cols-2 xl:grid-cols-4">
            <AdminStatsCard
              label={t("totalUsers")}
              value={data.totalUsers.toLocaleString(numberLocale)}
              icon={<UsersIcon />}
              iconClassName="bg-surface-container text-status-draft"
              badge={
                <span className="rounded-radius-sm bg-status-published-bg px-2 py-1 font-sarabun text-caption font-bold text-status-published">
                  +{data.userTrendPercent}%
                </span>
              }
            />
            <AdminStatsCard
              label={t("totalDatasets")}
              value={data.totalDatasets.toLocaleString(numberLocale)}
              icon={<DatasetsIcon />}
              iconClassName="bg-primary-light text-primary-dark"
              badge={
                <span className="rounded-radius-sm bg-primary-light px-2 py-1 font-sarabun text-caption font-bold text-primary-dark">
                  +{data.datasetTrendPercent}%
                </span>
              }
            />
            <AdminStatsCard
              label={t("pendingUsers")}
              value={data.pendingUsers.toLocaleString(numberLocale)}
              icon={<HourglassIcon />}
              variant="warning"
              badge={<span className="h-2 w-2 animate-pulse rounded-radius-full bg-status-error" />}
            />
            <AdminStatsCard
              label={t("todayDownloads")}
              value={data.todayDownloads.toLocaleString(numberLocale)}
              icon={<DownloadIcon />}
              iconClassName="bg-status-published-bg text-status-published"
              badge={
                <span className="font-sarabun text-caption font-medium text-text-muted">
                  {t("todayBadge")}
                </span>
              }
            />
          </section>

          <section className="grid grid-cols-1 gap-spacing-6 lg:grid-cols-2">
            <AdminDatasetChart data={data.datasetsByMonth} />
            <AdminDownloadChart data={data.downloadsByMonth} />
          </section>

          <PendingUserTable
            users={data.pendingUserList}
            onSuccess={showToast}
            onError={showError}
          />
        </>
      ) : null}

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
