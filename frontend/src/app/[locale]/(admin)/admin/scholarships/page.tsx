"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Pagination from "@/components/search/Pagination";
import { useSearchParamsUpdate } from "@/components/search/useSearchParamsUpdate";
import { SCHOLARSHIP_TYPE_VALUES } from "@/components/scholarship/ScholarshipFilter";
import {
  useAdminScholarships,
} from "@/hooks/useAdminScholarships";
import type { Scholarship, ScholarshipSource } from "@/hooks/useScholarships";
import apiClient from "@/services/api";
import { toast } from "@/stores/toastStore";

function parseAdminScholarshipParams(searchParams: URLSearchParams) {
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const status = searchParams.get("status") ?? "";
  const scholarship_type = searchParams.get("scholarship_type") ?? "";
  const agency_id = searchParams.get("agency_id") ?? "";

  return { page, status, scholarship_type, agency_id };
}

function formatDate(value: string, locale: string): string {
  return new Date(value).toLocaleDateString(
    locale === "th" ? "th-TH" : "en-US",
    { year: "numeric", month: "short", day: "numeric" }
  );
}

function StatusBadge({
  status,
  publishedLabel,
  draftLabel,
}: {
  status: Scholarship["status"];
  publishedLabel: string;
  draftLabel: string;
}) {
  if (status === "published") {
    return (
      <span className="inline-flex rounded-radius-full bg-status-published-bg px-3 py-1 font-sarabun text-caption font-semibold text-status-published">
        {publishedLabel}
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-radius-full bg-status-draft-bg px-3 py-1 font-sarabun text-caption font-semibold text-status-draft">
      {draftLabel}
    </span>
  );
}

function SourceBadge({
  source,
  label,
}: {
  source: ScholarshipSource;
  label: string;
}) {
  const className =
    source === "agency"
      ? "bg-primary-light text-primary-dark"
      : source === "data_go_th"
        ? "bg-status-published-bg text-status-published"
        : "bg-[#FFF7ED] text-[#C2410C]";

  return (
    <span
      className={`inline-flex rounded-radius-full px-3 py-1 font-sarabun text-caption font-semibold ${className}`}
    >
      {label}
    </span>
  );
}

function AdminScholarshipsContent() {
  const locale = useLocale();
  const router = useRouter();
  const base = `/${locale}`;
  const t = useTranslations("scholarship");
  const tAdmin = useTranslations("scholarship.admin");
  const tTypes = useTranslations("scholarship.types");
  const tLevels = useTranslations("scholarship.levels");
  const tSources = useTranslations("scholarship.sources");
  const searchParams = useSearchParams();
  const updateParams = useSearchParamsUpdate();
  const queryClient = useQueryClient();
  const { page, status, scholarship_type, agency_id } =
    parseAdminScholarshipParams(searchParams);

  const { data, isLoading, isError } = useAdminScholarships({
    page,
    page_size: 20,
    status: status || undefined,
    scholarship_type: scholarship_type || undefined,
    agency_id: agency_id || undefined,
  });

  const [deleteTarget, setDeleteTarget] = useState<Scholarship | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/scholarship/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "scholarships"] });
      toast.success(tAdmin("deleteSuccess"));
      setDeleteTarget(null);
    },
    onError: () => {
      toast.error(tAdmin("deleteError"));
    },
  });

  const { data: agencyUsers = [] } = useQuery({
    queryKey: ["admin", "users", "agency-filter"],
    queryFn: async () => {
      const response = await apiClient.get<{
        data: Array<{
          id: string;
          agency_name: string | null;
          email: string;
        }>;
      }>("/admin/users", {
        params: { page: 1, page_size: 100, role: "agency" },
      });
      return response.data.data ?? [];
    },
    staleTime: 60_000,
    retry: 1,
  });

  const statusOptions = [
    { value: "", label: t("common.all") },
    { value: "published", label: t("common.statusPublished") },
    { value: "draft", label: t("common.statusDraft") },
  ];

  const typeOptions = [
    { value: "", label: t("common.all") },
    ...SCHOLARSHIP_TYPE_VALUES.map((value) => ({
      value,
      label: tTypes(value),
    })),
  ];

  const agencyOptions = [
    { value: "", label: t("common.all") },
    ...agencyUsers.map((user) => ({
      value: user.id,
      label: user.agency_name?.trim() || user.email,
    })),
  ];

  const items = data?.items ?? [];
  const pagination = data?.pagination;
  const totalPages = Math.max(1, pagination?.total_pages ?? 1);
  const currentPage = pagination?.page ?? page;

  const columnHeaders = [
    tAdmin("colTitle"),
    tAdmin("colAgency"),
    tAdmin("colType"),
    tAdmin("colLevel"),
    tAdmin("colStatus"),
    tAdmin("colSource"),
    tAdmin("colCloseDate"),
    tAdmin("colActions"),
  ];

  return (
    <div className="mx-auto max-w-container-max space-y-spacing-8 pb-24">
      <header>
        <h1 className="font-kanit text-[28px] font-bold leading-tight text-text-primary">
          {tAdmin("title")}
        </h1>
        <p className="mt-1 font-sarabun text-label text-text-muted">
          {tAdmin("subtitle")}
        </p>
      </header>

      <section className="rounded-2xl border border-white/80 bg-white p-4 shadow-md md:p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <FilterDropdown
            label={tAdmin("filterStatus")}
            value={status}
            onChange={(v) => updateParams({ status: v || null })}
            options={statusOptions}
          />
          <FilterDropdown
            label={tAdmin("filterType")}
            value={scholarship_type}
            onChange={(v) => updateParams({ scholarship_type: v || null })}
            options={typeOptions}
          />
          <FilterDropdown
            label={tAdmin("filterAgency")}
            value={agency_id}
            onChange={(v) => updateParams({ agency_id: v || null })}
            options={agencyOptions}
          />
        </div>
      </section>

      {isLoading && (
        <p className="font-sarabun text-body-md text-text-muted">
          {t("common.loading")}
        </p>
      )}

      {isError && (
        <p className="font-sarabun text-body-md text-status-error">
          {tAdmin("loadError")}
        </p>
      )}

      {!isLoading && !isError && items.length === 0 && (
        <div className="rounded-2xl border border-white/80 bg-white px-6 py-12 text-center shadow-md">
          <p className="font-sarabun text-body-md text-text-muted">
            {tAdmin("empty")}
          </p>
        </div>
      )}

      {!isLoading && !isError && items.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-white/80 bg-white shadow-md">
          <table className="min-w-full divide-y divide-border-default/60">
            <thead className="bg-surface-container">
              <tr>
                {columnHeaders.map((heading) => (
                  <th
                    key={heading}
                    className="px-4 py-3 text-left font-sarabun text-caption font-semibold uppercase tracking-wide text-text-muted"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default/40">
              {items.map((scholarship) => (
                <tr key={scholarship.id} className="hover:bg-surface-page/60">
                  <td className="px-4 py-4 font-sarabun text-body-sm font-medium text-text-primary">
                    {scholarship.title}
                  </td>
                  <td className="px-4 py-4 font-sarabun text-body-sm text-text-secondary">
                    {scholarship.agency_name ?? t("common.noAgency")}
                  </td>
                  <td className="px-4 py-4 font-sarabun text-body-sm text-text-secondary">
                    {tTypes(scholarship.scholarship_type)}
                  </td>
                  <td className="px-4 py-4 font-sarabun text-body-sm text-text-secondary">
                    {tLevels(scholarship.target_level)}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge
                      status={scholarship.status}
                      publishedLabel={t("common.statusPublished")}
                      draftLabel={t("common.statusDraft")}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <SourceBadge
                      source={scholarship.source}
                      label={tSources(scholarship.source)}
                    />
                  </td>
                  <td className="px-4 py-4 font-sarabun text-body-sm text-text-secondary">
                    {formatDate(scholarship.close_date, locale)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => router.push(`${base}/admin/scholarships/${scholarship.id}/edit`)}
                        className="rounded-full p-2 text-text-muted transition-colors hover:bg-blue-50 hover:text-primary-dark"
                      >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(scholarship)}
                        className="rounded-full p-2 text-text-muted transition-colors hover:bg-red-50 hover:text-status-error"
                      >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && !isError && totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-surface-navy/40 backdrop-blur-sm"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-2 font-kanit text-heading-3 font-bold text-text-primary">
              {tAdmin("deleteTitle")}
            </h2>
            <p className="mb-6 font-sarabun text-body-md text-text-muted">
              {tAdmin("deleteConfirm", { title: deleteTarget.title })}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleteMutation.isPending}
                className="flex-1 rounded-full border border-gray-300 py-3 font-sarabun text-label font-medium text-text-secondary hover:bg-gray-50 disabled:opacity-50"
              >
                {tAdmin("cancelBtn")}
              </button>
              <button
                type="button"
                onClick={() => deleteMutation.mutate(deleteTarget.id)}
                disabled={deleteMutation.isPending}
                className="flex-1 rounded-full bg-status-error py-3 font-sarabun text-label font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                {tAdmin("deleteBtn")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminScholarshipsPage() {
  const t = useTranslations("scholarship");

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-container-max px-4 py-12 text-center font-sarabun text-body-md text-text-muted">
          {t("common.loading")}
        </div>
      }
    >
      <AdminScholarshipsContent />
    </Suspense>
  );
}

function FilterDropdown({
  value,
  options,
  onChange,
  label,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <span className="mb-2 block font-sarabun text-label font-medium text-text-muted">
        {label}
      </span>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-full items-center justify-between rounded-full border border-gray-200 bg-gray-50 px-4 font-sarabun text-body-md text-text-primary shadow-sm transition-all hover:border-gray-300 hover:shadow-md"
      >
        <span className="truncate">{selected?.label ?? "—"}</span>
        <svg className="h-4 w-4 shrink-0 text-gray-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-1.5 max-h-60 w-full overflow-y-auto rounded-2xl border border-gray-200 bg-white py-1 shadow-lg">
          {options.map((opt) => (
            <button
              key={opt.value || "_all"}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`flex w-full px-4 py-2.5 font-sarabun text-label transition-colors ${
                opt.value === value
                  ? "bg-primary-dark/10 font-bold text-primary-dark"
                  : "text-text-primary hover:bg-gray-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
