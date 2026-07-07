"use client";

import { useLocale, useTranslations } from "next-intl";
import AgencyStatsCard from "@/components/dashboard/AgencyStatsCard";
import DownloadChart from "@/components/dashboard/DownloadChart";
import RecentDatasetTable from "@/components/dashboard/RecentDatasetTable";
import CategoryCharts from "@/components/agency/CategoryCharts";
import ActivityLog from "@/components/agency/ActivityLog";
import ScholarshipsList from "@/components/agency/ScholarshipsList";
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
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="h-36 animate-pulse rounded-2xl bg-surface-container"
        />
      ))}
    </div>
  );
}

function DatasetIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M4 4h16v4H4V4Zm0 6h10v4H4v-4Zm0 6h16v4H4v-4Z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  );
}

function DraftIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 9h-4V3H9v6H5l7 7 7-7ZM5 18v2h14v-2H5Z" />
    </svg>
  );
}

function TrendUpIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="m16 6 2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6Z" />
    </svg>
  );
}

function TrendBadge({ text, variant = "up" }: { text: string; variant?: "up" | "neutral" }) {
  if (variant === "up") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f5e9] px-2.5 py-1 font-sarabun text-caption font-semibold text-[#2e7d32]">
        <TrendUpIcon />
        {text}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-surface-container px-2.5 py-1 font-sarabun text-caption font-semibold text-text-muted">
      {text}
    </span>
  );
}

export default function AgencyDashboardPage() {
  const t = useTranslations("agency.dashboard");
  const locale = useLocale();
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

  const publishedPercent =
    stats && stats.totalDatasets > 0
      ? Math.round((stats.publishedDatasets / stats.totalDatasets) * 100)
      : 0;

  const trendPercent =
    stats?.datasetsMonthChangePercent !== null &&
    stats?.datasetsMonthChangePercent !== undefined
      ? `${stats.datasetsMonthChangePercent > 0 ? "+" : ""}${stats.datasetsMonthChangePercent}%`
      : null;

  return (
    <div className="-m-6 lg:-m-10 min-h-full bg-[#F0F2F5] p-6 lg:p-10 space-y-6 pb-12">
      <header>
        <h1 className="font-kanit text-[28px] font-bold leading-tight text-text-primary">
          สวัสดี{user?.agency_name ? `, ${user.agency_name}` : ""}
        </h1>
        <p className="mt-1 font-sarabun text-body-md text-text-muted">
          ภาพรวมข้อมูลของหน่วยงานคุณ
        </p>
      </header>

      {isError ? (
        <p className="rounded-2xl border border-status-error/30 bg-status-error/5 px-4 py-3 font-sarabun text-body-md text-status-error">
          {error instanceof Error
            ? error.message
            : "โหลดข้อมูล Dashboard ไม่สำเร็จ"}
        </p>
      ) : null}

      {isLoading && !stats ? (
        <StatsSkeleton />
      ) : stats ? (
        <>
          <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            <div
              className="relative rounded-3xl border-transparent shadow-sm p-6 transition-all hover:shadow-md overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #42bd41 0%, #2d8a2c 100%)",
              }}
            >
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Ccircle cx='250' cy='-20' r='120' fill='rgba(255,255,255,0.15)'/%3E%3Ccircle cx='280' cy='160' r='80' fill='rgba(255,255,255,0.10)'/%3E%3Ccircle cx='40' cy='180' r='60' fill='rgba(255,255,255,0.06)'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right top",
                }}
              />
              <div className="relative z-10">
                {trendPercent && (
                  <div className="mb-5 flex justify-end">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 font-sarabun text-caption font-semibold text-white">
                      <TrendUpIcon />
                      {trendPercent}
                    </span>
                  </div>
                )}
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-white mb-5">
                  <DatasetIcon />
                </div>
                <p className="mb-1 font-sarabun text-sm font-semibold text-white/80">
                  {t("totalDatasets")}
                </p>
                <p className="font-kanit text-[30px] font-bold leading-tight text-white">
                  {stats.totalDatasets.toLocaleString(locale === "th" ? "th-TH" : "en-US")}
                </p>
              </div>
            </div>

            <AgencyStatsCard
              label={t("published")}
              value={stats.publishedDatasets.toLocaleString(
                locale === "th" ? "th-TH" : "en-US"
              )}
              icon={<CheckIcon />}
              iconClassName="bg-white/60 text-[#1e88e5]"
              bgGradient="linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)"
              patternColor="rgba(30,136,229,0.08)"
              trendBadge={
                <TrendBadge text={`${publishedPercent}%`} variant="neutral" />
              }
              progressBar={{ percent: publishedPercent, color: "#29b6f6" }}
              footer={
                <p className="font-sarabun text-caption text-[#1565c0]">
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
              iconClassName="bg-white/60 text-[#f57c00]"
              bgGradient="linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)"
              patternColor="rgba(245,124,0,0.08)"
              footer={
                <p className="font-sarabun text-caption text-[#e65100]">
                  {footers?.draftFooter}
                </p>
              }
            />

            <AgencyStatsCard
              label={t("totalDownloads")}
              value={formatCompactNumber(stats.totalDownloads, locale)}
              icon={<DownloadIcon />}
              iconClassName="bg-white/60 text-[#7e57c2]"
              bgGradient="linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)"
              patternColor="rgba(126,87,194,0.08)"
              trendBadge={
                stats.downloadsThisMonth > 0 ? (
                  <TrendBadge text={`+${stats.downloadsThisMonth.toLocaleString(locale === "th" ? "th-TH" : "en-US")}`} />
                ) : null
              }
              footer={
                <p className="font-sarabun text-caption text-[#4a148c]">
                  {footers?.downloadsFooter}
                </p>
              }
            />
          </section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div className="flex flex-col gap-6">
              <CategoryCharts />
              {stats ? <DownloadChart data={stats.monthlyDownloads} /> : null}
            </div>
            <div className="flex flex-col gap-6">
              <ActivityLog />
              <ScholarshipsList />
            </div>
          </div>

          <RecentDatasetTable limit={5} />
        </>
      ) : null}
    </div>
  );
}
