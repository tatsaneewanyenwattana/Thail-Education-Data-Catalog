"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import AgencyStatsCard from "@/components/dashboard/AgencyStatsCard";
import DownloadChart from "@/components/dashboard/DownloadChart";
import RecentDatasetTable from "@/components/dashboard/RecentDatasetTable";
import { useAgencyDashboard } from "@/hooks/useAgencyDashboard";
import { useAuthStore } from "@/stores/useAuthStore";
import { getAgencyDashboardFooters } from "@/utils/agencyDashboardFooters";

function formatCompactNumber(value: number, locale: string): string {
  if (value >= 1000) {
    const compact = value / 1000;
    const formatted = compact.toLocaleString(locale === "th" ? "th-TH" : "en-US", {
      maximumFractionDigits: 1,
    });
    return `${formatted}k`;
  }
  return value.toLocaleString(locale === "th" ? "th-TH" : "en-US");
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-spacing-6 md:grid-cols-2 xl:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="h-32 animate-pulse rounded-radius-lg bg-surface-container"
        />
      ))}
    </div>
  );
}

function AnalyticsIcon() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3 13h2v8H3v-8Zm4-6h2v14H7V7Zm4 4h2v10h-2V11Zm4-8h2v18h-2V3Zm4 12h2v6h-2v-6Z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  );
}

function DraftIcon() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
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

function TrendUpIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="m16 6 2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6Z" />
    </svg>
  );
}

export default function AgencyDashboardPage() {
  const t = useTranslations("agency.dashboard");
  const locale = useLocale();
  const base = `/${locale}`;
  const { user } = useAuthStore();
  const { data: stats, isLoading, isError, error } = useAgencyDashboard();

  const footers = stats
    ? getAgencyDashboardFooters(
        {
          totalDatasets: stats.totalDatasets,
          publishedDatasets: stats.publishedDatasets,
          draftDatasets: stats.draftDatasets,
          submittedDatasets: stats.submittedDatasets,
          datasetsCreatedThisMonth: stats.datasetsCreatedThisMonth,
          datasetsCreatedLastMonth: stats.datasetsCreatedLastMonth,
          datasetsMonthChangePercent: stats.datasetsMonthChangePercent,
          downloadsThisMonth: stats.downloadsThisMonth,
          topDownloadFormat: stats.topDownloadFormat,
          topDownloadFormatPercent: stats.topDownloadFormatPercent,
        },
        t
      )
    : null;

  return (
    <div className="space-y-spacing-8 pb-24">
      <header>
        <h1 className="font-kanit text-[28px] font-bold leading-tight text-text-primary">
          {t("title")}
        </h1>
        <p className="mt-1 font-sarabun text-body-md text-text-muted">
          {user?.agency_name ?? t("agencyFallback")}
        </p>
      </header>

      {isError ? (
        <p className="rounded-radius-lg border border-status-error/30 bg-status-error/5 px-4 py-3 font-sarabun text-body-md text-status-error">
          {error instanceof Error
            ? error.message
            : "โหลดข้อมูล Dashboard ไม่สำเร็จ"}
        </p>
      ) : null}

      {isLoading && !stats ? (
        <StatsSkeleton />
      ) : stats ? (
        <section className="grid grid-cols-1 gap-spacing-6 md:grid-cols-2 xl:grid-cols-4">
          <AgencyStatsCard
            label={t("totalDatasets")}
            value={stats.totalDatasets.toLocaleString(
              locale === "th" ? "th-TH" : "en-US"
            )}
            icon={<AnalyticsIcon />}
            footer={
              <p className="flex items-center gap-1 font-sarabun text-caption font-medium text-primary-dark">
                <TrendUpIcon />
                {footers?.totalFooter}
              </p>
            }
          />
          <AgencyStatsCard
            label={t("published")}
            value={stats.publishedDatasets.toLocaleString(
              locale === "th" ? "th-TH" : "en-US"
            )}
            icon={<CheckIcon />}
            iconClassName="bg-primary-light text-primary"
            footer={
              <p className="font-sarabun text-caption font-medium text-text-muted">
                {footers?.publishedFooter}
              </p>
            }
          />
          <AgencyStatsCard
            label={t("draft")}
            value={stats.draftDatasets.toLocaleString(
              locale === "th" ? "th-TH" : "en-US"
            )}
            icon={<DraftIcon />}
            iconClassName="bg-status-draft-bg text-status-draft"
            footer={
              <p className="font-sarabun text-caption font-medium text-status-draft">
                {footers?.draftFooter}
              </p>
            }
          />
          <AgencyStatsCard
            label={t("totalDownloads")}
            value={formatCompactNumber(stats.totalDownloads, locale)}
            icon={<DownloadIcon />}
            footer={
              <p className="flex items-center gap-1 font-sarabun text-caption font-medium text-primary-dark">
                <TrendUpIcon />
                {footers?.downloadsFooter}
              </p>
            }
          />
        </section>
      ) : null}

      {stats ? <DownloadChart data={stats.monthlyDownloads} /> : null}

      <RecentDatasetTable limit={5} />

      <Link
        href={`${base}/datasets/create`}
        className="fixed bottom-8 right-8 z-40 flex items-center gap-2 rounded-radius-full bg-primary-dark px-6 py-3.5 font-sarabun text-label font-medium text-surface-card shadow-level-2 transition-transform hover:scale-105"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-3.96ZM12 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.66-3.73 3.71-3.98l.49-.05.43-.07.08-.49C8.83 7.69 10.22 6 12 6c2.76 0 5 2.24 5 5h1c1.66 0 3 1.34 3 3s-1.34 3-3 3h-6v-2h4.5c.83 0 1.5-.67 1.5-1.5S17.33 12 16.5 12H12v6Z" />
        </svg>
        {t("uploadNew")}
      </Link>
    </div>
  );
}
