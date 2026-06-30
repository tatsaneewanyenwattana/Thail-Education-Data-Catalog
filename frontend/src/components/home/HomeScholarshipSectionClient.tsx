"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import ScholarshipRecentListItem from "@/components/scholarship/ScholarshipRecentListItem";
import type { Scholarship } from "@/hooks/useScholarships";
import { useScholarships } from "@/hooks/useScholarships";

const HOME_SCHOLARSHIP_LIMIT = 6;

const TYPE_COLORS: Record<string, string> = {
  government: "bg-primary",
  private: "bg-[#f59e0b]",
  international: "bg-status-error",
};

function ScholarshipCompactItem({ scholarship, locale }: { scholarship: Scholarship; locale: string }) {
  const tTypes = useTranslations("scholarship.types");
  const uiLocale = useLocale();

  const dotColor = TYPE_COLORS[scholarship.scholarship_type] ?? "bg-text-muted";
  const deadline = new Date(scholarship.close_date).toLocaleDateString(
    uiLocale === "th" ? "th-TH" : "en-US",
    { year: "numeric", month: "short", day: "numeric" }
  );

  return (
    <Link href={`/${locale}/scholarship/${scholarship.id}`} className="group block">
      <div className="flex items-start gap-3">
        <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-radius-full ${dotColor}`} />
        <div className="min-w-0">
          <span className="font-sarabun text-caption font-semibold uppercase text-text-muted">
            {tTypes(scholarship.scholarship_type)}
          </span>
          <h4 className="mt-0.5 font-kanit text-body-sm font-semibold text-text-primary transition-colors group-hover:text-primary-dark">
            {scholarship.title}
          </h4>
          <p className="mt-1 font-sarabun text-caption text-text-muted line-clamp-2">
            {scholarship.description}
          </p>
          <p className="mt-1 font-sarabun text-caption text-text-muted">
            Deadline: {deadline}
          </p>
        </div>
      </div>
    </Link>
  );
}

type HomeScholarshipSectionClientProps = {
  locale: string;
  embedded?: boolean;
};

function ScholarshipListSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {Array.from({ length: HOME_SCHOLARSHIP_LIMIT }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-border-default bg-surface-card p-5"
        >
          <div className="mb-3 h-4 w-1/3 rounded-radius-sm bg-surface-container" />
          <div className="mb-2 h-5 w-2/3 rounded-radius-sm bg-surface-container" />
          <div className="h-4 w-1/2 rounded-radius-sm bg-surface-container" />
        </div>
      ))}
    </div>
  );
}

export default function HomeScholarshipSectionClient({
  locale,
  embedded = false,
}: HomeScholarshipSectionClientProps) {
  const t = useTranslations("home.scholarships");
  const { data, isLoading, isError, error } = useScholarships({
    sort: "updated_at",
    order: "desc",
    page: 1,
    page_size: HOME_SCHOLARSHIP_LIMIT,
  });

  const items = (data?.items ?? []).slice(0, HOME_SCHOLARSHIP_LIMIT);

  if (!isLoading && !isError && items.length === 0) {
    return null;
  }

  if (embedded) {
    return (
      <div className="rounded-2xl p-6 shadow-level-1" style={{ backgroundColor: "#f2f4f6" }}>
        <h2 className="mb-1 font-kanit text-heading-3 text-text-primary">
          {t("title")}
        </h2>
        <p className="mb-6 font-sarabun text-body-sm text-text-secondary">
          {t("subtitle")}
        </p>

        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="mb-2 h-3 w-1/3 rounded-radius-sm bg-surface-container" />
                <div className="mb-1 h-4 w-2/3 rounded-radius-sm bg-surface-container" />
                <div className="h-3 w-1/2 rounded-radius-sm bg-surface-container" />
              </div>
            ))}
          </div>
        )}

        {isError && (
          <p className="font-sarabun text-body-sm text-status-error" role="alert">
            {error?.message ?? t("loadError")}
          </p>
        )}

        {!isLoading && !isError && items.length > 0 && (
          <div className="space-y-5">
            {items.slice(0, 4).map((scholarship) => (
              <ScholarshipCompactItem key={scholarship.id} scholarship={scholarship} locale={locale} />
            ))}
          </div>
        )}

        <Link
          href={`/${locale}/scholarship`}
          className="relative mt-6 inline-flex items-center gap-1 py-2 pl-5 pr-7 font-sarabun text-label font-normal text-white"
          style={{
            backgroundColor: "#33691e",
            clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%)",
          }}
        >
          {t("viewAll")}
        </Link>
      </div>
    );
  }

  return (
    <section className="bg-surface-card py-12 md:py-20">
      <div className="mx-auto max-w-container-max px-4 md:px-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between md:mb-10">
          <div>
            <h2 className="font-kanit text-heading-2 text-text-primary">
              {t("title")}
            </h2>
            <p className="mt-2 font-sarabun text-body-md text-text-secondary">
              {t("subtitle")}
            </p>
          </div>
          <Link
            href={`/${locale}/scholarship`}
            className="inline-flex shrink-0 items-center gap-1 font-sarabun text-label font-bold text-primary hover:underline"
          >
            {t("viewAll")}
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
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>

        {isLoading && <ScholarshipListSkeleton />}

        {isError && (
          <p className="font-sarabun text-body-md text-status-error" role="alert">
            {error?.message ?? t("loadError")}
          </p>
        )}

        {!isLoading && !isError && items.length > 0 && (
          <div className="space-y-4">
            {items.map((scholarship) => (
              <ScholarshipRecentListItem
                key={scholarship.id}
                scholarship={scholarship}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
