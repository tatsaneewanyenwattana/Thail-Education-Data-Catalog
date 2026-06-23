"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import EmailLogsTable, {
  EMAIL_LOG_STATUS_OPTIONS,
  EMAIL_LOG_TEMPLATE_OPTIONS,
} from "@/components/admin/EmailLogsTable";
import Pagination from "@/components/search/Pagination";
import {
  type AdminEmailLogsFilters,
  type EmailLogStatus,
  useAdminEmailLogs,
} from "@/hooks/useAdminEmailLogs";

function getPositiveInt(value: string | null, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function parseStatus(value: string): EmailLogStatus | undefined {
  return EMAIL_LOG_STATUS_OPTIONS.includes(value as EmailLogStatus)
    ? (value as EmailLogStatus)
    : undefined;
}

export default function AdminEmailLogsPage() {
  const t = useTranslations("admin.emailLogs");
  const tStatus = useTranslations("admin.emailLogs.status");
  const tTemplates = useTranslations("admin.emailLogs.templates");
  const locale = useLocale();
  const base = `/${locale}`;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const status = searchParams.get("status") ?? "";
  const recipientEmail = searchParams.get("recipient_email") ?? "";
  const templateName = searchParams.get("template_name") ?? "";
  const dateFrom = searchParams.get("date_from") ?? "";
  const dateTo = searchParams.get("date_to") ?? "";
  const page = getPositiveInt(searchParams.get("page"), 1);
  const pageSize = Math.min(getPositiveInt(searchParams.get("page_size"), 20), 100);

  const filters: AdminEmailLogsFilters = {
    status: parseStatus(status),
    recipient_email: recipientEmail || undefined,
    template_name: templateName || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    page,
    page_size: pageSize,
  };

  const { data, isLoading, isError } = useAdminEmailLogs(filters);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-8 pb-24">
      {/* Header */}
      <header>
        <nav className="mb-2 flex font-sarabun text-body-sm text-text-muted">
          <Link href={`${base}/admin`} className="hover:text-primary-dark">
            Admin
          </Link>
          <span className="mx-2">&gt;</span>
          <span className="font-medium text-primary-dark">{t("title")}</span>
        </nav>
        <h1 className="font-kanit text-[32px] font-bold leading-tight text-text-primary">
          {t("title")}
        </h1>
        <p className="mt-1 font-sarabun text-body-md text-text-muted">
          {t("subtitle")}
        </p>
      </header>

      {/* Filters */}
      <section className="rounded-2xl border border-white/80 bg-white p-6 shadow-md">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          {/* Status dropdown */}
          <FilterDropdown
            label={t("filterStatus")}
            value={status}
            onChange={(v) => updateFilter("status", v)}
            options={[
              { value: "", label: t("filterStatusAll") },
              ...EMAIL_LOG_STATUS_OPTIONS.map((opt) => ({
                value: opt,
                label: tStatus(opt),
              })),
            ]}
          />

          {/* Email */}
          <div className="space-y-1.5">
            <span className="block font-sarabun text-body-sm font-semibold text-text-secondary">
              {t("filterEmail")}
            </span>
            <input
              type="search"
              value={recipientEmail}
              onChange={(e) => updateFilter("recipient_email", e.target.value)}
              placeholder={t("filterEmailPlaceholder")}
              className="h-11 w-full rounded-full border border-gray-200 bg-gray-50 px-4 font-sarabun text-body-md text-text-primary shadow-sm transition-all hover:border-gray-300 focus:border-primary-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-dark/20"
            />
          </div>

          {/* Template dropdown */}
          <FilterDropdown
            label={t("filterTemplate")}
            value={templateName}
            onChange={(v) => updateFilter("template_name", v)}
            options={[
              { value: "", label: t("filterTemplateAll") },
              ...EMAIL_LOG_TEMPLATE_OPTIONS.map((tpl) => ({
                value: tpl,
                label: tTemplates(tpl),
              })),
            ]}
          />

          {/* Date From */}
          <div className="space-y-1.5">
            <span className="block font-sarabun text-body-sm font-semibold text-text-secondary">
              {t("filterDateFrom")}
            </span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => updateFilter("date_from", e.target.value)}
              className="h-11 w-full rounded-full border border-gray-200 bg-gray-50 px-4 font-sarabun text-body-md text-text-primary shadow-sm transition-all hover:border-gray-300 focus:border-primary-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-dark/20"
            />
          </div>

          {/* Date To */}
          <div className="space-y-1.5">
            <span className="block font-sarabun text-body-sm font-semibold text-text-secondary">
              {t("filterDateTo")}
            </span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => updateFilter("date_to", e.target.value)}
              className="h-11 w-full rounded-full border border-gray-200 bg-gray-50 px-4 font-sarabun text-body-md text-text-primary shadow-sm transition-all hover:border-gray-300 focus:border-primary-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-dark/20"
            />
          </div>
        </div>
      </section>

      {isError && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-sarabun text-body-md text-error">
          {t("loadError")}
        </p>
      )}

      {/* Table */}
      <EmailLogsTable logs={data?.data ?? []} isLoading={isLoading} />

      {/* Pagination */}
      <Pagination
        currentPage={data?.page ?? page}
        totalPages={data?.totalPages ?? 1}
      />
    </div>
  );
}

function FilterDropdown({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? options[0]?.label;

  return (
    <div className="space-y-1.5">
      <span className="block font-sarabun text-body-sm font-semibold text-text-secondary">
        {label}
      </span>
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex h-11 w-full items-center justify-between rounded-full border border-gray-200 bg-gray-50 px-4 font-sarabun text-body-md text-text-primary shadow-sm transition-all hover:border-gray-300 focus:border-primary-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-dark/20"
        >
          <span className="truncate">{selectedLabel}</span>
          <svg
            className={`h-4 w-4 shrink-0 text-text-muted transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {open && (
          <ul className="absolute z-20 mt-2 max-h-60 w-full overflow-y-auto rounded-2xl border border-white/80 bg-white py-1 shadow-lg">
            {options.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`flex w-full px-4 py-2.5 text-left font-sarabun text-body-md transition-colors ${
                    value === opt.value
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
  );
}
