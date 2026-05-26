"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import DatasetCard from "@/components/dataset/DatasetCard";
import { useCategories } from "@/hooks/useCategories";
import { useNewReleases } from "@/hooks/useNewReleases";
import { useTrendingDatasets } from "@/hooks/useTrendingDatasets";
import { mapApiDatasetToHomeCard } from "@/utils/statsMappers";

type HomeDatasetSectionClientProps = {
  locale: string;
  variant: "popular" | "latest";
};

function DatasetCardSkeleton() {
  return (
    <div className="animate-pulse rounded-radius-md border border-border-default bg-surface-card p-spacing-6 shadow-level-1">
      <div className="mb-4 h-5 w-3/4 rounded-radius-sm bg-surface-container" />
      <div className="mb-2 h-4 w-1/2 rounded-radius-sm bg-surface-container" />
      <div className="h-4 w-2/3 rounded-radius-sm bg-surface-container" />
    </div>
  );
}

export default function HomeDatasetSectionClient({
  locale,
  variant,
}: HomeDatasetSectionClientProps) {
  const t = useTranslations(
    variant === "popular" ? "home.popular" : "home.latest"
  );
  const uiLocale = useLocale();

  const trendingQuery = useTrendingDatasets();
  const newReleasesQuery = useNewReleases();
  const { data: categories = [] } = useCategories();

  const query = variant === "popular" ? trendingQuery : newReleasesQuery;
  const datasets = (query.data?.datasets ?? []).map((d) =>
    mapApiDatasetToHomeCard(d, categories, uiLocale)
  );

  const bgClass =
    variant === "popular" ? "bg-surface-page" : "bg-surface-card";

  return (
    <section className={`py-12 md:py-20 ${bgClass}`}>
      <div className="mx-auto max-w-container-max px-4 md:px-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between md:mb-10">
          <div>
            <h2 className="font-kanit text-heading-2 text-text-primary">
              {t("title")}
            </h2>
            <p className="mt-2 font-sarabun text-body-md text-text-secondary">
              {t("subtitle")}
            </p>
          </div>
          <Link
            href={`/${locale}/search`}
            className="inline-flex shrink-0 items-center gap-1 font-sarabun text-label font-bold text-primary hover:underline"
          >
            {t("viewAll")}
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>

        {query.isLoading && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <DatasetCardSkeleton key={i} />
            ))}
          </div>
        )}

        {query.isError && (
          <p className="font-sarabun text-body-md text-status-error" role="alert">
            {query.error?.message ?? t("loadError")}
          </p>
        )}

        {query.isSuccess && datasets.length === 0 && (
          <p className="font-sarabun text-body-md text-text-muted">
            {t("empty")}
          </p>
        )}

        {query.isSuccess && datasets.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {datasets.map((dataset) => (
              <DatasetCard key={dataset.id} {...dataset} variant={variant} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
