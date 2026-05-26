"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import CompareChart from "@/components/dashboard/CompareChart";
import { useDatasetDetail } from "@/hooks/useDatasetDetail";
import { useStatsCompare } from "@/hooks/useStatsCompare";
import { useTrendingDatasets } from "@/hooks/useTrendingDatasets";

type DatasetComparePageClientProps = {
  primaryId: string;
  locale: string;
};

export default function DatasetComparePageClient({
  primaryId,
  locale,
}: DatasetComparePageClientProps) {
  const t = useTranslations("compare");
  const uiLocale = useLocale();
  const base = `/${locale}`;

  const [secondaryId, setSecondaryId] = useState("");

  const { data: primaryDataset, isLoading: primaryLoading } =
    useDatasetDetail(primaryId);
  const { data: trendingData, isLoading: listLoading } = useTrendingDatasets();

  const compareIds = useMemo(
    () => (secondaryId ? [primaryId, secondaryId] : []),
    [primaryId, secondaryId]
  );

  const {
    data: compareData,
    isLoading: compareLoading,
    isError: compareIsError,
    error: compareError,
  } = useStatsCompare(compareIds, Boolean(secondaryId));

  const options = (trendingData?.datasets ?? []).filter(
    (d) => d.id !== primaryId
  );

  const primaryTitle = primaryDataset?.title ?? t("currentDataset");

  return (
    <div className="mx-auto max-w-container-max px-4 py-spacing-6 md:px-spacing-10">
      <nav className="mb-6 font-sarabun text-caption text-text-muted">
        <Link href={base} className="hover:text-primary-dark">
          {uiLocale === "th" ? "หน้าหลัก" : "Home"}
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`${base}/datasets/${primaryId}`}
          className="hover:text-primary-dark"
        >
          {primaryTitle}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-text-secondary">{t("pageTitle")}</span>
      </nav>

      <h1 className="mb-2 font-kanit text-heading-2 text-text-primary md:text-heading-1">
        {t("pageTitle")}
      </h1>
      <p className="mb-8 font-sarabun text-body-md text-text-secondary">
        {t("currentDataset")}:{" "}
        <span className="font-medium text-text-primary">{primaryTitle}</span>
      </p>

      <div className="mb-8 max-w-xl rounded-radius-lg border border-border-default bg-surface-card p-spacing-6 shadow-level-1">
        <label
          htmlFor="compare-second"
          className="mb-2 block font-sarabun text-label font-medium text-text-primary"
        >
          {t("selectSecond")}
        </label>
        <select
          id="compare-second"
          value={secondaryId}
          onChange={(e) => setSecondaryId(e.target.value)}
          disabled={listLoading || primaryLoading}
          className="min-h-[44px] w-full rounded-radius-md border border-border-input bg-surface-card px-4 font-sarabun text-body-md text-text-primary focus:border-border-focus focus:outline-none focus:ring-1 focus:ring-primary-dark/30"
        >
          <option value="">{t("compareWith")}…</option>
          {options.map((d) => (
            <option key={d.id} value={d.id}>
              {d.title}
            </option>
          ))}
        </select>
      </div>

      {!secondaryId && (
        <p className="font-sarabun text-body-md text-text-muted">
          {t("selectSecond")}
        </p>
      )}

      {secondaryId && compareLoading && (
        <div className="animate-pulse rounded-radius-lg border border-border-default bg-surface-card p-8">
          <div className="h-64 rounded-radius-md bg-surface-container" />
        </div>
      )}

      {secondaryId && compareIsError && (
        <p className="font-sarabun text-body-md text-status-error" role="alert">
          {compareError?.message ?? "Error"}
        </p>
      )}

      {secondaryId &&
        compareData?.datasets &&
        compareData.datasets.length >= 2 && (
          <CompareChart datasets={compareData.datasets} />
        )}
    </div>
  );
}
