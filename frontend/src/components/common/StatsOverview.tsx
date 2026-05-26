"use client";

import { useLocale, useTranslations } from "next-intl";
import { useStatsOverview } from "@/hooks/useStatsOverview";

function StatSkeleton() {
  return (
    <div className="flex flex-col text-center sm:text-left">
      <div className="mx-auto h-10 w-24 animate-pulse rounded-radius-sm bg-white/30 sm:mx-0" />
      <div className="mx-auto mt-2 h-4 w-32 animate-pulse rounded-radius-sm bg-white/20 sm:mx-0" />
    </div>
  );
}

export default function StatsOverview() {
  const t = useTranslations("home.hero");
  const locale = useLocale();
  const { data, isLoading, isError } = useStatsOverview();

  if (isLoading) {
    return (
      <div className="mt-12 grid w-full max-w-4xl grid-cols-1 gap-6 border-t border-white/20 pt-12 sm:grid-cols-3 sm:gap-6">
        <StatSkeleton />
        <StatSkeleton />
        <StatSkeleton />
      </div>
    );
  }

  if (isError || !data) {
    return null;
  }

  const items = [
    {
      value: data.total_datasets.toLocaleString(locale),
      label: t("statsDatasets"),
    },
    {
      value: data.total_downloads.toLocaleString(locale),
      label: t("statsDownloads"),
    },
    {
      value: data.total_agencies.toLocaleString(locale),
      label: t("statsAgencies"),
    },
  ];

  return (
    <div className="mt-12 grid w-full max-w-4xl grid-cols-1 gap-6 border-t border-white/20 pt-12 sm:grid-cols-3 sm:gap-6">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col text-center sm:text-left">
          <span className="font-kanit text-[40px] font-bold leading-none text-white md:text-display">
            {item.value}
          </span>
          <span className="mt-1 font-sarabun text-label font-medium uppercase tracking-wide text-white/80">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
