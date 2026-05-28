"use client";

import { useLocale, useTranslations } from "next-intl";
import { type FormEvent, useState } from "react";
import {
  MOCK_FILTER_AGENCIES,
  MOCK_FILTER_FORMATS,
  MOCK_FILTER_YEARS,
} from "@/data/mockData";
import FilterTree from "./FilterTree";
import {
  parseListParam,
  toggleListParam,
  useSearchParamsUpdate,
} from "./useSearchParamsUpdate";

type SearchFilterProps = {
  selectedCategory: string | null;
  selectedAgencies: string[];
  selectedYears: string[];
  selectedFormats: string[];
  selectedTag: string;
  filterQuery: string;
  className?: string;
};

export default function SearchFilter({
  selectedCategory,
  selectedAgencies,
  selectedYears,
  selectedFormats,
  selectedTag,
  filterQuery,
  className = "",
}: SearchFilterProps) {
  const t = useTranslations("search");
  const locale = useLocale();
  const updateParams = useSearchParamsUpdate();
  const [localFilter, setLocalFilter] = useState(filterQuery);

  function handleFilterInResults(e: FormEvent) {
    e.preventDefault();
    updateParams({ fq: localFilter.trim() || null });
  }

  function toggleAgency(id: string) {
    const next = toggleListParam(selectedAgencies, id);
    updateParams({ agency: next.length ? next.join(",") : null });
  }

  function toggleYear(year: string) {
    const next = toggleListParam(selectedYears, year);
    updateParams({ year: next.length ? next.join(",") : null });
  }

  function toggleFormat(id: string) {
    const next = toggleListParam(selectedFormats, id);
    updateParams({ format: next.length ? next.join(",") : null });
  }

  function clearAll() {
    updateParams({
      category: null,
      agency: null,
      year: null,
      format: null,
      tag: null,
      license: null,
      fq: null,
      page: null,
    });
    setLocalFilter("");
  }

  return (
    <div
      className={`flex flex-col gap-6 rounded-radius-lg border border-border-default/80 bg-surface-card p-6 shadow-level-1 ${className}`}
    >
      <div>
        <h2 className="mb-4 font-sarabun text-heading-3-mobile font-bold text-text-primary md:text-heading-3">
          {t("filterTitle")}
        </h2>
        <form onSubmit={handleFilterInResults} className="flex gap-2">
          <input
            type="search"
            value={localFilter}
            onChange={(e) => setLocalFilter(e.target.value)}
            placeholder={t("filterInResults")}
            className="flex-1 rounded-radius-md border border-border-input px-3 py-2 font-sarabun text-label text-text-primary outline-none focus:border-border-focus focus:ring-1 focus:ring-primary-dark/30"
          />
          <button
            type="submit"
            className="flex shrink-0 items-center justify-center rounded-radius-md bg-primary px-3 py-2 text-white transition-colors hover:bg-primary-hover"
            aria-label={t("submit")}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </form>
      </div>

      <FilterTree selectedCategory={selectedCategory} />

      <hr className="border-border-default/60" />

      <div className="flex flex-col gap-3">
        <span className="font-sarabun text-label font-medium text-text-secondary">
          {t("tag")}
        </span>
        <input
          type="text"
          defaultValue={selectedTag}
          onBlur={(e) => updateParams({ tag: e.target.value.trim() || null })}
          placeholder={t("tagPlaceholder")}
          className="w-full rounded-radius-md border border-border-input px-3 py-2 font-sarabun text-label text-text-primary outline-none focus:border-border-focus focus:ring-1 focus:ring-primary-dark/30"
        />
      </div>

      <hr className="border-border-default/60" />

      <div className="flex flex-col gap-3">
        <span className="font-sarabun text-label font-medium text-text-secondary">
          {t("agency")}
        </span>
        {MOCK_FILTER_AGENCIES.map((agency) => {
          const label = locale === "th" ? agency.labelTh : agency.labelEn;
          const checked = selectedAgencies.includes(agency.id);
          return (
            <label
              key={agency.id}
              className="group flex cursor-pointer items-center gap-3"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleAgency(agency.id)}
                className="h-5 w-5 rounded-radius-sm border-border-input accent-primary-dark focus:ring-primary-dark/30"
              />
              <span
                className={`font-sarabun text-label transition-colors group-hover:text-primary-dark ${
                  checked ? "font-bold text-primary-dark" : "text-text-primary"
                }`}
              >
                {label}
              </span>
            </label>
          );
        })}
      </div>

      <hr className="border-border-default/60" />

      <div className="flex flex-col gap-3">
        <span className="font-sarabun text-label font-medium text-text-secondary">
          {t("academicYear")}
        </span>
        {MOCK_FILTER_YEARS.map((year) => {
          const checked = selectedYears.includes(year);
          return (
            <label key={year} className="group flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleYear(year)}
                className="h-5 w-5 rounded-radius-sm border-border-input accent-primary-dark focus:ring-primary-dark/30"
              />
              <span
                className={`font-sarabun text-label transition-colors group-hover:text-primary-dark ${
                  checked ? "font-bold text-primary-dark" : "text-text-primary"
                }`}
              >
                {year}
              </span>
            </label>
          );
        })}
      </div>

      <hr className="border-border-default/60" />

      <div className="flex flex-col gap-3">
        <span className="font-sarabun text-label font-medium text-text-secondary">
          {t("fileFormat")}
        </span>
        <div className="flex flex-wrap gap-2">
          {MOCK_FILTER_FORMATS.map((fmt) => {
            const active = selectedFormats.includes(fmt.id);
            return (
              <button
                key={fmt.id}
                type="button"
                onClick={() => toggleFormat(fmt.id)}
                className={`rounded-radius-full border px-3 py-1 font-sarabun text-caption font-medium transition-colors ${
                  active
                    ? "border-primary/30 bg-primary text-white"
                    : "border-border-default/80 bg-surface-container text-text-secondary hover:bg-primary-light"
                }`}
              >
                {fmt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-2 flex flex-col gap-3">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-radius-md border-2 border-primary-dark py-2.5 font-sarabun text-label font-medium text-primary-dark transition-colors hover:bg-primary-light"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
          {t("saveSearch")}
        </button>
        <button
          type="button"
          onClick={clearAll}
          className="w-full py-2 font-sarabun text-label text-status-error transition-colors hover:underline"
        >
          {t("clearFilter")}
        </button>
      </div>
    </div>
  );
}

export function useSearchFilterParams(searchParams: URLSearchParams) {
  return {
    selectedCategory: searchParams.get("category"),
    selectedAgencies: parseListParam(searchParams.get("agency")),
    selectedYears: parseListParam(searchParams.get("year")),
    selectedFormats: parseListParam(searchParams.get("format")),
    selectedTag: searchParams.get("tag") ?? "",
    filterQuery: searchParams.get("fq") ?? "",
  };
}
