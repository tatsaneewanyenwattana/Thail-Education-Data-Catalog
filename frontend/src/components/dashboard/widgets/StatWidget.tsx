"use client";

import { useLocale, useTranslations } from "next-intl";
import { mockWidgetStatData } from "@/data/mockData";

export default function StatWidget() {
  const t = useTranslations("agency.customDashboard.widgets");
  const locale = useLocale();
  const stat = mockWidgetStatData;
  const label = locale === "th" ? stat.labelTh : stat.labelEn;

  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-2 px-4 py-6">
      <span className="text-center font-sarabun text-body-md text-text-secondary">
        {label}
      </span>
      <span className="font-kanit text-[48px] font-bold leading-none text-primary-dark">
        {stat.value.toLocaleString(locale === "th" ? "th-TH" : "en-US")}
      </span>
      <span
        className={`flex items-center gap-1 font-sarabun text-label font-medium ${
          stat.trendUp ? "text-status-draft" : "text-status-error"
        }`}
      >
        {stat.trendUp ? <TrendUpIcon /> : <TrendDownIcon />}
        {t("statTrend", { trend: stat.trend })}
      </span>
    </div>
  );
}

function TrendUpIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="m16 6 2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
    </svg>
  );
}

function TrendDownIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="m16 18 2.29-2.29-4.88-4.88-4 4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6z" />
    </svg>
  );
}
