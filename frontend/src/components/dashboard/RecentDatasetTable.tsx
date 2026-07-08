"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState, useRef, useEffect } from "react";
import type { AgencyDatasetRow } from "@/types/dataset";
import { useAgencyDatasets } from "@/hooks/useAgencyDatasets";

type RecentDatasetTableProps = {
  limit?: number;
};

function DatasetRowIcon() {
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e3f2fd] text-[#01579b]">
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
      </svg>
    </div>
  );
}

function CategoryPill({ label }: { label: string }) {
  return (
    <span className="inline-flex max-w-[160px] truncate rounded-full bg-gray-100 px-3 py-1 font-sarabun text-caption font-medium text-text-secondary">
      {label}
    </span>
  );
}

function StatusBadge({
  status,
  publishedLabel,
  draftLabel,
}: {
  status: AgencyDatasetRow["status"];
  publishedLabel: string;
  draftLabel: string;
}) {
  if (status === "published") {
    return (
      <span className="inline-flex items-center gap-1.5 font-sarabun text-caption font-semibold text-status-published">
        <span className="h-2.5 w-2.5 rounded-full bg-status-published" />
        {publishedLabel}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 font-sarabun text-caption font-semibold text-status-draft">
      <span className="h-2.5 w-2.5 rounded-full bg-status-draft" />
      {draftLabel}
    </span>
  );
}

function ThreeDotMenu({ datasetId, base }: { datasetId: string; base: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const t = useTranslations("agency.datasets");

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-container hover:text-text-primary"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
        </svg>
      </button>
      {open ? (
        <div className="absolute right-0 top-full z-20 mt-1 w-36 overflow-hidden rounded-xl border border-border-default bg-surface-card py-1 shadow-level-2">
          <Link
            href={`${base}/datasets/${datasetId}/edit`}
            className="flex w-full items-center gap-2 px-4 py-2 font-sarabun text-caption text-text-primary transition-colors hover:bg-surface-container"
            onClick={() => setOpen(false)}
          >
            {t("edit")}
          </Link>
          <Link
            href={`${base}/datasets/${datasetId}/versions`}
            className="flex w-full items-center gap-2 px-4 py-2 font-sarabun text-caption text-text-primary transition-colors hover:bg-surface-container"
            onClick={() => setOpen(false)}
          >
            {t("versions")}
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="animate-pulse space-y-3 p-6">
      {[1, 2, 3, 4, 5].map((row) => (
        <div key={row} className="h-12 rounded-xl bg-surface-container" />
      ))}
    </div>
  );
}

export default function RecentDatasetTable({ limit = 5 }: RecentDatasetTableProps) {
  const t = useTranslations("agency.dashboard");
  const tStatus = useTranslations("agency.status");
  const locale = useLocale();
  const base = `/${locale}`;
  const { data, isLoading } = useAgencyDatasets("all", 1, limit);

  const rows = data?.data ?? [];

  return (
    <section className="overflow-hidden rounded-2xl border border-border-default/60 bg-surface-card shadow-level-1">
      <div className="flex items-center justify-between border-b border-border-default/40 px-6 py-5">
        <h2 className="font-kanit text-heading-3-mobile font-semibold text-text-primary">
          {t("recentDatasets")}
        </h2>
        <Link
          href={`${base}/datasets`}
          className="rounded-full border border-[#01579b]/30 px-4 py-1.5 font-sarabun text-label font-medium text-[#01579b] transition-colors hover:bg-[#e3f2fd]"
        >
          {t("viewAll")}
        </Link>
      </div>

      {isLoading && rows.length === 0 ? (
        <TableSkeleton />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#f3f4f5] font-sarabun text-[15px] font-bold text-text-muted">
                <th className="px-6 py-4">{t("colTitle")}</th>
                <th className="px-6 py-4">{t("colCategory")}</th>
                <th className="px-6 py-4">{t("colStatus")}</th>
                <th className="px-6 py-4 text-center">{t("colDownloads")}</th>
                <th className="px-6 py-4">{t("colUpdated")}</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/60 font-sarabun text-label text-text-primary">
              {rows.map((row) => {
                const title = locale === "th" ? row.title : row.titleEn;
                const category =
                  locale === "th" ? row.category : row.categoryEn;
                const updated = new Date(row.updatedAt).toLocaleDateString(
                  locale === "th" ? "th-TH" : "en-US",
                  { year: "2-digit", month: "short", day: "numeric" }
                );

                return (
                  <tr
                    key={row.id}
                    className="transition-colors hover:bg-gray-50/50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <DatasetRowIcon />
                        <Link
                          href={`${base}/datasets/${row.id}`}
                          className="max-w-[200px] truncate font-sarabun text-body-md font-semibold text-[#01579b] transition-colors hover:text-[#0277bd] hover:underline"
                        >
                          {title}
                        </Link>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <CategoryPill label={category} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge
                        status={row.status}
                        publishedLabel={tStatus("published")}
                        draftLabel={tStatus("draft")}
                      />
                    </td>
                    <td className="px-6 py-4 text-center text-text-secondary">
                      {row.downloadCount.toLocaleString(
                        locale === "th" ? "th-TH" : "en-US"
                      )}
                    </td>
                    <td className="px-6 py-4 text-text-muted">{updated}</td>
                    <td className="px-6 py-4">
                      <ThreeDotMenu datasetId={row.id} base={base} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
