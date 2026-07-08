"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchFilters } from "@/hooks/useSearchFilters";
import {
  parseListParam,
  toggleListParam,
  useSearchParamsUpdate,
} from "./useSearchParamsUpdate";

export type CategorySortOption = "newest" | "popular" | "name";

type CategoryFilterProps = {
  sort: CategorySortOption;
  selectedAgencies: string[];
  selectedYears: string[];
  selectedFormats: string[];
  className?: string;
};

export function parseCategorySortParam(value: string | null): CategorySortOption {
  if (value === "popular" || value === "name") return value;
  return "newest";
}

export function parseCategoryFilterParams(searchParams: URLSearchParams) {
  return {
    sort: parseCategorySortParam(searchParams.get("sort")),
    selectedAgencies: parseListParam(searchParams.get("agency")),
    selectedYears: parseListParam(searchParams.get("year")),
    selectedFormats: parseListParam(searchParams.get("format")),
    page: Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1),
  };
}

export default function CategoryFilter({
  sort,
  selectedAgencies,
  selectedYears,
  selectedFormats,
  className = "",
}: CategoryFilterProps) {
  const t = useTranslations("category.filter");
  const locale = useLocale();
  const isTh = locale === "th";
  const updateParams = useSearchParamsUpdate();
  const { data: filters } = useSearchFilters();

  function setSort(next: CategorySortOption) {
    updateParams({ sort: next === "newest" ? null : next });
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
      sort: null,
      agency: null,
      year: null,
      format: null,
      page: null,
    });
  }

  const sortOptions: { value: CategorySortOption; label: string }[] = [
    { value: "newest", label: t("newest") },
    { value: "popular", label: t("popular") },
    { value: "name", label: t("name") },
  ];

  return (
    <div className={`flex flex-col gap-8 ${className}`}>
      <section>
        <h4 className="mb-4 font-kanit text-label font-semibold text-text-primary">
          {t("sort")}
        </h4>
        <div className="space-y-3">
          {sortOptions.map((option) => (
            <label
              key={option.value}
              className="group flex cursor-pointer items-center gap-3"
            >
              <input
                type="radio"
                name="category-sort"
                checked={sort === option.value}
                onChange={() => setSort(option.value)}
                className="h-4 w-4 border-border-input text-primary focus:ring-primary"
              />
              <span className="font-sarabun text-label text-text-secondary transition-colors group-hover:text-text-primary">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </section>

      <section>
        <h4 className="mb-4 font-kanit text-label font-semibold text-text-primary">
          {t("agency")}
        </h4>
        <div className="space-y-3">
          {(filters?.agencies ?? []).map((agency) => {
            const checked = selectedAgencies.includes(agency.agency_user_id);
            return (
              <label
                key={agency.agency_user_id}
                className="group flex cursor-pointer items-center gap-3"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleAgency(agency.agency_user_id)}
                  className="h-4 w-4 rounded-radius-sm border-border-input text-primary focus:ring-primary"
                />
                <span
                  className={`font-sarabun text-label transition-colors group-hover:text-text-primary ${
                    checked ? "font-medium text-primary-dark" : "text-text-secondary"
                  }`}
                >
                  {agency.agency_name}
                </span>
              </label>
            );
          })}
        </div>
      </section>

      <section>
        <h4 className="mb-4 font-kanit text-label font-semibold text-text-primary">
          {t("year")}
        </h4>
        <div className="space-y-3">
          {(filters?.years ?? []).map((year) => {
            const yearStr = String(year);
            const displayYear = isTh ? String(year + 543) : yearStr;
            const checked = selectedYears.includes(yearStr);
            return (
              <label
                key={year}
                className="group flex cursor-pointer items-center gap-3"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleYear(yearStr)}
                  className="h-4 w-4 rounded-radius-sm border-border-input text-primary focus:ring-primary"
                />
                <span
                  className={`font-sarabun text-label transition-colors group-hover:text-text-primary ${
                    checked ? "font-medium text-primary-dark" : "text-text-secondary"
                  }`}
                >
                  {displayYear}
                </span>
              </label>
            );
          })}
        </div>
      </section>

      <section>
        <h4 className="mb-4 font-kanit text-label font-semibold text-text-primary">
          {t("format")}
        </h4>
        <div className="space-y-3">
          {(filters?.formats ?? []).map((fmt) => {
            const checked = selectedFormats.includes(fmt);
            return (
              <label
                key={fmt}
                className="group flex cursor-pointer items-center gap-3"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleFormat(fmt)}
                  className="h-4 w-4 rounded-radius-sm border-border-input text-primary focus:ring-primary"
                />
                <span
                  className={`font-sarabun text-label transition-colors group-hover:text-text-primary ${
                    checked ? "font-medium text-primary-dark" : "text-text-secondary"
                  }`}
                >
                  {fmt.toUpperCase()}
                </span>
              </label>
            );
          })}
        </div>
      </section>

      <button
        type="button"
        onClick={clearAll}
        className="w-full rounded-radius-md border border-status-error/20 py-2 font-kanit text-label font-semibold text-status-error transition-colors hover:bg-status-error-bg/30"
      >
        {t("clear")}
      </button>
    </div>
  );
}
