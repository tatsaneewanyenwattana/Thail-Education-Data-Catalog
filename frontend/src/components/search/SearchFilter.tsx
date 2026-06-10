"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { type FormEvent, useMemo, useState } from "react";
import { THAI_PROVINCES } from "@/data/thaiProvinces";
import apiClient from "@/services/api";
import FilterTree from "./FilterTree";
import {
  parseListParam,
  toggleListParam,
  useSearchParamsUpdate,
} from "./useSearchParamsUpdate";

const LICENSE_OPTIONS = ["open", "conditional", "cc"] as const;

const FORMAT_OPTIONS = [
  { id: "csv", label: "CSV" },
  { id: "excel", label: "XLSX" },
  { id: "json", label: "JSON" },
  { id: "xml", label: "XML" },
] as const;

type PublicAgency = {
  agency_user_id: string;
  agency_name: string | null;
  agency_name_en?: string | null;
};

type SearchFilterProps = {
  selectedCategory: string | null;
  selectedAgencies: string[];
  selectedYears: string[];
  selectedFormats: string[];
  selectedTag: string;
  selectedLicense: string;
  selectedProvince: string;
  filterQuery: string;
  className?: string;
};

export default function SearchFilter({
  selectedCategory,
  selectedAgencies,
  selectedYears,
  selectedFormats,
  selectedTag,
  selectedLicense,
  selectedProvince,
  filterQuery,
  className = "",
}: SearchFilterProps) {
  const t = useTranslations("search");
  const locale = useLocale();
  const updateParams = useSearchParamsUpdate();
  const [localFilter, setLocalFilter] = useState(filterQuery);
  const [provinceQuery, setProvinceQuery] = useState("");
  const [provinceOpen, setProvinceOpen] = useState(false);

  // TODO: แสดง filter หน่วยงานเมื่อ GET /api/v1/public/agencies พร้อมใช้งาน
  const { data: agencies } = useQuery({
    queryKey: ["public", "agencies"],
    queryFn: async (): Promise<PublicAgency[] | null> => {
      try {
        const response = await apiClient.get("/public/agencies");
        const data = (response.data as { data?: PublicAgency[] }).data;
        return data ?? [];
      } catch {
        return null;
      }
    },
    retry: false,
    staleTime: 10 * 60 * 1000,
  });

  const yearOptions = useMemo(() => {
    const currentBE = new Date().getFullYear() + 543;
    return Array.from({ length: 10 }, (_, index) =>
      String(currentBE - index)
    );
  }, []);

  const provinceLabelMap = useMemo(() => {
    const map = new Map<string, string>();
    THAI_PROVINCES.forEach((p) =>
      map.set(p.value, locale === "th" ? p.labelTh : p.labelEn)
    );
    return map;
  }, [locale]);

  const filteredProvinces = useMemo(() => {
    const query = provinceQuery.trim().toLowerCase();
    const options = THAI_PROVINCES.map((p) => ({
      value: p.value,
      label: locale === "th" ? p.labelTh : p.labelEn,
    }));
    if (!query) return options.slice(0, 5);
    return options
      .filter((p) => p.label.toLowerCase().includes(query))
      .slice(0, 5);
  }, [provinceQuery, locale]);

  const showAgencyFilter = agencies !== null && agencies.length > 0;

  function handleFilterInResults(e: FormEvent) {
    e.preventDefault();
    updateParams({ fq: localFilter.trim() || null });
  }

  function toggleAgency(agencyUserId: string) {
    const next = toggleListParam(selectedAgencies, agencyUserId);
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

  function toggleLicense(value: string) {
    updateParams({
      license: selectedLicense === value ? null : value,
      page: null,
    });
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
      license: null,
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

      {showAgencyFilter ? (
        <>
          <hr className="border-border-default/60" />

          <div className="flex flex-col gap-3">
            <span className="font-sarabun text-label font-medium text-text-secondary">
              {t("agency")}
            </span>
            {agencies.map((agency) => {
              const label =
                locale === "th"
                  ? agency.agency_name ?? agency.agency_name_en ?? "-"
                  : agency.agency_name_en ?? agency.agency_name ?? "-";
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
        </>
      ) : null}

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

      <hr className="border-border-default/60" />

      <div className="flex flex-col gap-3">
        <span className="font-sarabun text-label font-medium text-text-secondary">
          {t("fileFormat")}
        </span>
        <div className="flex flex-wrap gap-2">
          {FORMAT_OPTIONS.map((fmt) => {
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

      <hr className="border-border-default/60" />

      <div className="flex flex-col gap-3">
        <span className="font-sarabun text-label font-medium text-text-secondary">
          {t("license")}
        </span>
        <div className="flex flex-wrap gap-2">
          {LICENSE_OPTIONS.map((value) => {
            const active = selectedLicense === value;
            const label =
              value === "open"
                ? t("licenseOpen")
                : value === "conditional"
                  ? t("licenseConditional")
                  : t("licenseCc");
            return (
              <button
                key={value}
                type="button"
                onClick={() => toggleLicense(value)}
                className={`rounded-radius-full border px-3 py-1 font-sarabun text-caption font-medium transition-colors ${
                  active
                    ? "border-primary/30 bg-primary text-white"
                    : "border-border-default/80 bg-surface-container text-text-secondary hover:bg-primary-light"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <hr className="border-border-default/60" />

      <div className="flex flex-col gap-3">
        <span className="font-sarabun text-label font-medium text-text-secondary">
          {t("province")}
        </span>
        {selectedProvince ? (
          <div className="flex items-center justify-between gap-2 rounded-radius-md border border-primary/30 bg-primary-light px-3 py-2">
            <span className="font-sarabun text-label font-medium text-primary-dark">
              {selectedProvince === "all"
                ? t("provinceAll")
                : provinceLabelMap.get(selectedProvince) ?? selectedProvince}
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
            {provinceOpen ? (
              <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-radius-md border border-border-default bg-surface-card shadow-level-2">
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectProvince("all");
                  }}
                  className="block w-full px-3 py-2 text-left font-sarabun text-label text-text-primary transition-colors hover:bg-primary-light"
                >
                  {t("provinceAll")}
                </button>
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
    selectedLicense: searchParams.get("license") ?? "",
    selectedProvince: searchParams.get("province") ?? "",
    filterQuery: searchParams.get("fq") ?? "",
  };
}
