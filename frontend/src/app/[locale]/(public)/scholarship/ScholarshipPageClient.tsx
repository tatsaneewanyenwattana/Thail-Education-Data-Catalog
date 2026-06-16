"use client";

import { Suspense } from "react";
import { useTranslations } from "next-intl";
import Pagination from "@/components/search/Pagination";
import ScholarshipCard from "@/components/scholarship/ScholarshipCard";
import ScholarshipFilter, {
  parseScholarshipFilterParams,
} from "@/components/scholarship/ScholarshipFilter";
import { useScholarships } from "@/hooks/useScholarships";

type ScholarshipPageClientProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

function ScholarshipFilterSection() {
  const t = useTranslations("scholarship");

  return (
    <Suspense
      fallback={
        <p className="py-4 text-center font-sarabun text-body-sm text-text-muted">
          {t("common.loading")}
        </p>
      }
    >
      <ScholarshipFilter />
    </Suspense>
  );
}

export default function ScholarshipPageClient({
  searchParams,
}: ScholarshipPageClientProps) {
  const t = useTranslations("scholarship");
  const tList = useTranslations("scholarship.list");
  const { page, q, scholarship_type, target_level, application_status } =
    parseScholarshipFilterParams(searchParams);

  const { data, isLoading, isError } = useScholarships({
    q: q || undefined,
    scholarship_type: scholarship_type || undefined,
    target_level: target_level || undefined,
    application_status: application_status || undefined,
    page,
    page_size: 20,
  });

  const items = data?.items ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.total_pages ?? 0;
  const currentPage = pagination?.page ?? page;

  return (
    <>
      <section className="border-b border-border-default/60 bg-surface-card px-4 py-spacing-6 md:px-spacing-10">
        <div className="mx-auto max-w-container-max">
          <h1 className="font-kanit text-heading-2 text-text-primary md:text-heading-1">
            {t("title")}
          </h1>
          <p className="mt-1 font-sarabun text-label text-text-muted">
            {t("subtitle")}
          </p>
        </div>
      </section>

      <section className="bg-surface-page px-4 py-spacing-6 md:px-spacing-10">
        <div className="mx-auto max-w-container-max space-y-spacing-6">
          <ScholarshipFilterSection />

          {isLoading && (
            <p className="py-12 text-center font-sarabun text-body-md text-text-muted">
              {t("common.loading")}
            </p>
          )}

          {isError && (
            <p className="py-12 text-center font-sarabun text-body-md text-status-error">
              {tList("loadError")}
            </p>
          )}

          {!isLoading && !isError && items.length === 0 && (
            <p className="py-12 text-center font-sarabun text-body-md text-text-muted">
              {tList("empty")}
            </p>
          )}

          {!isLoading && !isError && items.length > 0 && (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {items.map((scholarship) => (
                  <ScholarshipCard
                    key={scholarship.id}
                    scholarship={scholarship}
                  />
                ))}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={Math.max(1, totalPages)}
              />
            </>
          )}
        </div>
      </section>
    </>
  );
}
