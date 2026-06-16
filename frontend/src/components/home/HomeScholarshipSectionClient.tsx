"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import ScholarshipRecentListItem from "@/components/scholarship/ScholarshipRecentListItem";
import { useScholarships } from "@/hooks/useScholarships";

const HOME_SCHOLARSHIP_LIMIT = 6;

type HomeScholarshipSectionClientProps = {
  locale: string;
};

function ScholarshipListSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {Array.from({ length: HOME_SCHOLARSHIP_LIMIT }).map((_, i) => (
        <div
          key={i}
          className="rounded-radius-lg border border-border-default bg-surface-card p-5"
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
