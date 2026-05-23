"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import type { DatasetDetailMock, DatasetLicense } from "@/data/mockData";
import CitationBox from "./CitationBox";
import DatasetTags from "./DatasetTags";
import DownloadModal from "./DownloadModal";
import PreviewTable from "./PreviewTable";

type DatasetDetailProps = {
  dataset: DatasetDetailMock;
  publishedDateLabel: string;
  downloadCountLabel: string;
};

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
  dataset,
  publishedDateLabel,
  downloadCountLabel,
}: DatasetDetailProps) {
  const t = useTranslations("dataset");
  const tDetail = useTranslations("dataset.detail");
  const locale = useLocale();
  const router = useRouter();
  const [downloadOpen, setDownloadOpen] = useState(false);

  const title = locale === "th" ? dataset.titleTh : dataset.titleEn;
  const description = locale === "th" ? dataset.descriptionTh : dataset.descriptionEn;
  const category = locale === "th" ? dataset.categoryTh : dataset.categoryEn;
  const subcategory = locale === "th" ? dataset.subcategoryTh : dataset.subcategoryEn;
  const agency = locale === "th" ? dataset.agencyTh : dataset.agencyEn;
  const tags = locale === "th" ? dataset.tagsTh : dataset.tagsEn;
  const base = `/${locale}`;

  function scrollToCitation() {
    if (typeof window === "undefined") return;
    document.getElementById("dataset-citation")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      {/* Header */}
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
            <span className="text-text-secondary line-clamp-1">{title}</span>
          </nav>

          <div className="flex flex-col items-start justify-between gap-6 md:flex-row">
            <div className="flex-1">
              <h1 className="mb-4 font-kanit text-heading-2 text-text-primary md:text-heading-1">
                {title}
              </h1>

              <div className="mb-6 flex flex-wrap gap-2">
                <span className="rounded-radius-full bg-primary-light px-3 py-1 font-sarabun text-label font-medium text-primary-dark">
                  {category}
                </span>
                <span className="rounded-radius-full bg-surface-container px-3 py-1 font-sarabun text-label font-medium text-text-secondary">
                  {dataset.license === "open"
                    ? tDetail("openDataCommon")
                    : licenseLabel(dataset.license, t)}
                </span>
                {dataset.status === "published" && (
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
                    {tDetail("agency")}: {agency}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                  <svg className="h-5 w-5 shrink-0 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-sarabun text-label" suppressHydrationWarning>
                    {tDetail("publishedAt")}: {publishedDateLabel}
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

              <div className="flex max-w-sm flex-col gap-2">
                <div className="flex justify-between font-sarabun text-label font-medium">
                  <span className="text-text-muted">{tDetail("qualityScore")}</span>
                  <span className="text-primary">
                    {dataset.qualityScore}/100
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-radius-full bg-surface-container">
                  <div
                    className="h-1.5 rounded-radius-full bg-primary transition-all"
                    style={{ width: `${dataset.qualityScore}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
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
              <button
                type="button"
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-radius-md border border-border-input p-2.5 text-text-secondary transition-colors hover:bg-surface-container"
                aria-label={tDetail("bookmark")}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => router.push(`${base}/datasets/${dataset.id}/compare`)}
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-radius-md border border-border-input p-2.5 text-text-secondary transition-colors hover:bg-surface-container"
                aria-label={tDetail("compare")}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4M16 17H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </button>
              <button
                type="button"
                onClick={scrollToCitation}
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-radius-md border border-border-input p-2.5 text-text-secondary transition-colors hover:bg-surface-container"
                aria-label={tDetail("quote")}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="bg-surface-page px-4 py-spacing-6 md:px-spacing-10">
        <div className="mx-auto max-w-container-max">
          <div className="rounded-radius-lg border border-border-default/80 bg-surface-card p-spacing-6 shadow-level-1">
            <h2 className="mb-4 font-kanit text-heading-3-mobile text-text-primary">
              {tDetail("description")}
            </h2>
            <p className="mb-6 font-sarabun text-body-md leading-relaxed text-text-secondary">
              {description}
            </p>
            <div>
              <span className="mb-2 block font-sarabun text-label font-medium text-text-muted">
                {tDetail("tags")}
              </span>
              <DatasetTags tags={tags} />
            </div>
            <p className="mt-4 font-sarabun text-caption text-text-muted">
              {subcategory}
            </p>
          </div>
        </div>
      </section>

      <PreviewTable columns={dataset.columns} rows={dataset.previewData} />

      <div id="dataset-citation">
        <CitationBox dataset={dataset} />
      </div>

      <DownloadModal
        open={downloadOpen}
        onClose={() => setDownloadOpen(false)}
        datasetId={dataset.id}
      />
    </>
  );
}
