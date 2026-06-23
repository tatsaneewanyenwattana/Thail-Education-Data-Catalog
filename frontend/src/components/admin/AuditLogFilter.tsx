"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

export type AuditLogFilterValues = {
  dateFrom: string;
  dateTo: string;
  action: string;
  search: string;
};

type AuditLogFilterProps = {
  values: AuditLogFilterValues;
  onChange: (values: AuditLogFilterValues) => void;
  onSearch: () => void;
};

export default function AuditLogFilter({
  values,
  onChange,
  onSearch,
}: AuditLogFilterProps) {
  const t = useTranslations("admin.auditLogs");
  const [actionOpen, setActionOpen] = useState(false);
  const actionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (actionRef.current && !actionRef.current.contains(e.target as Node)) {
        setActionOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const update = (patch: Partial<AuditLogFilterValues>) => {
    onChange({ ...values, ...patch });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSearch();
  };

  const actionOptions = [
    { value: "all", label: t("filterActionAll") },
    { value: "LOGIN", label: t("actions.login") },
    { value: "UPLOAD", label: t("actions.upload") },
    { value: "DOWNLOAD", label: t("actions.download") },
    { value: "DELETE", label: t("actions.delete") },
    { value: "APPROVE", label: t("actions.approve") },
    { value: "REJECT", label: t("actions.reject") },
  ];

  const inputClass =
    "h-11 w-full rounded-full border border-gray-200 bg-gray-50 px-4 font-sarabun text-body-md text-text-primary shadow-sm transition-all hover:border-gray-300 focus:border-primary-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-dark/20";

  return (
    <section className="rounded-2xl border border-white/80 bg-white p-6 shadow-md">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 items-end gap-5 md:grid-cols-12"
      >
        {/* Date From */}
        <div className="space-y-1.5 md:col-span-2">
          <label
            htmlFor="audit-date-from"
            className="block font-sarabun text-body-sm font-semibold text-text-secondary"
          >
            {t("filterDateFrom")}
          </label>
          <input
            id="audit-date-from"
            type="date"
            value={values.dateFrom}
            onChange={(e) => update({ dateFrom: e.target.value })}
            className={inputClass}
          />
        </div>

        {/* Date To */}
        <div className="space-y-1.5 md:col-span-2">
          <label
            htmlFor="audit-date-to"
            className="block font-sarabun text-body-sm font-semibold text-text-secondary"
          >
            {t("filterDateTo")}
          </label>
          <input
            id="audit-date-to"
            type="date"
            value={values.dateTo}
            onChange={(e) => update({ dateTo: e.target.value })}
            className={inputClass}
          />
        </div>

        {/* Action Type — custom dropdown */}
        <div className="space-y-1.5 md:col-span-3">
          <label className="block font-sarabun text-body-sm font-semibold text-text-secondary">
            {t("filterAction")}
          </label>
          <div ref={actionRef} className="relative">
            <button
              type="button"
              onClick={() => setActionOpen(!actionOpen)}
              className="flex h-11 w-full items-center justify-between rounded-full border border-gray-200 bg-gray-50 px-4 font-sarabun text-body-md text-text-primary shadow-sm transition-all hover:border-gray-300 focus:border-primary-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-dark/20"
            >
              <span>
                {actionOptions.find((o) => o.value === values.action)?.label}
              </span>
              <svg
                className={`h-4 w-4 text-text-muted transition-transform ${actionOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {actionOpen && (
              <ul className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-white/80 bg-white py-1 shadow-lg">
                {actionOptions.map((opt) => (
                  <li key={opt.value}>
                    <button
                      type="button"
                      onClick={() => {
                        update({ action: opt.value });
                        setActionOpen(false);
                      }}
                      className={`flex w-full px-4 py-2.5 text-left font-sarabun text-body-md transition-colors ${
                        values.action === opt.value
                          ? "bg-primary-dark/10 font-bold text-primary-dark"
                          : "text-text-primary hover:bg-gray-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Search User */}
        <div className="space-y-1.5 md:col-span-3">
          <label
            htmlFor="audit-search"
            className="block font-sarabun text-body-sm font-semibold text-text-secondary"
          >
            {t("filterSearch")}
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
              <SearchIcon />
            </span>
            <input
              id="audit-search"
              type="search"
              value={values.search}
              onChange={(e) => update({ search: e.target.value })}
              placeholder={t("filterSearchPlaceholder")}
              className={`${inputClass} pl-11`}
            />
          </div>
        </div>

        {/* Search button */}
        <div className="md:col-span-2">
          <button
            type="submit"
            className="h-11 w-full rounded-full bg-primary-dark font-sarabun text-body-md font-bold text-white shadow-md transition-all hover:bg-primary-hover hover:shadow-lg active:scale-95"
          >
            {t("search")}
          </button>
        </div>
      </form>
    </section>
  );
}

function SearchIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}
