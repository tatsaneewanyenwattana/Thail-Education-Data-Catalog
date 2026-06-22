"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import type { DatasetLicense, DatasetStatus, HomeDatasetMock } from "@/data/mockData";
import { useDatasetNewBadge } from "@/hooks/useDatasetNewBadge";

type DatasetCardProps = HomeDatasetMock & {
  variant?: "popular" | "latest";
  createdAt?: string;
};

function DomainIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  );
}

function formatDownloadCount(count: number, locale: string): string {
  if (count >= 1000) {
    const k = count / 1000;
    const formatted =
      k >= 10
        ? Math.round(k).toString()
        : k.toFixed(1).replace(/\.0$/, "");
    return `${formatted}k`;
  }
  return count.toLocaleString(locale);
}

function formatRelativeDate(iso: string, locale: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const rtf = new Intl.RelativeTimeFormat(locale === "th" ? "th-TH" : "en-US", {
    numeric: "auto",
  });

  if (diffDays < 1) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) {
      return rtf.format(0, "hour");
    }
    return rtf.format(-diffHours, "hour");
  }
  if (diffDays < 7) {
    return rtf.format(-diffDays, "day");
  }
  if (diffDays < 30) {
    return rtf.format(-Math.floor(diffDays / 7), "week");
  }
  return date.toLocaleDateString(locale === "th" ? "th-TH" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatAbsoluteDate(iso: string, locale: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString(locale === "th" ? "th-TH" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function licenseLabel(
  license: DatasetLicense,
  t: ReturnType<typeof useTranslations<"dataset">>
) {
  if (license === "open") return t("licenseOpen");
  if (license === "conditional") return t("licenseConditional");
  return t("licenseCc");
}

function statusLabel(
  status: DatasetStatus,
  t: ReturnType<typeof useTranslations<"dataset">>
) {
  if (status === "published") return t("statusPublished");
  if (status === "draft") return t("statusDraft");
  return t("statusPublished");
}

export default function DatasetCard({
  id,
  title,
  category,
  agency,
  status,
  downloadCount,
  apiDownloadCount = 0,
  viewCount = 0,
  qualityScore,
  fileFormat,
  updatedAt,
  createdAt,
  publishedAt,
  license,
  variant = "popular",
}: DatasetCardProps) {
  const t = useTranslations("dataset");
  const tCommon = useTranslations("notifications");
  const locale = useLocale();
  const showNewBadge = useDatasetNewBadge(id, publishedAt);

  // ถ้า updated_at != created_at → "อัปเดตล่าสุด" ถ้าเหมือนกัน → "เผยแพร่เมื่อ"
  const isUpdated =
    createdAt && updatedAt
      ? new Date(updatedAt).getTime() !== new Date(createdAt).getTime()
      : false;

  const isPublished = status === "published";
  const surfaceClass =
    variant === "latest"
      ? "bg-surface-page border-border-default/80 hover:border-primary/40"
      : "bg-surface-card border-border-default hover:shadow-level-2";

  return (
    <Link
      href={`/${locale}/datasets/${id}`}
      className={`group flex flex-col rounded-radius-lg border p-6 shadow-level-1 transition-all ${surfaceClass}`}
    >
      <div className="mb-4 flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="rounded-radius-sm bg-status-draft-bg px-2 py-1 font-sarabun text-caption font-bold uppercase text-status-draft">
            {category}
          </span>
          {showNewBadge && (
            <span className="inline-flex animate-new-blink items-center gap-1 rounded-radius-full bg-status-error px-2 py-0.5 font-sarabun text-caption font-bold text-white shadow-[0_0_0_2px_rgba(255,255,255,0.85)]">
              <span className="h-1.5 w-1.5 animate-new-blink rounded-radius-full bg-white" />
              {tCommon("newBadge")}
            </span>
          )}
        </div>
        {variant === "popular" && isPublished ? (
          <span className="flex items-center gap-1 rounded-radius-sm bg-primary-light px-2 py-1 font-sarabun text-caption font-bold text-primary-dark">
            <svg
              className="h-3.5 w-3.5 text-primary"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {statusLabel(status, t)}
          </span>
        ) : (
          <span className="font-sarabun text-caption font-bold text-text-muted">
            {formatRelativeDate(updatedAt, locale)}
          </span>
        )}
      </div>

      <h3 className="mb-2 font-kanit text-heading-3-mobile text-text-primary transition-colors group-hover:text-primary-dark md:text-heading-3">
        {title}
      </h3>

      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-sarabun text-caption text-text-muted">
        <span className="flex items-center gap-1">
          <DownloadIcon />
          {formatDownloadCount(downloadCount, locale)} {t("downloadsUnit")}
        </span>
        {apiDownloadCount > 0 && (
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
            </svg>
            API {formatDownloadCount(apiDownloadCount, locale)}
          </span>
        )}
        {viewCount > 0 && (
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {formatDownloadCount(viewCount, locale)}
          </span>
        )}
      </div>

      <div className="mb-6 flex items-start gap-2 font-sarabun text-label text-text-secondary">
        <DomainIcon />
        <span className="line-clamp-2">
          {t("agency")}: {agency}
        </span>
      </div>

      {variant === "popular" ? (
        <div className="mt-auto flex items-center justify-between border-t border-border-default/80 pt-4">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-sarabun text-caption font-medium text-text-muted">
            {qualityScore != null && (
              <span className="flex items-center gap-1" title={t("qualityScore")}>
                <svg className="h-3.5 w-3.5 text-status-published" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                {qualityScore}
              </span>
            )}
            {fileFormat && (
              <span className="rounded-radius-sm bg-status-error-bg px-1.5 py-0.5 text-[11px] font-bold uppercase text-status-error">
                {fileFormat}
              </span>
            )}
            <span>
              {isUpdated
                ? t("updatedLatest", { date: formatAbsoluteDate(updatedAt, locale) })
                : t("publishedAt", { date: formatAbsoluteDate(createdAt ?? updatedAt, locale) })}
            </span>
          </div>
          <svg
            className="h-5 w-5 text-primary opacity-0 transition-opacity group-hover:opacity-100"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </div>
      ) : (
        <div className="mt-auto flex flex-wrap gap-2">
          <span className="rounded-radius-sm bg-status-error-bg px-2 py-0.5 font-sarabun text-caption font-bold text-status-error">
            CSV
          </span>
          <span className="rounded-radius-sm bg-primary-light px-2 py-0.5 font-sarabun text-caption font-bold text-status-published">
            {licenseLabel(license, t)}
          </span>
        </div>
      )}
    </Link>
  );
}
