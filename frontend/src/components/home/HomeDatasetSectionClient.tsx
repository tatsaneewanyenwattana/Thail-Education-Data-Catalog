"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import DatasetCard from "@/components/dataset/DatasetCard";
import { useCategories } from "@/hooks/useCategories";
import { useNewReleases } from "@/hooks/useNewReleases";
import { useTrendingDatasets } from "@/hooks/useTrendingDatasets";
import { mapApiDatasetToHomeCard } from "@/utils/statsMappers";

type HomeDatasetSectionClientProps = {
  locale: string;
  variant: "popular" | "latest";
  embedded?: boolean;
};

function PopularCarousel({ datasets }: { datasets: ReturnType<typeof mapApiDatasetToHomeCard>[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activePage, setActivePage] = useState(0);
  const cardsPerPage = 3;
  const totalPages = Math.ceil(datasets.length / cardsPerPage);

  const updateActivePage = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const cardWidth = el.scrollWidth / datasets.length;
    const page = Math.round(scrollLeft / (cardWidth * cardsPerPage));
    setActivePage(Math.min(page, totalPages - 1));
  }, [datasets.length, cardsPerPage, totalPages]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateActivePage, { passive: true });
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      el.removeEventListener("scroll", updateActivePage);
      el.removeEventListener("wheel", handleWheel);
    };
  }, [updateActivePage]);

  const scrollToPage = (page: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.scrollWidth / datasets.length;
    el.scrollTo({ left: cardWidth * cardsPerPage * page, behavior: "smooth" });
  };

  return (
    <div>
      <div
        ref={scrollRef}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 scrollbar-hide"
        style={{ scrollbarWidth: "none" }}
      >
        {datasets.map((dataset, i) => (
          <div key={dataset.id} className="w-[calc((100%-3rem)/3)] min-w-[280px] shrink-0">
            <DatasetCard {...dataset} variant="popular" index={i} />
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollToPage(i)}
              className={`h-2.5 rounded-radius-full transition-all ${
                i === activePage
                  ? "w-8 bg-primary"
                  : "w-2.5 bg-border-default hover:bg-text-muted"
              }`}
              aria-label={`Page ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DatasetCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-border-default bg-surface-card p-spacing-6 shadow-level-1">
      <div className="mb-4 h-5 w-3/4 rounded-radius-sm bg-surface-container" />
      <div className="mb-2 h-4 w-1/2 rounded-radius-sm bg-surface-container" />
      <div className="h-4 w-2/3 rounded-radius-sm bg-surface-container" />
    </div>
  );
}

export default function HomeDatasetSectionClient({
  locale,
  variant,
  embedded = false,
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

  const header = (
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
        className="relative inline-flex shrink-0 items-center gap-1 py-2 pl-5 pr-7 font-sarabun text-label font-bold text-white"
        style={{
          backgroundColor: "#33691e",
          clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%)",
        }}
      >
        {t("viewAll")}
      </Link>
    </div>
  );

  const content = (
    <>
      {query.isLoading && (
        variant === "latest" ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <DatasetCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <DatasetCardSkeleton key={i} />
            ))}
          </div>
        )
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
        variant === "latest" ? (
          <div className="space-y-4">
            {datasets.map((dataset, i) => (
              <DatasetCard key={dataset.id} {...dataset} variant="latest" index={i} />
            ))}
          </div>
        ) : (
          <PopularCarousel datasets={datasets} />
        )
      )}
    </>
  );

  if (embedded) {
    return (
      <>
        {header}
        {content}
      </>
    );
  }

  const bgClass =
    variant === "popular" ? "" : "";

  return (
    <section className={`py-12 md:py-20 ${bgClass}`}>
      <div className="mx-auto max-w-container-max px-4 md:px-10">
        {header}
        {content}
      </div>
    </section>
  );
}
