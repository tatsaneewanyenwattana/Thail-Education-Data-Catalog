"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import type { AgencyDatasetRow } from "@/data/mockData";
import { useAgencyDatasets } from "@/hooks/useAgencyDatasets";

type RecentDatasetTableProps = {
  limit?: number;
};

function StatusBadge({
  status,
  publishedLabel,
  submittedLabel,
  draftLabel,
  rejectedLabel,
}: {
  status: AgencyDatasetRow["status"];
  publishedLabel: string;
  submittedLabel: string;
  draftLabel: string;
  rejectedLabel: string;
}) {
  if (status === "published") {
    return (
      <span className="inline-flex rounded-radius-full bg-status-published-bg px-3 py-1 font-sarabun text-caption font-semibold text-status-published">
        {publishedLabel}
      </span>
    );
  }
  if (status === "submitted") {
    return (
      <span className="inline-flex rounded-radius-full bg-[#ffefc9] px-3 py-1 font-sarabun text-caption font-semibold text-[#795900]">
        {submittedLabel}
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="inline-flex rounded-radius-full bg-[#ffdad6] px-3 py-1 font-sarabun text-caption font-semibold text-[#93000a]">
        {rejectedLabel}
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-radius-full bg-status-draft-bg px-3 py-1 font-sarabun text-caption font-semibold text-status-draft">
      {draftLabel}
    </span>
  );
}

function TableSkeleton() {
  return (
    <div className="animate-pulse space-y-3 p-6">
      {[1, 2, 3, 4, 5].map((row) => (
        <div key={row} className="h-10 rounded-radius-sm bg-surface-container" />
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
    <section className="overflow-hidden rounded-radius-lg border border-border-default/80 bg-surface-card shadow-level-1">
      <div className="flex items-center justify-between border-b border-border-default/50 p-6">
        <h2 className="font-kanit text-heading-3-mobile font-semibold text-text-primary">
          {t("recentDatasets")}
        </h2>
        <Link
          href={`${base}/datasets`}
          className="font-sarabun text-label font-medium text-primary-dark hover:underline"
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
              <tr className="bg-surface-container font-sarabun text-label font-semibold text-text-secondary">
                <th className="px-6 py-4">{t("colTitle")}</th>
                <th className="px-6 py-4">{t("colCategory")}</th>
                <th className="px-6 py-4">{t("colStatus")}</th>
                <th className="px-6 py-4 text-center">{t("colDownloads")}</th>
                <th className="px-6 py-4">{t("colUpdated")}</th>
              </tr>
            </thead>
            <tbody className="font-sarabun text-label text-text-primary">
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
                    className="border-b border-border-default/30 transition-colors last:border-b-0 hover:bg-surface-page"
                  >
                    <td className="max-w-xs truncate px-6 py-4 font-medium">
                      <Link
                        href={`${base}/datasets/${row.id}`}
                        className="text-text-primary hover:text-primary-dark hover:underline"
                      >
                        {title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      {category}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge
                        status={row.status}
                        publishedLabel={tStatus("published")}
                        submittedLabel={tStatus("submitted")}
                        draftLabel={tStatus("draft")}
                        rejectedLabel={tStatus("rejected")}
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      {row.downloadCount.toLocaleString(
                        locale === "th" ? "th-TH" : "en-US"
                      )}
                    </td>
                    <td className="px-6 py-4 text-text-muted">{updated}</td>
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
