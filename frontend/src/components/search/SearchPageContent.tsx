"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import SearchBar from "./SearchBar";
import SearchFilter, { useSearchFilterParams } from "./SearchFilter";
import SearchResult, { parseSearchPageParams } from "./SearchResult";

export default function SearchPageContent() {
  const t = useTranslations("search");
  const searchParams = useSearchParams();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const filterParams = useSearchFilterParams(searchParams);
  const resultParams = parseSearchPageParams(searchParams);

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
    <SearchFilter
      selectedCategory={filterParams.selectedCategory}
      selectedAgencies={filterParams.selectedAgencies}
      selectedYears={filterParams.selectedYears}
      selectedFormats={filterParams.selectedFormats}
      selectedTags={filterParams.selectedTags}
      selectedProvince={filterParams.selectedProvince}
      filterQuery={filterParams.filterQuery}
    />
  );

  return (
    <div className="mx-auto max-w-container-max px-4 py-spacing-4 md:px-spacing-10">
      <div className="mb-6 lg:hidden">
        <SearchBar defaultValue={resultParams.keyword} syncUrl />
      </div>

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
          {t("filter")}
        </button>
      </div>

      <div className="flex gap-spacing-6">
        <aside className="hidden w-[280px] shrink-0 lg:block">
          <div className="sticky top-[108px]">{filterPanel}</div>
        </aside>

        <SearchResult {...resultParams} />
      </div>

      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-text-primary/40"
            onClick={() => setMobileFilterOpen(false)}
            aria-label={t("closeFilters")}
          />
          <div className="absolute inset-y-0 left-0 flex w-[min(320px,90vw)] flex-col bg-surface-page shadow-level-3">
            <div className="flex items-center justify-between border-b border-border-default px-4 py-4">
              <h2 className="font-sarabun text-heading-3-mobile font-bold text-text-primary">
                {t("filterTitle")}
              </h2>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-radius-md text-text-muted hover:bg-surface-container"
                aria-label={t("closeFilters")}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">{filterPanel}</div>
          </div>
        </div>
      )}
    </div>
  );
}
