"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import type { Scholarship } from "@/hooks/useScholarships";

type ScholarshipCardProps = {
  scholarship: Scholarship;
};

function isClosed(closeDate: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const close = new Date(closeDate);
  close.setHours(0, 0, 0, 0);
  return close < today;
}

function formatDate(value: string, locale: string): string {
  return new Date(value).toLocaleDateString(
    locale === "th" ? "th-TH" : "en-US",
    { year: "numeric", month: "short", day: "numeric" }
  );
}

export default function ScholarshipCard({ scholarship }: ScholarshipCardProps) {
  const locale = useLocale();
  const t = useTranslations("scholarship");
  const tCard = useTranslations("scholarship.card");
  const tTypes = useTranslations("scholarship.types");
  const tLevels = useTranslations("scholarship.levels");
  const closed = isClosed(scholarship.close_date);

  const amountFormatted = scholarship.amount
    ? scholarship.amount.toLocaleString(locale === "th" ? "th-TH" : "en-US")
    : null;

  return (
    <article className="flex h-full flex-col rounded-2xl border border-border-default/60 bg-white p-5 shadow-level-1 transition-all hover:shadow-level-2">
      {/* Tags */}
      <div className="mb-2 flex items-center gap-2">
        <span
          className="rounded-full border px-3 py-1 font-sarabun text-caption font-semibold"
          style={{ borderColor: "#00897b", color: "#00695c" }}
        >
          {tTypes(scholarship.scholarship_type)}
        </span>
        <span className="rounded-full border border-border-default px-3 py-1 font-sarabun text-caption font-medium text-text-secondary">
          {tLevels(scholarship.target_level)}
        </span>
      </div>
      {/* Status */}
      <div className="mb-3">
        {!closed ? (
          <span
            className="inline-flex items-center gap-1 rounded-full px-3 py-1 font-sarabun text-caption font-bold text-white"
            style={{ backgroundColor: "#00695c" }}
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
            {t("filter.applicationStatus_open")}
          </span>
        ) : (
          <span
            className="inline-flex items-center gap-1 rounded-full border px-3 py-1 font-sarabun text-caption font-bold"
            style={{ borderColor: "#c41411", color: "#c41411" }}
          >
            {t("filter.applicationStatus_closed")}
          </span>
        )}
      </div>

      {/* Title */}
      <h2 className="mb-2 line-clamp-2 font-kanit text-body-lg font-bold" style={{ color: "#1a3a2a" }}>
        {scholarship.title}
      </h2>

      {/* Agency */}
      <p className="mb-4 font-sarabun text-caption text-text-muted">
        {tCard("agency")}: {scholarship.agency_name ?? t("common.noAgency")}
      </p>

      {/* Amount + Close Date */}
      <div className="mt-auto">
        {amountFormatted && (
          <div className="mb-3">
            <p className="font-sarabun text-caption text-text-muted">
              {locale === "th" ? "มูลค่าทุนสูงสุด" : "Max amount"}
            </p>
            <p className="font-kanit text-[1.5rem] font-bold" style={{ color: "#00695c" }}>
              {amountFormatted}{" "}
              <span className="text-label font-normal text-text-muted">{t("common.currency")}</span>
            </p>
          </div>
        )}

        <div className="mb-4 flex items-center gap-1.5">
          <svg className="h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {closed ? (
            <span className="font-sarabun text-caption font-bold" style={{ color: "#c41411" }}>
              {t("common.closedBadge")}
            </span>
          ) : (
            <span className="font-sarabun text-caption text-text-secondary">
              {tCard("closeDate")}: {formatDate(scholarship.close_date, locale)}
            </span>
          )}
        </div>

        <Link
          href={`/${locale}/scholarship/${scholarship.id}`}
          className="flex min-h-[44px] w-full items-center justify-center rounded-xl font-sarabun text-label font-bold text-white transition-all hover:opacity-90"
          style={{ backgroundColor: "#004d40" }}
        >
          {tCard("viewDetail")}
        </Link>
      </div>
    </article>
  );
}
