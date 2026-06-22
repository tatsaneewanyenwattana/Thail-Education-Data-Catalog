"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
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

const LEVEL_CHECKBOX_VALUES: EducationLevel[] = [
  "high_school",
  "bachelor",
  "master",
  "doctoral",
];

export default function ScholarshipFilter() {
  const tFilter = useTranslations("scholarship.filter");
  const tTypes = useTranslations("scholarship.types");
  const tLevels = useTranslations("scholarship.levels");
  const searchParams = useSearchParams();
  const updateParams = useSearchParamsUpdate();

  const { scholarship_type, target_level, application_status } =
    parseScholarshipFilterParams(searchParams);

  const handleClearAll = () => {
    updateParams({
      q: null,
      scholarship_type: null,
      target_level: null,
      application_status: null,
      page: null,
    });
  };

  const hasAnyFilter = scholarship_type || target_level || application_status;

  return (
    <div className="rounded-2xl border border-border-default/60 bg-white p-5 shadow-level-1">
      <div className="mb-5 flex items-center gap-2">
        <svg className="h-5 w-5" style={{ color: "#00695c" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <h3 className="font-kanit text-body-md font-bold" style={{ color: "#1a3a2a" }}>
          {tFilter("title")}
        </h3>
      </div>

      {/* ระดับการศึกษา */}
      <div className="mb-5">
        <p className="mb-3 font-sarabun text-label font-bold" style={{ color: "#1a3a2a" }}>
          {tFilter("level")}
        </p>
        <div className="flex flex-col gap-2">
          {LEVEL_CHECKBOX_VALUES.map((level) => (
            <label key={level} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1 transition-colors hover:bg-gray-50">
              <input
                type="checkbox"
                checked={target_level === level}
                onChange={() =>
                  updateParams({ target_level: target_level === level ? null : level, page: null })
                }
                className="h-4.5 w-4.5 rounded accent-primary-dark"
              />
              <span className="font-sarabun text-label text-text-secondary">
                {tLevels(level)}
              </span>
            </label>
          ))}
        </div>
      </div>

      <hr className="mb-5 border-border-default/40" />

      {/* ประเภททุน */}
      <div className="mb-5">
        <p className="mb-3 font-sarabun text-label font-bold" style={{ color: "#1a3a2a" }}>
          {tFilter("type")}
        </p>
        <select
          value={scholarship_type}
          onChange={(e) =>
            updateParams({ scholarship_type: e.target.value || null, page: null })
          }
          className="w-full rounded-xl border border-border-default/60 bg-white px-3 py-2.5 font-sarabun text-label text-text-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">{tFilter("allTypes")}</option>
          {SCHOLARSHIP_TYPE_VALUES.map((value) => (
            <option key={value} value={value}>
              {tTypes(value)}
            </option>
          ))}
        </select>
      </div>

      <hr className="mb-5 border-border-default/40" />

      {/* สถานะ */}
      <div className="mb-6">
        <p className="mb-3 font-sarabun text-label font-bold" style={{ color: "#1a3a2a" }}>
          {tFilter("applicationStatus")}
        </p>
        <div className="flex flex-wrap gap-2">
          {APPLICATION_STATUS_VALUES.map((status) => {
            const active = application_status === status;
            const isOpen = status === "open";
            return (
              <button
                key={status}
                type="button"
                onClick={() =>
                  updateParams({ application_status: active ? null : status, page: null })
                }
                className="rounded-full px-4 py-2 font-sarabun text-caption font-bold transition-all"
                style={
                  active
                    ? { backgroundColor: isOpen ? "#00695c" : "#c41411", color: "#ffffff" }
                    : { backgroundColor: "#f5f5f5", color: "#6b7280" }
                }
              >
                {tFilter(`applicationStatus_${status}`)}
              </button>
            );
          })}
        </div>
      </div>

      {/* ล้างตัวกรอง */}
      <button
        type="button"
        onClick={handleClearAll}
        disabled={!hasAnyFilter}
        className="w-full rounded-2xl border-2 py-2.5 font-sarabun text-label font-bold transition-all hover:opacity-80 disabled:opacity-40"
        style={{ borderColor: "#00897b", color: "#0d5302" }}
      >
        {tFilter("clearAll")}
      </button>
    </div>
  );
}
