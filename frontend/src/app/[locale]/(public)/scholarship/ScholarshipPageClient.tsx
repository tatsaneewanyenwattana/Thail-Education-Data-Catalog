"use client";

import { Suspense } from "react";
import { useLocale, useTranslations } from "next-intl";
import Pagination from "@/components/search/Pagination";
import SearchBar from "@/components/search/SearchBar";
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
  const tFilter = useTranslations("scholarship.filter");
  const tList = useTranslations("scholarship.list");
  const locale = useLocale();
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
  const totalItems = pagination?.total_items ?? items.length;
  const currentPage = pagination?.page ?? page;

  return (
    <>
      <section className="px-4 py-10 md:px-spacing-10 md:py-14" style={{ backgroundColor: "#00695c" }}>
        <div className="mx-auto max-w-container-max">
          <h1 className="mb-3 font-kanit text-[2rem] font-bold text-white md:text-[2.5rem]">
            {t("title")}
          </h1>
          <p className="mb-8 max-w-2xl font-sarabun text-body-md leading-relaxed text-white/90">
            {t("subtitle")}
          </p>
          <SearchBar syncUrl className="max-w-[600px]" />
        </div>
      </section>

      <section className="bg-surface-page px-4 py-spacing-6 md:px-spacing-10">
        <div className="mx-auto grid max-w-container-max grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <ScholarshipFilterSection />
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {/* Result header */}
            <div className="mb-5 rounded-2xl bg-white/80 px-5 py-3 shadow-level-1">
              <p className="font-sarabun text-label text-text-secondary">
                {tFilter("foundTotal", { count: totalItems })}
              </p>
            </div>

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
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
                  {items.map((scholarship) => (
                    <ScholarshipCard
                      key={scholarship.id}
                      scholarship={scholarship}
                    />
                  ))}
                </div>

                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={Math.max(1, totalPages)}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
