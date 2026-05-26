"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import StaticPageSection from "@/components/common/StaticPageSection";
import TableOfContents from "@/components/common/TableOfContents";
import { usePageContent } from "@/hooks/usePageContent";

const PAGE_SLUG = "help-center";

function formatUpdatedAt(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale === "th" ? "th-TH" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function HelpCenterSkeleton() {
  return (
    <div className="mx-auto max-w-container-max animate-pulse px-4 py-spacing-12 md:px-spacing-10">
      <div className="mb-spacing-6 h-10 w-64 rounded-radius-sm bg-surface-container" />
      <div className="h-48 w-full rounded-radius-lg bg-surface-container" />
    </div>
  );
}

export default function HelpCenterPage() {
  const t = useTranslations("privacy");
  const locale = useLocale();
  const base = `/${locale}`;
  const [showBackToTop, setShowBackToTop] = useState(false);

  const { data: page, isLoading, isError } = usePageContent(PAGE_SLUG);

  const tocSections = useMemo(() => {
    if (!page) return [];
    return page.sections.map((section, index) => ({
      id: section.id,
      label: `${index + 1}. ${locale === "th" ? section.titleTh : section.titleEn}`,
    }));
  }, [page, locale]);

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (isLoading) {
    return <HelpCenterSkeleton />;
  }

  if (isError || !page) {
    return (
      <div className="mx-auto max-w-container-max px-4 py-12 text-center">
        <p className="font-sarabun text-body-md text-text-muted">{t("notFound")}</p>
        <Link
          href={base}
          className="mt-4 inline-block font-sarabun text-label text-primary hover:underline"
        >
          {locale === "th" ? "กลับหน้าหลัก" : "Back to home"}
        </Link>
      </div>
    );
  }

  const title = locale === "th" ? page.titleTh : page.titleEn;

  return (
    <main className="mx-auto max-w-container-max px-4 py-spacing-12 md:px-spacing-10">
      <header className="mb-spacing-6">
        <h1 className="font-kanit text-heading-2 font-bold text-text-primary md:text-heading-1">
          {title}
        </h1>
        <p className="mt-2 font-sarabun text-label text-text-muted">
          {t("lastUpdated", {
            date: formatUpdatedAt(page.updatedAt, locale),
          })}
        </p>
      </header>

      <div className="relative flex flex-col gap-spacing-6 md:flex-row">
        {tocSections.length > 0 && (
          <aside className="hidden w-[240px] shrink-0 md:block">
            <div className="sticky top-[108px]">
              <TableOfContents sections={tocSections} />
            </div>
          </aside>
        )}

        <article className="min-w-0 flex-1 rounded-radius-lg border border-border-default/80 bg-surface-card p-6 shadow-level-1 md:p-10">
          {page.sections.length === 0 ? (
            <p className="font-sarabun text-body-md text-text-secondary">
              {t("emptyContent")}
            </p>
          ) : (
            page.sections.map((section, index) => (
              <StaticPageSection
                key={section.id}
                section={section}
                index={index}
                locale={locale}
                allowedLabel={t("allowed")}
                prohibitedLabel={t("prohibited")}
              />
            ))
          )}
        </article>
      </div>

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-8 right-8 z-50 flex h-12 w-12 items-center justify-center rounded-radius-full bg-primary-dark text-white shadow-level-2 transition-opacity ${
          showBackToTop ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-label={t("backToTop")}
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 15l7-7 7 7"
          />
        </svg>
      </button>
    </main>
  );
}
