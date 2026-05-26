"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import StaticPageSection from "@/components/common/StaticPageSection";
import TableOfContents from "@/components/common/TableOfContents";
import { usePageContent } from "@/hooks/usePageContent";

const PAGE_SLUG = "terms";

function formatUpdatedAt(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale === "th" ? "th-TH" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function TermsPageSkeleton() {
  return (
    <div className="mx-auto max-w-container-max animate-pulse px-4 py-spacing-12 md:px-spacing-10">
      <div className="mb-spacing-6 h-10 w-64 rounded-radius-sm bg-surface-container" />
      <div className="mb-spacing-8 h-4 w-48 rounded-radius-sm bg-surface-container" />
      <div className="flex gap-spacing-6">
        <div className="hidden h-80 w-[240px] rounded-radius-md bg-surface-container md:block" />
        <div className="flex-1 space-y-6 rounded-radius-lg border border-border-default bg-surface-card p-10">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-3">
              <div className="h-6 w-1/2 rounded-radius-sm bg-surface-container" />
              <div className="h-20 w-full rounded-radius-sm bg-surface-container" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TermsPage() {
  const t = useTranslations("terms");
  const tPrivacy = useTranslations("privacy");
  const locale = useLocale();
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

  if (isLoading && !page) {
    return <TermsPageSkeleton />;
  }

  if (!page) {
    return (
      <div className="mx-auto max-w-container-max px-4 py-12 text-center font-sarabun text-body-md text-text-muted">
        {tPrivacy("notFound")}
      </div>
    );
  }

  const title = locale === "th" ? page.titleTh : page.titleEn;
  const updatedLabel = t("lastUpdated", {
    date: formatUpdatedAt(page.updatedAt, locale),
  });

  return (
    <main className="mx-auto max-w-container-max px-4 py-spacing-12 md:px-spacing-10">
      <header className="mb-spacing-6">
        <h1 className="font-kanit text-heading-2 font-bold leading-tight text-text-primary md:text-heading-1">
          {title}
        </h1>
        <p className="mt-2 font-sarabun text-caption text-text-muted">
          {updatedLabel}
        </p>
      </header>

      {tocSections.length > 0 && (
        <div className="sticky top-[72px] z-40 mb-spacing-6 md:hidden">
          <label className="sr-only" htmlFor="terms-toc-mobile">
            {tPrivacy("jumpToSection")}
          </label>
          <select
            id="terms-toc-mobile"
            className="w-full rounded-radius-lg border border-border-input bg-surface-card p-4 font-sarabun text-label text-primary-dark shadow-level-1 focus:border-border-focus focus:outline-none focus:ring-1 focus:ring-primary-dark/30"
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                document.getElementById(e.target.value)?.scrollIntoView({
                  behavior: "smooth",
                });
              }
            }}
          >
            <option value="">{tPrivacy("jumpToSection")}</option>
            {tocSections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="relative flex flex-col gap-spacing-6 md:flex-row">
        {tocSections.length > 0 && (
          <aside className="hidden w-[240px] shrink-0 md:block">
            <div className="sticky top-[108px]">
              <TableOfContents sections={tocSections} />
            </div>
          </aside>
        )}

        <article className="min-w-0 flex-1 rounded-radius-lg border border-border-default/80 bg-surface-card p-6 shadow-level-1 md:p-10">
          <div className="space-y-spacing-12">
            {page.sections.length === 0 ? (
              <p className="font-sarabun text-body-md text-text-secondary">
                {tPrivacy("emptyContent")}
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
          </div>

          <div className="mt-spacing-12 flex flex-col items-center justify-between gap-4 border-t border-border-default/30 pt-spacing-6 md:flex-row">
            <p className="font-sarabun text-body-md text-text-secondary">
              {t("contactQuestion")}
            </p>
            <Link
              href={`/${locale}/privacy-policy`}
              className="rounded-radius-lg bg-surface-navy px-8 py-2.5 font-sarabun text-label text-surface-card transition-opacity hover:opacity-90"
            >
              {t("contactCta")}
            </Link>
          </div>
        </article>
      </div>

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-8 right-8 z-50 flex h-12 w-12 items-center justify-center rounded-radius-full bg-primary-dark text-surface-card shadow-level-2 transition-opacity ${
          showBackToTop ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-label={tPrivacy("backToTop")}
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
