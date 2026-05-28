"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import DatasetCard from "@/components/dataset/DatasetCard";
import SubcategoryCard from "@/components/dataset/SubcategoryCard";
import CategoryFilter, {
  parseCategoryFilterParams,
  type CategorySortOption,
} from "@/components/search/CategoryFilter";
import Pagination from "@/components/search/Pagination";
import type { CategoryPageData, SearchResultMock } from "@/data/mockData";

const PAGE_SIZE = 10;

type CategoryPageContentProps = {
  pageData: CategoryPageData;
  datasets: SearchResultMock[];
};

function filterDatasets(
  items: SearchResultMock[],
  selectedAgencies: string[],
  selectedYears: string[],
  selectedFormats: string[]
): SearchResultMock[] {
  return items.filter((item) => {
    if (
      selectedAgencies.length > 0 &&
      !selectedAgencies.includes(item.agencyId)
    ) {
      return false;
    }
    if (
      selectedYears.length > 0 &&
      !selectedYears.includes(String(item.year))
    ) {
      return false;
    }
    if (
      selectedFormats.length > 0 &&
      !selectedFormats.some((f) =>
        item.fileFormats.includes(f as (typeof item.fileFormats)[number])
      )
    ) {
      return false;
    }
    return true;
  });
}

function sortDatasets(
  items: SearchResultMock[],
  sort: CategorySortOption
): SearchResultMock[] {
  const copy = [...items];
  if (sort === "popular") {
    copy.sort((a, b) => b.downloadCount - a.downloadCount);
  } else if (sort === "name") {
    copy.sort((a, b) => a.titleEn.localeCompare(b.titleEn));
  } else {
    copy.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }
  return copy;
}

function ChevronRight() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

export default function CategoryPageContent({
  pageData,
  datasets,
}: CategoryPageContentProps) {
  const t = useTranslations("category");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const { sort, selectedAgencies, selectedYears, selectedFormats, page } =
    parseCategoryFilterParams(searchParams);

  const base = `/${locale}`;
  const isTh = locale === "th";
  const { category, subcategory, level } = pageData;

  const pageTitle = subcategory
    ? isTh
      ? subcategory.nameTh
      : subcategory.nameEn
    : isTh
      ? category.nameTh
      : category.nameEn;

  const allDatasets = datasets;

  const { totalCount, pageItems, totalPages } = useMemo(() => {
    const filtered = filterDatasets(
      allDatasets,
      selectedAgencies,
      selectedYears,
      selectedFormats
    );
    const sorted = sortDatasets(filtered, sort);
    const totalCount = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    const currentPage = Math.min(Math.max(1, page), totalPages);
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = sorted.slice(start, start + PAGE_SIZE);

    return { totalCount, pageItems, totalPages };
  }, [allDatasets, selectedAgencies, selectedYears, selectedFormats, sort, page]);

  useEffect(() => {
    setMobileFilterOpen(false);
  }, [searchParams.toString()]);

  useEffect(() => {
    if (!mobileFilterOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileFilterOpen]);

  const filterPanel = (
    <CategoryFilter
      sort={sort}
      selectedAgencies={selectedAgencies}
      selectedYears={selectedYears}
      selectedFormats={selectedFormats}
    />
  );

  return (
    <>
      <section className="border-b border-border-default/60 bg-surface-card px-4 py-spacing-6 md:px-spacing-10">
        <div className="mx-auto max-w-container-max">
          <nav
            className="mb-4 flex flex-wrap items-center gap-2 font-sarabun text-caption text-text-muted"
            aria-label="Breadcrumb"
          >
            <Link href={base} className="hover:text-primary-dark">
              {t("breadcrumbHome")}
            </Link>
            <ChevronRight />
            <Link href={`${base}/search`} className="hover:text-primary-dark">
              {t("breadcrumbCategories")}
            </Link>
            {level === 2 && (
              <>
                <ChevronRight />
                <Link
                  href={`${base}/categories/${category.slug}`}
                  className="hover:text-primary-dark"
                >
                  {isTh ? category.nameTh : category.nameEn}
                </Link>
              </>
            )}
            <ChevronRight />
            <span className="line-clamp-1 text-text-secondary">{pageTitle}</span>
          </nav>

          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="font-kanit text-heading-2 text-text-primary md:text-heading-1">
                {pageTitle}
              </h1>
              <p className="mt-1 font-sarabun text-label text-text-muted">
                {t("foundCount", { count: totalCount })}
              </p>
            </div>
          </div>

          {level === 1 && category.subcategories.length > 0 && (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {category.subcategories.map((sub) => (
                <SubcategoryCard
                  key={sub.slug}
                  slug={sub.slug}
                  name={isTh ? sub.nameTh : sub.nameEn}
                  datasetCount={sub.datasetCount}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-container-max px-4 py-spacing-4 md:px-spacing-10">
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="flex min-h-[44px] items-center gap-2 rounded-radius-md border border-border-input bg-surface-card px-4 font-sarabun text-label font-medium text-text-primary shadow-level-1"
          >
            <svg className="h-5 w-5 text-primary-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            {t("filter.showFilters")}
          </button>
        </div>

        <div className="flex gap-spacing-6">
          <aside className="hidden w-[280px] shrink-0 lg:block">
            <div className="sticky top-[108px] rounded-radius-lg border border-border-default/80 bg-surface-card p-6 shadow-level-1">
              {filterPanel}
            </div>
          </aside>

          <section className="min-w-0 flex-1">
            <p className="mb-6 font-sarabun text-label text-text-muted">
              {t("datasets", { count: totalCount })}
            </p>

            {pageItems.length === 0 ? (
              <div className="rounded-radius-lg border border-border-default bg-surface-card p-12 text-center">
                <p className="font-sarabun text-body-md text-text-secondary">
                  {t("noResults")}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {pageItems.map((item) => (
                  <DatasetCard
                    key={item.id}
                    id={item.id}
                    title={isTh ? item.titleTh : item.titleEn}
                    category={isTh ? item.categoryTh : item.categoryEn}
                    agency={isTh ? item.agencyTh : item.agencyEn}
                    status={item.status}
                    downloadCount={item.downloadCount}
                    createdAt={item.createdAt}
                    updatedAt={item.updatedAt}
                    license={item.license}
                    variant="popular"
                  />
                ))}
              </div>
            )}

            <Pagination
              currentPage={Math.min(page, totalPages)}
              totalPages={totalPages}
            />
          </section>
        </div>
      </div>

      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-text-primary/40"
            onClick={() => setMobileFilterOpen(false)}
            aria-label={t("filter.closeFilters")}
          />
          <div className="absolute inset-y-0 left-0 flex w-[min(320px,90vw)] flex-col bg-surface-page shadow-level-3">
            <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
              <span className="font-kanit text-heading-3-mobile text-primary-dark">
                {t("filter.title")}
              </span>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="rounded-radius-sm p-2 text-text-muted hover:bg-surface-container"
                aria-label={t("filter.closeFilters")}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">{filterPanel}</div>
          </div>
        </div>
      )}
    </>
  );
}
