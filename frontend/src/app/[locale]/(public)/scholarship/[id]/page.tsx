"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useScholarship } from "@/hooks/useScholarships";
import { usePageView } from "@/hooks/usePageView";

type ScholarshipDetailPageProps = {
  params: { locale: string; id: string };
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
    { year: "numeric", month: "long", day: "numeric" }
  );
}

function formatAmount(
  amount: number | null,
  amountNote: string | null,
  locale: string,
  currencyLabel: string
): string | null {
  if (amount == null) return null;
  const formatted = amount.toLocaleString(
    locale === "th" ? "th-TH" : "en-US",
    { minimumFractionDigits: 0, maximumFractionDigits: 2 }
  );
  const base = `${formatted} ${currencyLabel}`;
  return amountNote ? `${base}/${amountNote}` : base;
}

function InfoCard({
  icon,
  label,
  value,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div
      className="flex items-center gap-4 rounded-2xl border bg-white px-6 py-5 shadow-level-1"
      style={danger ? { borderColor: "#c41411", borderWidth: 2 } : { borderColor: "rgba(0,0,0,0.08)" }}
    >
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: danger ? "#fef2f2" : "#e8f5e9", color: danger ? "#c41411" : "#00695c" }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="font-sarabun text-label text-text-muted">{label}</p>
        <p
          className="font-kanit text-body-lg font-bold"
          style={{ color: danger ? "#c41411" : "#1a3a2a" }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

export default function ScholarshipDetailPage({
  params,
}: ScholarshipDetailPageProps) {
  const locale = useLocale();
  const t = useTranslations("scholarship");
  const tDetail = useTranslations("scholarship.detail");
  const tTypes = useTranslations("scholarship.types");
  const tLevels = useTranslations("scholarship.levels");
  const { data: scholarship, isLoading, isError } = useScholarship(params.id);
  const { today, total } = usePageView("scholarship-detail");

  if (isLoading) {
    return (
      <div className="mx-auto max-w-container-max px-4 py-12 text-center font-sarabun text-body-md text-text-muted md:px-spacing-10">
        {t("common.loading")}
      </div>
    );
  }

  if (isError || !scholarship) {
    return (
      <div className="mx-auto max-w-container-max space-y-4 px-4 py-12 text-center md:px-spacing-10">
        <p className="font-sarabun text-body-md text-status-error">
          {tDetail("notFound")}
        </p>
        <Link
          href={`/${locale}/scholarship`}
          className="inline-flex font-sarabun text-label font-semibold text-primary hover:text-primary-hover"
        >
          {tDetail("back")}
        </Link>
      </div>
    );
  }

  const closed = isClosed(scholarship.close_date);
  const amountText = formatAmount(
    scholarship.amount,
    scholarship.amount_note,
    locale,
    t("common.currency")
  );

  return (
    <>
      {/* ── ส่วนบน: Breadcrumb + Tags + Title + Info Cards ── */}
      <section className="border-b border-border-default/40 bg-surface-card px-4 py-spacing-6 md:px-spacing-10">
        <div className="mx-auto max-w-container-max">
          {/* Breadcrumb */}
          <nav className="mb-4 flex items-center gap-1.5 font-sarabun text-caption text-text-muted">
            <Link href={`/${locale}`} className="transition-colors hover:text-primary" style={{ color: "#00695c" }}>
              {tDetail("breadcrumbHome")}
            </Link>
            <span>{">"}</span>
            <Link href={`/${locale}/scholarship`} className="transition-colors hover:text-primary" style={{ color: "#00695c" }}>
              {tDetail("breadcrumbScholarship")}
            </Link>
            <span>{">"}</span>
            <span style={{ color: "#00695c" }}>{tDetail("breadcrumbDetail")}</span>
          </nav>

          {/* Tags */}
          <div className="mb-3 flex items-center gap-2">
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

          {/* Title + Description */}
          <h1 className="mb-2 font-kanit text-[2rem] font-bold md:text-[2.5rem]" style={{ color: "#1a3a2a" }}>
            {scholarship.title}
          </h1>
          {scholarship.description && (
            <p className="mb-6 max-w-3xl font-sarabun text-body-lg leading-relaxed text-text-secondary">
              {scholarship.description.length > 150
                ? scholarship.description.slice(0, 150) + "..."
                : scholarship.description}
            </p>
          )}

          {/* Info Cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <InfoCard
              label={tDetail("agency")}
              value={scholarship.agency_name ?? t("common.noAgency")}
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              }
            />
            <InfoCard
              label={tDetail("lastUpdated")}
              value={formatDate(scholarship.updated_at, locale)}
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
            />
            {amountText && (
              <InfoCard
                label={tDetail("amount")}
                value={amountText}
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
            )}
            <InfoCard
              label={tDetail("closingDate")}
              value={formatDate(scholarship.close_date, locale)}
              danger={closed}
              icon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </div>
        </div>
      </section>

      {/* ── ส่วนเนื้อหา: 2 คอลัมน์ ── */}
      <section className="bg-surface-page px-4 py-spacing-6 md:px-spacing-10">
        <div className="mx-auto grid max-w-container-max grid-cols-1 gap-6 lg:grid-cols-3">
          {/* ซ้าย: รายละเอียด */}
          <div className="lg:col-span-2 space-y-6">
            {/* รายละเอียดทุน */}
            <div className="rounded-2xl border border-border-default/60 bg-white p-6 shadow-level-1">
              <div className="mb-4 flex items-center gap-2">
                <svg className="h-5 w-5" style={{ color: "#00695c" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h2 className="font-kanit text-[1.25rem] font-bold" style={{ color: "#1a3a2a" }}>
                  {tDetail("description")}
                </h2>
              </div>
              {scholarship.description && (
                <p className="mb-6 font-sarabun text-body-lg leading-relaxed text-text-primary whitespace-pre-wrap break-all">
                  {scholarship.description}
                </p>
              )}

              {/* คุณสมบัติผู้สมัคร */}
              <div className="mb-4 flex items-center gap-2">
                <svg className="h-5 w-5" style={{ color: "#00695c" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="font-kanit text-[1.25rem] font-bold" style={{ color: "#1a3a2a" }}>
                  {tDetail("eligibility")}
                </h3>
              </div>
              <div className="space-y-3 pl-1">
                {scholarship.eligibility.split("\n").filter(Boolean).map((line, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <svg className="mt-1 h-5 w-5 shrink-0" style={{ color: "#00897b" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-sarabun text-body-lg text-text-primary break-all">{line.replace(/^[-•]\s*/, "")}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ขวา: Sidebar */}
          <div className="space-y-5">
            {/* ปุ่มสมัคร */}
            {scholarship.application_url && (
              <a
                href={scholarship.application_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl font-kanit text-body-md font-bold text-white shadow-level-2 transition-all hover:opacity-90"
                style={{ backgroundColor: "#00695c" }}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {tDetail("applyWebsite")}
              </a>
            )}

            {/* ข้อมูลการติดต่อ */}
            <div className="rounded-2xl border border-border-default/60 bg-white p-5 shadow-level-1">
              <h3 className="mb-4 font-kanit text-body-md font-bold" style={{ color: "#1a3a2a" }}>
                {tDetail("contactInfo")}
              </h3>
              <div className="space-y-4">
                {scholarship.contact_phone && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: "#e8f5e9" }}>
                      <svg className="h-4 w-4" style={{ color: "#00695c" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-sarabun text-caption text-text-muted">{tDetail("phone")}</p>
                      <a href={`tel:${scholarship.contact_phone}`} className="font-sarabun text-body-md font-semibold" style={{ color: "#1a3a2a" }}>
                        {scholarship.contact_phone}
                      </a>
                    </div>
                  </div>
                )}

                {scholarship.contact_email && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: "#e8f5e9" }}>
                      <svg className="h-4 w-4" style={{ color: "#00695c" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-sarabun text-caption text-text-muted">{tDetail("email")}</p>
                      <a href={`mailto:${scholarship.contact_email}`} className="font-sarabun text-body-md font-semibold break-all" style={{ color: "#1a3a2a" }}>
                        {scholarship.contact_email}
                      </a>
                    </div>
                  </div>
                )}

                {scholarship.application_url && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: "#e8f5e9" }}>
                      <svg className="h-4 w-4" style={{ color: "#00695c" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="font-sarabun text-caption text-text-muted">{tDetail("website")}</p>
                      <a
                        href={scholarship.application_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-sarabun text-body-md font-semibold break-all hover:underline"
                        style={{ color: "#00695c" }}
                      >
                        {scholarship.application_url.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* รูปภาพทุน */}
            {scholarship.image_url && (
              <div className="aspect-square overflow-hidden rounded-2xl border border-border-default/60 bg-white shadow-level-1">
                <img
                  src={`${process.env.NEXT_PUBLIC_API_BASE_URL ?? ""}${scholarship.image_url}`}
                  alt={scholarship.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── ส่วนล่าง: สถิติการเข้าชม ── */}
      <section className="px-4 py-5 md:px-spacing-10" style={{ backgroundColor: "#004d40" }}>
        <div className="mx-auto flex max-w-container-max flex-wrap items-center justify-center gap-8">
          <div>
            <p className="font-kanit text-body-lg font-bold text-white">
              {tDetail("statsTitle")}
            </p>
            <p className="font-sarabun text-caption text-white/70">
              {tDetail("statsRealtime")}
            </p>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="font-kanit text-[2rem] font-bold" style={{ color: "#f9a825" }}>
                {today.toLocaleString()}
              </p>
              <p className="font-sarabun text-caption text-white/80">
                {tDetail("statsToday")}
              </p>
            </div>
            <div className="h-10 w-px bg-white/30" />
            <div className="text-center">
              <p className="font-kanit text-[2rem] font-bold" style={{ color: "#4dd0e1" }}>
                {total >= 1000
                  ? `${(total / 1000).toFixed(1)}K`
                  : total.toLocaleString()}
              </p>
              <p className="font-sarabun text-caption text-white/80">
                {tDetail("statsTotal")}
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
