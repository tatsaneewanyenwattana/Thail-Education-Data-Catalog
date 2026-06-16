"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { useSearchParamsUpdate } from "@/components/search/useSearchParamsUpdate";
import type { EducationLevel, ScholarshipType } from "@/hooks/useScholarships";

export const SCHOLARSHIP_TYPE_VALUES = [
  "government",
  "university",
  "private",
  "foundation",
  "exchange",
  "other",
] as const satisfies readonly ScholarshipType[];

export const TARGET_LEVEL_VALUES = [
  "high_school",
  "bachelor",
  "master",
  "doctoral",
  "any",
] as const satisfies readonly EducationLevel[];

export const APPLICATION_STATUS_VALUES = ["open", "closed"] as const;
export type ScholarshipApplicationStatus =
  (typeof APPLICATION_STATUS_VALUES)[number];

type SearchParamsInput = URLSearchParams | Record<string, string | string[] | undefined>;
type ScholarshipFilterParams = {
  page: number;
  q: string;
  scholarship_type: string;
  target_level: string;
  application_status: ScholarshipApplicationStatus | "";
};

function readParam(
  searchParams: SearchParamsInput,
  key: string
): string {
  if (searchParams instanceof URLSearchParams) {
    return searchParams.get(key) ?? "";
  }

  const value = searchParams[key];
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

export function parseScholarshipFilterParams(
  searchParams: SearchParamsInput
): ScholarshipFilterParams {
  const page = Math.max(1, Number(readParam(searchParams, "page") || "1") || 1);
  const scholarshipType = readParam(searchParams, "scholarship_type");
  const targetLevel = readParam(searchParams, "target_level");
  const applicationStatusRaw = readParam(searchParams, "application_status");
  const applicationStatus = APPLICATION_STATUS_VALUES.includes(
    applicationStatusRaw as ScholarshipApplicationStatus
  )
    ? (applicationStatusRaw as ScholarshipApplicationStatus)
    : "";
  const q = readParam(searchParams, "q");

  return {
    page,
    q,
    scholarship_type: scholarshipType,
    target_level: targetLevel,
    application_status: applicationStatus,
  };
}

export default function ScholarshipFilter() {
  const t = useTranslations("scholarship");
  const tFilter = useTranslations("scholarship.filter");
  const tTypes = useTranslations("scholarship.types");
  const tLevels = useTranslations("scholarship.levels");
  const searchParams = useSearchParams();
  const updateParams = useSearchParamsUpdate();

  const { scholarship_type, target_level, application_status, q } =
    parseScholarshipFilterParams(searchParams);
  const [keyword, setKeyword] = useState(q);

  useEffect(() => {
    setKeyword(q);
  }, [q]);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    updateParams({ q: keyword.trim() || null });
  };

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleSearch}
        className="flex flex-col gap-3 rounded-radius-lg border border-border-default/80 bg-surface-card p-4 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label
            htmlFor="scholarship-search"
            className="mb-2 block font-sarabun text-label font-medium text-text-primary"
          >
            {tFilter("search")}
          </label>
          <input
            id="scholarship-search"
            type="search"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder={tFilter("searchPlaceholder")}
            className="min-h-[44px] w-full rounded-radius-md border border-border-input bg-surface-page px-4 font-sarabun text-body-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <button
          type="submit"
          className="inline-flex min-h-[44px] items-center justify-center rounded-radius-md bg-primary px-6 font-sarabun text-label font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          {tFilter("searchButton")}
        </button>
      </form>

      <div className="flex flex-col gap-4 rounded-radius-lg border border-border-default/80 bg-surface-card p-4 md:flex-row md:flex-wrap md:items-end md:gap-6">
        <div className="flex-1 md:min-w-[200px]">
          <label
            htmlFor="scholarship-type-filter"
            className="mb-2 block font-sarabun text-label font-medium text-text-primary"
          >
            {tFilter("type")}
          </label>
          <select
            id="scholarship-type-filter"
            value={scholarship_type}
            onChange={(event) =>
              updateParams({ scholarship_type: event.target.value || null })
            }
            className="min-h-[44px] w-full rounded-radius-md border border-border-input bg-surface-page px-3 font-sarabun text-body-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">{t("common.all")}</option>
            {SCHOLARSHIP_TYPE_VALUES.map((value) => (
              <option key={value} value={value}>
                {tTypes(value)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 md:min-w-[200px]">
          <label
            htmlFor="target-level-filter"
            className="mb-2 block font-sarabun text-label font-medium text-text-primary"
          >
            {tFilter("level")}
          </label>
          <select
            id="target-level-filter"
            value={target_level}
            onChange={(event) =>
              updateParams({ target_level: event.target.value || null })
            }
            className="min-h-[44px] w-full rounded-radius-md border border-border-input bg-surface-page px-3 font-sarabun text-body-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">{t("common.all")}</option>
            {TARGET_LEVEL_VALUES.map((value) => (
              <option key={value} value={value}>
                {tLevels(value)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 md:min-w-[200px]">
          <label
            htmlFor="application-status-filter"
            className="mb-2 block font-sarabun text-label font-medium text-text-primary"
          >
            {tFilter("applicationStatus")}
          </label>
          <select
            id="application-status-filter"
            value={application_status}
            onChange={(event) =>
              updateParams({
                application_status: event.target.value || null,
              })
            }
            className="min-h-[44px] w-full rounded-radius-md border border-border-input bg-surface-page px-3 font-sarabun text-body-sm text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">{t("common.all")}</option>
            {APPLICATION_STATUS_VALUES.map((value) => (
              <option key={value} value={value}>
                {tFilter(`applicationStatus_${value}`)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
