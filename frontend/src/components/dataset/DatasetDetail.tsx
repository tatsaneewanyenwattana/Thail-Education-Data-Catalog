"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import type { DatasetLicense } from "@/types/dataset";
import type { DatasetDetailView } from "@/types/dataset";
import { useAddBookmark } from "@/hooks/useBookmarks";
import { useDatasetCitation } from "@/hooks/useDatasetCitation";
import { useDatasetPreview } from "@/hooks/useDatasetPreview";
import { useAuthStore } from "@/stores/useAuthStore";
import { mapPreviewToTable } from "@/utils/datasetDetailMappers";
import { getAvailableDownloadFormats, DOWNLOAD_FORMAT_LABELS } from "@/utils/downloadFormats";
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
  tagNames?: string[];
  files?: Array<{ id: string; file_name: string; file_size: number; file_format: string }>;
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

const FORMAT_ICON_COLORS: Record<string, { bg: string; text: string }> = {
  csv: { bg: "#e3f2fd", text: "#1565c0" },
  excel: { bg: "#e8f5e9", text: "#2e7d32" },
  xlsx: { bg: "#e8f5e9", text: "#2e7d32" },
  pdf: { bg: "#ffebee", text: "#c62828" },
  json: { bg: "#fff3e0", text: "#e65100" },
  xml: { bg: "#ede7f6", text: "#4527a0" },
  sql: { bg: "#e0f2f1", text: "#00695c" },
};

const FORMAT_FULL_NAMES: Record<string, string> = {
  csv: "Comma Separated",
  excel: "Microsoft Excel",
  xlsx: "Microsoft Excel",
  json: "JavaScript Object",
  xml: "Extensible Markup",
  pdf: "Dictionary Info",
  sql: "SQL Database",
};

