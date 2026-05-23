"use client";

import { useLocale, useTranslations } from "next-intl";
import { MOCK_HOME_STATS } from "@/data/mockData";

export default function StatsOverview() {
  const t = useTranslations("home.hero");
  const locale = useLocale();

  const items = [
    {
      value: MOCK_HOME_STATS.totalDatasets.toLocaleString(locale),
      label: t("statsDatasets"),
    },
    {
      value: MOCK_HOME_STATS.totalDownloads.toLocaleString(locale),
      label: t("statsDownloads"),
    },
    {
      value: MOCK_HOME_STATS.totalAgencies.toLocaleString(locale),
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
