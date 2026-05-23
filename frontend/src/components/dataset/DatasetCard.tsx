"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import type { DatasetLicense, DatasetStatus, HomeDatasetMock } from "@/data/mockData";

type DatasetCardProps = HomeDatasetMock & {
  variant?: "popular" | "latest";
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
  updatedAt,
  license,
  variant = "popular",
}: DatasetCardProps) {
  const t = useTranslations("dataset");
  const locale = useLocale();

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
        <span className="rounded-radius-sm bg-status-draft-bg px-2 py-1 font-sarabun text-caption font-bold uppercase text-status-draft">
          {category}
        </span>
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

      <h3 className="mb-3 font-kanit text-heading-3-mobile text-text-primary transition-colors group-hover:text-primary-dark md:text-heading-3">
        {title}
      </h3>

      <div className="mb-6 flex items-start gap-2 font-sarabun text-label text-text-secondary">
        <DomainIcon />
        <span className="line-clamp-2">{agency}</span>
      </div>

      {variant === "popular" ? (
        <div className="mt-auto flex items-center justify-between border-t border-border-default/80 pt-4">
          <div className="flex items-center gap-4 font-sarabun text-caption font-medium text-text-muted">
            <span className="flex items-center gap-1">
              <DownloadIcon />
              {formatDownloadCount(downloadCount, locale)}
            </span>
            <span>{formatRelativeDate(updatedAt, locale)}</span>
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