function FileFormatBadge({ format }: { format: string }) {
  const lower = format.toLowerCase();
  const colors = FORMAT_ICON_COLORS[lower] ?? { bg: "#f5f5f5", text: "#616161" };
  const fullName = FORMAT_FULL_NAMES[lower] ?? format.toUpperCase();
  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-border-default/60 bg-white px-3 py-2">
      <span
        className="rounded px-1.5 py-0.5 text-[11px] font-bold uppercase"
        style={{ backgroundColor: colors.bg, color: colors.text }}
      >
        {DOWNLOAD_FORMAT_LABELS[lower as keyof typeof DOWNLOAD_FORMAT_LABELS] ?? format.toUpperCase()}
      </span>
      <span className="font-sarabun text-caption text-text-secondary">{fullName}</span>
    </div>
  );
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
  tagNames,
  files,
}: DatasetDetailProps) {
  const t = useTranslations("dataset");
  const tDetail = useTranslations("dataset.detail");
  const locale = useLocale();
  const base = `/${locale}`;

  const [activeTab, setActiveTab] = useState<DetailTab>("preview");
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [apiAccessOpen, setApiAccessOpen] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string | undefined>(undefined);

  const { user } = useAuthStore();
  const addBookmarkMutation = useAddBookmark();
  const canBookmark = user?.role === "agency" || user?.role === "admin";

  const hasMultipleFiles = (files?.length ?? 0) > 1;
  const selectedFile = hasMultipleFiles && selectedFileId
    ? files?.find((f) => f.id === selectedFileId)
    : files?.[0];
  const effectiveFileFormat = selectedFile?.file_format ?? sourceFileFormat;

  const previewQuery = useDatasetPreview(datasetId, activeTab === "preview", selectedFileId);
  const citationQuery = useDatasetCitation(datasetId, activeTab === "citation");

  const previewTable = previewQuery.data
    ? mapPreviewToTable(previewQuery.data)
    : { columns: [], rows: [] };

  const availableFormats = useMemo(
    () => getAvailableDownloadFormats(effectiveFileFormat),
    [effectiveFileFormat]
  );

  const sectionTabClass = (active: boolean) =>
    `border-b-2 pb-3 font-kanit text-label font-bold transition-colors ${
      active
        ? "border-primary-dark text-primary-dark"
        : "border-transparent text-text-muted hover:text-primary-dark"
    }`;

  return (
    <>
      {/* Breadcrumb + Header */}
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
            <span className="line-clamp-1 font-semibold text-primary-dark">{detail.title}</span>
          </nav>

          <div className="flex flex-col items-start justify-between gap-6 md:flex-row">
            <div className="flex-1">
              <div className="mb-3 flex items-center gap-2">
                {detail.status === "published" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 font-sarabun text-caption font-semibold text-green-700">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    {t("statusPublished")}
                  </span>
                )}
              </div>

              <h1 className="mb-2 font-kanit text-heading-2 font-bold text-primary md:text-heading-1">
                {detail.title}
              </h1>
              <p className="mb-2 flex items-center gap-2 font-sarabun text-label text-text-secondary">
                <svg className="h-5 w-5 shrink-0 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {detail.agencyName}
              </p>
              <p className="font-sarabun text-body-md text-text-muted">
                {detail.description.length > 120
                  ? `${detail.description.slice(0, 120)}...`
                  : detail.description}
              </p>
            </div>

            <div className="flex flex-col items-end gap-4 md:self-start">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDownloadOpen(true)}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-radius-full bg-gradient-to-b from-primary-hover to-primary-dark px-8 py-2.5 font-sarabun text-label font-bold text-white shadow-level-1 transition-all hover:brightness-110 active:scale-[0.98]"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {tDetail("download")}
                </button>
                <button
                  type="button"
                  onClick={() => setApiAccessOpen(true)}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-radius-full border-2 border-primary px-6 py-2.5 font-sarabun text-label font-bold text-primary transition-all hover:bg-primary hover:text-white"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  {tDetail("apiAccess")}
                </button>
                {canBookmark && (
                  <button
                    type="button"
                    onClick={() => addBookmarkMutation.mutate(datasetId)}
                    disabled={addBookmarkMutation.isPending}
                    className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-radius-full border border-border-default bg-white p-2.5 text-text-secondary transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
                    aria-label={tDetail("bookmark")}
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                )}
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
        </div>
      </section>

      {/* Description + Sidebar */}
      <section className="bg-surface-page px-4 pb-spacing-6 md:px-spacing-10">
        <div className="mx-auto grid max-w-container-max grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: Description + Preview */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            <div className="rounded-2xl border border-border-default/60 bg-white p-6 shadow-level-1">
              <div className="mb-4 flex items-center gap-2">
                <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h2 className="font-kanit text-heading-3-mobile font-bold text-primary">
                  {tDetail("description")}
                </h2>
              </div>
              <hr className="mb-4 border-border-default/60" />
              <p className="mb-6 font-sarabun text-body-md leading-relaxed text-text-secondary">
                {detail.description}
              </p>

              <div className="flex flex-wrap gap-3">
                {availableFormats.map((fmt) => (
                  <FileFormatBadge key={fmt} format={fmt} />
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border-default/60 bg-white p-6 shadow-level-1">
              {hasMultipleFiles && files && (
                <div className="mb-4">
                  <h3 className="mb-3 flex items-center gap-2 font-kanit text-body-md font-bold text-primary">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    {locale === "th" ? `ไฟล์ทั้งหมด (${files.length})` : `All files (${files.length})`}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {files.map((file) => {
                      const isActive = selectedFileId === file.id || (!selectedFileId && file.id === files[0].id);
                      const colors = FORMAT_ICON_COLORS[file.file_format] ?? { bg: "#f5f5f5", text: "#616161" };
                      return (
                        <button
                          key={file.id}
                          type="button"
                          onClick={() => setSelectedFileId(file.id)}
                          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition-all ${
                            isActive
                              ? "border-primary bg-primary-light/40 shadow-sm"
                              : "border-border-default hover:border-primary/50 hover:bg-surface-container"
                          }`}
                        >
                          <span
                            className="rounded px-1.5 py-0.5 text-[11px] font-bold uppercase"
                            style={{ backgroundColor: colors.bg, color: colors.text }}
                          >
                            {file.file_format}
                          </span>
                          <span className="font-sarabun text-caption text-text-primary">{file.file_name}</span>
                          <span className="font-sarabun text-caption text-text-muted">
                            ({(file.file_size / 1024).toFixed(0)} KB)
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <hr className="mt-4 border-border-default/60" />
                </div>
              )}

              {previewQuery.isLoading && (
                <div className="animate-pulse">
                  <div className="mb-4 h-6 w-48 rounded bg-surface-container" />
                  <div className="space-y-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-8 rounded bg-surface-container" />
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
                <PreviewTable columns={previewTable.columns} rows={previewTable.rows} />
              )}
            </div>
          </div>

          {/* Right: Metadata + Tags + API Button */}
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-border-default/60 bg-white p-6 shadow-level-1">
              <h3 className="mb-4 flex items-center gap-2 font-kanit text-body-md font-bold text-primary">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {locale === "th" ? "ข้อมูลเมทาดาตา" : "Metadata"}
              </h3>

              <div className="flex flex-col gap-4 font-sarabun">
                <div className="flex flex-col gap-0.5">
                  <span className="text-caption text-text-muted">{locale === "th" ? "หมวดหมู่" : "Category"}</span>
                  <span className="text-label font-medium text-text-primary">
                    {detail.categoryLabel}
                    {detail.subcategoryLabel ? ` › ${detail.subcategoryLabel}` : ""}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-caption text-text-muted">{locale === "th" ? "ปีข้อมูล" : "Data year"}</span>
                  <span className="text-label font-medium text-text-primary">{detail.yearLabel ?? "—"}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-caption text-text-muted">{locale === "th" ? "จังหวัด" : "Province"}</span>
                  <span className="text-label font-medium text-text-primary">
                    {detail.province ?? (locale === "th" ? "ทั่วประเทศ" : "Nationwide")}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-caption text-text-muted">{locale === "th" ? "รูปแบบไฟล์" : "File formats"}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {availableFormats.map((fmt) => {
                      const colors = FORMAT_ICON_COLORS[fmt.toLowerCase()] ?? { bg: "#f5f5f5", text: "#616161" };
                      return (
                        <span
                          key={fmt}
                          className="rounded-md px-2 py-0.5 text-caption font-bold uppercase"
                          style={{ backgroundColor: colors.bg, color: colors.text }}
                        >
                          {DOWNLOAD_FORMAT_LABELS[fmt.toLowerCase() as keyof typeof DOWNLOAD_FORMAT_LABELS] ?? fmt.toUpperCase()}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-caption text-text-muted">{locale === "th" ? "สัญญาอนุญาต" : "License"}</span>
                  <span className="text-label font-medium text-text-primary">
                    {detail.license === "open"
                      ? "Open Data Commons"
                      : licenseLabel(detail.license, t)}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-caption text-text-muted">{locale === "th" ? "วันที่เผยแพร่" : "Published"}</span>
                  <span className="text-label font-medium text-text-primary" suppressHydrationWarning>{publishedDateLabel}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-caption text-text-muted">{locale === "th" ? "อัปเดตล่าสุด" : "Last updated"}</span>
                  <span className="text-label font-medium text-text-primary" suppressHydrationWarning>
                    {isUpdated
                      ? new Date(detail.updatedAt).toLocaleDateString(
                          locale === "th" ? "th-TH" : "en-US",
                          { year: "numeric", month: "long", day: "numeric" }
                        )
                      : publishedDateLabel}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-caption text-text-muted">{locale === "th" ? "คะแนนคุณภาพ" : "Quality score"}</span>
                  <span className="text-label font-medium text-text-primary">{detail.qualityScore}/100</span>
                  <div className="mt-1 h-1.5 w-full rounded-full bg-gray-200">
                    <div
                      className="h-1.5 rounded-full bg-primary transition-all"
                      style={{ width: `${detail.qualityScore}%` }}
                    />
                  </div>
                </div>

                <hr className="border-border-default/60" />

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-caption text-text-muted">{locale === "th" ? "จำนวนดาวน์โหลด" : "Downloads"}</span>
                    <span className="font-kanit text-body-lg font-bold text-primary" suppressHydrationWarning>{downloadCountLabel}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-caption text-text-muted">{locale === "th" ? "จำนวนเข้าชม" : "Views"}</span>
                    <span className="font-kanit text-body-lg font-bold text-primary">
                      {(viewCount ?? 0).toLocaleString(locale)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border-default/60 bg-white p-6 shadow-level-1">
              <h3 className="mb-3 font-kanit text-label font-bold text-primary-dark">
                {tDetail("tags")}
              </h3>
              <DatasetTags tags={tagNames ?? []} />
            </div>

            <div className="rounded-2xl border border-border-default/60 bg-white p-6 shadow-level-1">
              <h3 className="mb-3 font-kanit text-label font-bold text-primary-dark">
                {tDetail("tabCitation")}
              </h3>
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
          </div>
        </div>
      </section>

      <DownloadModal
        open={downloadOpen}
        onClose={() => setDownloadOpen(false)}
        datasetId={datasetId}
        sourceFileFormat={effectiveFileFormat}
        fileId={selectedFileId}
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
