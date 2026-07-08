"use client";

import { useLocale, useTranslations } from "next-intl";
import DownloadChart from "@/components/dashboard/DownloadChart";
import RecentDatasetTable from "@/components/dashboard/RecentDatasetTable";
import ActivityLog from "@/components/agency/ActivityLog";
import ScholarshipsList from "@/components/agency/ScholarshipsList";
import { useAgencyDashboard } from "@/hooks/useAgencyDashboard";
import { useAuthStore } from "@/stores/useAuthStore";

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
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-20 animate-pulse rounded-2xl bg-white/60" />
      ))}
    </div>
  );
}

function DatasetIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M4 4h16v4H4V4Zm0 6h10v4H4v-4Zm0 6h16v4H4v-4Z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  );
}

function DraftIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 9h-4V3H9v6H5l7 7 7-7ZM5 18v2h14v-2H5Z" />
    </svg>
  );
}

export default function AgencyDashboardPage() {
  const t = useTranslations("agency.dashboard");
  const locale = useLocale();
  const { user } = useAuthStore();
  const { data: stats, isLoading, isError, error } = useAgencyDashboard();

  return (
    <div className="-m-6 lg:-m-10 min-h-full bg-[#F0F2F5] p-6 lg:p-10 space-y-5 pb-12">
      <header
        className="relative overflow-hidden rounded-2xl p-6 lg:p-7"
        style={{ background: "linear-gradient(135deg, #01579b 0%, #0277bd 60%, #0288d1 100%)" }}
      >
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="font-kanit text-xl font-bold text-white">
              สวัสดี{user?.agency_name ? `, ${user.agency_name}` : ""}
            </h1>
            <p className="mt-1 font-sarabun text-sm text-white/70">
              ภาพรวมข้อมูลของหน่วยงานคุณ
            </p>
          </div>
        </div>
        <div className="absolute -right-5 -top-5 h-28 w-28 rounded-full bg-white/[0.06]" />
        <div className="absolute right-16 -bottom-8 h-20 w-20 rounded-full bg-white/[0.04]" />
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
          <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e3f2fd] text-[#01579b]">
                <DatasetIcon />
              </div>
              <div>
                <p className="font-kanit text-xl font-bold text-gray-900">
                  {stats.totalDatasets.toLocaleString(locale === "th" ? "th-TH" : "en-US")}
                </p>
                <p className="font-sarabun text-xs text-gray-500">Dataset ทั้งหมด</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f5e9] text-[#2e7d32]">
                <CheckIcon />
              </div>
              <div>
                <p className="font-kanit text-xl font-bold text-gray-900">
                  {stats.publishedDatasets.toLocaleString(locale === "th" ? "th-TH" : "en-US")}
                </p>
                <p className="font-sarabun text-xs text-gray-500">{t("published")}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fce4ec] text-[#c62828]">
                <DraftIcon />
              </div>
              <div>
                <p className="font-kanit text-xl font-bold text-gray-900">
                  {stats.draftDatasets.toLocaleString(locale === "th" ? "th-TH" : "en-US")}
                </p>
                <p className="font-sarabun text-xs text-gray-500">{t("draft")}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e3f2fd] text-[#1565c0]">
                <DownloadIcon />
              </div>
              <div>
                <p className="font-kanit text-xl font-bold text-gray-900">
                  {formatCompactNumber(stats.totalDownloads, locale)}
                </p>
                <p className="font-sarabun text-xs text-gray-500">{t("totalDownloads")}</p>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.3fr_1fr]">
            <DownloadChart data={stats.monthlyDownloads} />
            <ActivityLog />
          </div>

          <ScholarshipsList />

          <RecentDatasetTable limit={5} />
        </>
      ) : null}
    </div>
  );
}
