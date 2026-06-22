"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import type { DatasetLicense } from "@/data/mockData";
import type { DatasetDetailView } from "@/types/dataset";
import { useAddBookmark } from "@/hooks/useBookmarks";
import { useDatasetCitation } from "@/hooks/useDatasetCitation";
import { useDatasetPreview } from "@/hooks/useDatasetPreview";
import { useAuthStore } from "@/stores/useAuthStore";
import { mapPreviewToTable } from "@/utils/datasetDetailMappers";
import ApiAccessModal from "./ApiAccessModal";
import CitationBox from "./CitationBox";
import DatasetRating from "./DatasetRating";
import DatasetTags from "./DatasetTags";
import DownloadModal from "./DownloadModal";
import PreviewTable from "./PreviewTable";

type DatasetDetailProps = {
  datasetId: string;
  detail: DatasetDetailView;
  publishedDateLabel: string;
  isUpdated: boolean;
  downloadCountLabel: string;
  sourceFileFormat?: string | null;
  viewCount?: number;
  ratingAvg?: number;
  ratingCount?: number;
  userRating?: number | null;
  datasetOwnerId?: string;
  isPublished?: boolean;
};

type DetailTab = "preview" | "citation";

function ChevronRight() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

function licenseLabel(
  license: DatasetLicense,
  t: ReturnType<typeof useTranslations<"dataset">>
) {
  if (license === "open") return t("licenseOpen");
  if (license === "conditional") return t("licenseConditional");
  return t("licenseCc");
}

