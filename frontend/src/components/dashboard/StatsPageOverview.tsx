"use client";

import { useLocale, useTranslations } from "next-intl";
import StatsCard from "@/components/dashboard/StatsCard";
import { formatCompactCount } from "@/components/dashboard/chartUtils";
import { useStatsOverview } from "@/hooks/useStatsOverview";
import { getStatsOverviewFooters } from "@/utils/statsOverviewFooters";

function StatsCardSkeleton() {
  return (
    <div className="animate-pulse rounded-radius-md border border-border-default bg-surface-card p-spacing-6 shadow-level-1">
      <div className="mb-2 h-4 w-24 rounded-radius-sm bg-surface-container" />
      <div className="h-10 w-20 rounded-radius-sm bg-surface-container" />
    </div>
  );
}

export default function StatsPageOverview() {
  const t = useTranslations("stats");
  const locale = useLocale();
  const { data: overview, isLoading, isError } = useStatsOverview();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError || !overview) {
    return (
      <p className="font-sarabun text-body-md text-status-error" role="alert">
        {t("loadError")}
      </p>
    );
  }

  const footers = getStatsOverviewFooters(overview, t);
  const totalDatasets = overview.total_datasets.toLocaleString(locale);
  const totalAgencies = overview.total_agencies.toLocaleString(locale);
  const totalDownloads = formatCompactCount(overview.total_downloads, locale);
  const totalCategories = overview.total_categories_level1.toLocaleString(locale);

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
      <StatsCard
        label={t("totalDatasets")}
        value={totalDatasets}
        footer={footers.datasetsFooter}
        valueClassName="text-text-primary"
      />
      <StatsCard
        label={t("totalAgencies")}
        value={totalAgencies}
        footer={footers.agenciesFooter}
        valueClassName="text-primary-dark"
      />
      <StatsCard
        label={t("totalDownloads")}
        value={totalDownloads}
        footer={footers.downloadsFooter}
        valueClassName="text-primary"
      />
      <StatsCard
        label={t("totalCategories")}
        value={totalCategories}
        footer={footers.categoriesFooter}
        valueClassName="text-status-draft"
      />
    </div>
  );
}
