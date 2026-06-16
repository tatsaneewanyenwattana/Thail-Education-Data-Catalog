"use client";

import { useLocale, useTranslations } from "next-intl";
import { type FormEvent, useMemo, useState } from "react";
import { THAI_PROVINCES } from "@/data/thaiProvinces";
import { useSearchFilters } from "@/hooks/useSearchFilters";
import FilterTree from "./FilterTree";
import {
  parseListParam,
  toggleListParam,
  useSearchParamsUpdate,
} from "./useSearchParamsUpdate";

const FORMAT_LABELS: Record<string, string> = {
  csv: "CSV",
  excel: "XLSX",
  json: "JSON",
  xml: "XML",
  pdf: "PDF",
  sql: "SQL",
};

type SearchFilterProps = {
  selectedCategory: string | null;
  selectedAgencies: string[];
  selectedYears: string[];
  selectedFormats: string[];
  selectedTags: string[];
  selectedProvince: string;
  filterQuery: string;
  className?: string;
};

export default function SearchFilter({
  selectedCategory,
  selectedAgencies,
  selectedYears,
  selectedFormats,
  selectedTags,
  selectedProvince,
  filterQuery,
  className = "",
}: SearchFilterProps) {
  const t = useTranslations("search");
  const locale = useLocale();
  const updateParams = useSearchParamsUpdate();
  const { data: filterOptions } = useSearchFilters({
    categoryId: selectedCategory,
    agencyUserId: selectedAgencies[0] ?? null,
    province: selectedProvince || null,
  });
  const [localFilter, setLocalFilter] = useState(filterQuery);
  const [provinceQuery, setProvinceQuery] = useState("");
  const [provinceOpen, setProvinceOpen] = useState(false);

  const agencyOptions = useMemo(
    () => filterOptions?.agencies ?? [],
    [filterOptions?.agencies]
  );

  const yearOptions = useMemo(
    () => (filterOptions?.years ?? []).map(String),
    [filterOptions?.years]
  );

  const formatOptions = useMemo(
    () => filterOptions?.formats ?? [],
    [filterOptions?.formats]
  );

  const tagOptions = useMemo(
    () => filterOptions?.tags ?? [],
    [filterOptions?.tags]
  );

  const provinceLabelMap = useMemo(() => {
    const map = new Map<string, string>();
    THAI_PROVINCES.forEach((p) =>
      map.set(p.value, locale === "th" ? p.labelTh : p.labelEn)
    );
    map.set("all", t("provinceAll"));
    return map;
  }, [locale, t]);

  const availableProvinces = useMemo(() => {
    const values = filterOptions?.provinces ?? [];
    return values.map((value) => ({
      value,
      label: provinceLabelMap.get(value) ?? value,
    }));
  }, [filterOptions?.provinces, provinceLabelMap]);

  const filteredProvinces = useMemo(() => {
    const query = provinceQuery.trim().toLowerCase();
    if (!query) return availableProvinces.slice(0, 8);
    return availableProvinces
      .filter((p) => p.label.toLowerCase().includes(query))
      .slice(0, 8);
  }, [provinceQuery, availableProvinces]);

  const showAgencyFilter = agencyOptions.length > 0;
  const showYearFilter = yearOptions.length > 0;
  const showFormatFilter = formatOptions.length > 0;
  const showTagFilter = tagOptions.length > 0;
  const showProvinceFilter = availableProvinces.length > 0;
  const showCategoryFilter = (filterOptions?.categories?.length ?? 0) > 0;

  function handleFilterInResults(e: FormEvent) {
    e.preventDefault();
    updateParams({ fq: localFilter.trim() || null, page: null });
  }

  function selectAgency(agencyUserId: string) {
    const isSelected = selectedAgencies.includes(agencyUserId);
    updateParams({
      agency: isSelected ? null : agencyUserId,
      page: null,
    });
  }

  function toggleYear(year: string) {
    const next = toggleListParam(selectedYears, year);
    updateParams({ year: next.length ? next.join(",") : null, page: null });
  }

  function toggleFormat(id: string) {
    const next = toggleListParam(selectedFormats, id);
    updateParams({ format: next.length ? next.join(",") : null, page: null });
  }

  function toggleTag(tag: string) {
    const next = toggleListParam(selectedTags, tag);
    updateParams({ tag: next.length ? next.join(",") : null, page: null });
  }

  function selectProvince(value: string) {
    updateParams({ province: value || null, page: null });
    setProvinceQuery("");
    setProvinceOpen(false);
  }

  function clearProvince() {
    updateParams({ province: null, page: null });
    setProvinceQuery("");
  }

  function clearAll() {
    updateParams({
      category: null,
      agency: null,
      year: null,
      format: null,
      tag: null,
      province: null,
      fq: null,
      page: null,
    });
    setLocalFilter("");
    setProvinceQuery("");
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

      {showCategoryFilter ? (
        <>
          <FilterTree selectedCategory={selectedCategory} />
          <hr className="border-border-default/60" />
        </>
      ) : null}

      {showAgencyFilter ? (
        <>
          <div className="flex flex-col gap-3">
            <span className="font-sarabun text-label font-medium text-text-secondary">
              {t("agency")}
            </span>
            {agencyOptions.map((agency) => {
              const checked = selectedAgencies.includes(agency.agency_user_id);
              return (
                <label
                  key={agency.agency_user_id}
                  className="group flex cursor-pointer items-center gap-3"
                >
                  <input
                    type="radio"
                    name="search-agency-filter"
                    checked={checked}
                    onChange={() => selectAgency(agency.agency_user_id)}
                    className="h-5 w-5 border-border-input accent-primary-dark focus:ring-primary-dark/30"
                  />
                  <span
                    className={`font-sarabun text-label transition-colors group-hover:text-primary-dark ${
                      checked ? "font-bold text-primary-dark" : "text-text-primary"
                    }`}
                  >
                    {agency.agency_name}
                  </span>
                </label>
              );
            })}
          </div>
          <hr className="border-border-default/60" />
        </>
      ) : null}

      {showTagFilter ? (
        <>
          <hr className="border-border-default/60" />

          <div className="flex flex-col gap-3">
            <span className="font-sarabun text-label font-medium text-text-secondary">
              {t("tag")}
            </span>
            <div className="flex flex-wrap gap-2">
              {tagOptions.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`rounded-radius-full border px-3 py-1 font-sarabun text-caption font-medium transition-colors ${
                      active
                        ? "border-primary/30 bg-primary text-white"
                        : "border-border-default/80 bg-surface-container text-text-secondary hover:bg-primary-light"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      ) : null}

      {showYearFilter ? (
        <>
          <hr className="border-border-default/60" />

          <div className="flex flex-col gap-3">
            <span className="font-sarabun text-label font-medium text-text-secondary">
              {t("academicYear")}
            </span>
            {yearOptions.map((year) => {
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
        </>
      ) : null}

      {showFormatFilter ? (
        <>
          <hr className="border-border-default/60" />

          <div className="flex flex-col gap-3">
            <span className="font-sarabun text-label font-medium text-text-secondary">
              {t("fileFormat")}
            </span>
            <div className="flex flex-wrap gap-2">
              {formatOptions.map((fmt) => {
                const active = selectedFormats.includes(fmt);
                return (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => toggleFormat(fmt)}
                    className={`rounded-radius-full border px-3 py-1 font-sarabun text-caption font-medium transition-colors ${
                      active
                        ? "border-primary/30 bg-primary text-white"
                        : "border-border-default/80 bg-surface-container text-text-secondary hover:bg-primary-light"
                    }`}
                  >
                    {FORMAT_LABELS[fmt] ?? fmt.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      ) : null}

      {showProvinceFilter ? (
        <>
          <hr className="border-border-default/60" />

          <div className="flex flex-col gap-3">
            <span className="font-sarabun text-label font-medium text-text-secondary">
              {t("province")}
            </span>
            {selectedProvince ? (
              <div className="flex items-center justify-between gap-2 rounded-radius-md border border-primary/30 bg-primary-light px-3 py-2">
                <span className="font-sarabun text-label font-medium text-primary-dark">
                  {provinceLabelMap.get(selectedProvince) ?? selectedProvince}
                </span>
                <button
                  type="button"
                  onClick={clearProvince}
                  className="text-primary-dark transition-colors hover:text-status-error"
                  aria-label={t("clearFilter")}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  value={provinceQuery}
                  onChange={(e) => {
                    setProvinceQuery(e.target.value);
                    setProvinceOpen(true);
                  }}
                  onFocus={() => setProvinceOpen(true)}
                  onBlur={() => setTimeout(() => setProvinceOpen(false), 150)}
                  placeholder={t("provincePlaceholder")}
                  className="w-full rounded-radius-md border border-border-input px-3 py-2 font-sarabun text-label text-text-primary outline-none focus:border-border-focus focus:ring-1 focus:ring-primary-dark/30"
                />
                {provinceOpen && filteredProvinces.length > 0 ? (
                  <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-radius-md border border-border-default bg-surface-card shadow-level-2">
                    {filteredProvinces.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          selectProvince(p.value);
                        }}
                        className="block w-full px-3 py-2 text-left font-sarabun text-label text-text-primary transition-colors hover:bg-primary-light"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </>
      ) : null}

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
    selectedTags: parseListParam(searchParams.get("tag")),
    selectedProvince: searchParams.get("province") ?? "",
    filterQuery: searchParams.get("fq") ?? "",
  };
}