export default function DatasetDetail({
  datasetId,
  detail,
  publishedDateLabel,
  isUpdated,
  downloadCountLabel,
  sourceFileFormat,
  viewCount,
  ratingAvg,
  ratingCount,
  userRating,
  datasetOwnerId,
  isPublished,
}: DatasetDetailProps) {
  const t = useTranslations("dataset");
  const tDetail = useTranslations("dataset.detail");
  const locale = useLocale();
  const base = `/${locale}`;

  const [activeTab, setActiveTab] = useState<DetailTab>("preview");
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [apiAccessOpen, setApiAccessOpen] = useState(false);

  const { user } = useAuthStore();
  const addBookmarkMutation = useAddBookmark();
  const canBookmark = user?.role === "agency" || user?.role === "admin";

  const previewQuery = useDatasetPreview(
    datasetId,
    activeTab === "preview"
  );
  const citationQuery = useDatasetCitation(
    datasetId,
    activeTab === "citation"
  );

  const previewTable = previewQuery.data
    ? mapPreviewToTable(previewQuery.data)
    : { columns: [], rows: [] };

  const sectionTabClass = (active: boolean) =>
    `border-b-2 pb-3 font-kanit text-label font-bold transition-colors ${
      active
        ? "border-primary-dark text-primary-dark"
        : "border-transparent text-text-muted hover:text-primary-dark"
    }`;

  return (
    <>
      <section className="border-b border-border-default/60 bg-surface-card px-4 py-spacing-6 md:px-spacing-10">
        <div className="mx-auto max-w-container-max">
          <nav
            className="mb-4 flex flex-wrap items-center gap-2 font-sarabun text-caption text-text-muted"
            aria-label="Breadcrumb"
          >
            <Link href={base} className="hover:text-primary-dark">
              {tDetail("breadcrumbHome")}
            </Link>
            <ChevronRight />
            <Link href={`${base}/search`} className="hover:text-primary-dark">
              {tDetail("breadcrumbCategory")}
            </Link>
            <ChevronRight />
            <span className="line-clamp-1 text-text-secondary">{detail.title}</span>
          </nav>

          <div className="flex flex-col items-start justify-between gap-6 md:flex-row">
            <div className="flex-1">
              <h1 className="mb-4 font-kanit text-heading-2 text-text-primary md:text-heading-1">
                {detail.title}
              </h1>

              <div className="mb-6 flex flex-wrap gap-2">
                <span className="rounded-radius-full bg-primary-light px-3 py-1 font-sarabun text-label font-medium text-primary-dark">
                  {detail.categoryLabel}
                </span>
                <span className="rounded-radius-full bg-surface-container px-3 py-1 font-sarabun text-label font-medium text-text-secondary">
                  {detail.license === "open"
                    ? tDetail("openDataCommon")
                    : licenseLabel(detail.license, t)}
                </span>
                {detail.status === "published" && (
                  <span className="inline-flex items-center gap-1 rounded-radius-full bg-status-published-bg px-3 py-1 font-sarabun text-label font-medium text-status-published">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t("statusPublished")}
                  </span>
                )}
              </div>

              <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-8">
                <div className="flex items-center gap-2 text-text-secondary">
                  <svg className="h-5 w-5 shrink-0 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="font-sarabun text-label">
                    {tDetail("agency")}: {detail.agencyName}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                  <svg className="h-5 w-5 shrink-0 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-sarabun text-label" suppressHydrationWarning>
                    {isUpdated ? tDetail("updatedAt") : tDetail("publishedAt")}: {publishedDateLabel}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                  <svg className="h-5 w-5 shrink-0 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span className="font-sarabun text-label" suppressHydrationWarning>
                    {tDetail("downloads")}: {downloadCountLabel} {tDetail("downloadsUnit")}
                  </span>
                </div>
              </div>

            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 md:self-start">
              <button
                type="button"
                onClick={() => setDownloadOpen(true)}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-radius-md bg-primary px-6 py-2.5 font-sarabun text-label font-medium text-white shadow-level-1 transition-all hover:bg-primary-hover active:scale-[0.98]"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {tDetail("download")}
              </button>
              {canBookmark && (
                <button
                  type="button"
                  onClick={() => addBookmarkMutation.mutate(datasetId)}
                  disabled={addBookmarkMutation.isPending}
                  className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-radius-md border border-border-input p-2.5 text-text-secondary transition-colors hover:bg-surface-container disabled:opacity-50"
                  aria-label={tDetail("bookmark")}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              )}
              <Link
                href={`${base}/datasets/${datasetId}/compare`}
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-radius-md border border-border-input p-2.5 text-text-secondary transition-colors hover:bg-surface-container"
                aria-label={tDetail("compare")}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4M16 17H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </Link>
              <button
                type="button"
                onClick={() => setApiAccessOpen(true)}
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-radius-md border border-border-input p-2.5 text-text-secondary transition-colors hover:bg-surface-container"
                aria-label={tDetail("apiAccess")}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 6.75L22.5 12l-5.25 5.25M6.75 17.25L1.5 12l5.25-5.25M14.25 3.75l-4.5 16.5" />
                </svg>
              </button>
            </div>
          </div>

          <div className="mt-6 flex w-full flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex w-full max-w-md flex-col gap-2">
              <div className="flex justify-between font-sarabun text-label font-medium">
                <span className="text-text-muted">{tDetail("qualityScore")}</span>
                <span className="text-primary">
                  {detail.qualityScore}/100
                </span>
              </div>
              <div className="h-1.5 w-full rounded-radius-full bg-surface-container">
                <div
                  className="h-1.5 rounded-radius-full bg-primary transition-all"
                  style={{ width: `${detail.qualityScore}%` }}
                />
              </div>
            </div>

            <DatasetRating
              datasetId={datasetId}
              isPublished={isPublished ?? false}
              initialAvg={ratingAvg ?? 0}
              initialCount={ratingCount ?? 0}
              viewCount={viewCount ?? 0}
            />
          </div>
        </div>
      </section>

      <section className="bg-surface-page px-4 py-spacing-6 md:px-spacing-10">
        <div className="mx-auto max-w-container-max">
          <div className="rounded-radius-lg border border-border-default/80 bg-surface-card p-spacing-6 shadow-level-1">
            <h2 className="mb-4 font-kanit text-heading-3-mobile text-text-primary">
              {tDetail("description")}
            </h2>
            <p className="mb-6 font-sarabun text-body-md leading-relaxed text-text-secondary">
              {detail.description}
            </p>
            <div>
              <span className="mb-2 block font-sarabun text-label font-medium text-text-muted">
                {tDetail("tags")}
              </span>
              <DatasetTags tags={[]} />
            </div>
            {detail.subcategoryLabel && (
              <p className="mt-4 font-sarabun text-caption text-text-muted">
                {detail.subcategoryLabel}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="bg-surface-page px-4 pb-spacing-6 md:px-spacing-10">
        <div className="mx-auto max-w-container-max">
          <div
            className="mb-6 flex gap-8 border-b border-border-default"
            role="tablist"
            aria-label={tDetail("dataTabs")}
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "preview"}
              className={sectionTabClass(activeTab === "preview")}
              onClick={() => setActiveTab("preview")}
            >
              {tDetail("tabPreview")}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "citation"}
              className={sectionTabClass(activeTab === "citation")}
              onClick={() => setActiveTab("citation")}
            >
              {tDetail("tabCitation")}
            </button>
          </div>

          {activeTab === "preview" && (
            <div role="tabpanel">
              {previewQuery.isLoading && (
                <div className="animate-pulse rounded-radius-lg border border-border-default bg-surface-card p-8">
                  <div className="mb-4 h-6 w-48 rounded-radius-sm bg-surface-container" />
                  <div className="space-y-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-8 rounded-radius-sm bg-surface-container"
                      />
                    ))}
                  </div>
                </div>
              )}
              {previewQuery.isError && (
                <p className="font-sarabun text-body-md text-status-error" role="alert">
                  {previewQuery.error?.message ?? tDetail("previewLoadError")}
                </p>
              )}
              {previewQuery.isSuccess && (
                <PreviewTable
                  columns={previewTable.columns}
                  rows={previewTable.rows}
                />
              )}
            </div>
          )}

          {activeTab === "citation" && (
            <div role="tabpanel" id="dataset-citation">
              <CitationBox
                apa={citationQuery.data?.apa ?? ""}
                vancouver={citationQuery.data?.vancouver ?? ""}
                isLoading={citationQuery.isLoading}
                errorMessage={
                  citationQuery.isError
                    ? citationQuery.error?.message ?? tDetail("citationLoadError")
                    : null
                }
              />
            </div>
          )}
        </div>
      </section>

      <DownloadModal
        open={downloadOpen}
        onClose={() => setDownloadOpen(false)}
        datasetId={datasetId}
        sourceFileFormat={sourceFileFormat}
      />

      <ApiAccessModal
        open={apiAccessOpen}
        onClose={() => setApiAccessOpen(false)}
        datasetId={datasetId}
        previewData={previewQuery.data ?? null}
      />
    </>
  );
}
