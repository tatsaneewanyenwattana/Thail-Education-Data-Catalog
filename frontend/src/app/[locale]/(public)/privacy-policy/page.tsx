"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import TableOfContents from "@/components/common/TableOfContents";
import { getPageContentBySlug, type PageContentSection } from "@/data/mockData";

const PAGE_SLUG = "privacy-policy";

function formatUpdatedAt(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale === "th" ? "th-TH" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function SectionBlock({
  section,
  index,
  locale,
}: {
  section: PageContentSection;
  index: number;
  locale: string;
}) {
  const title = locale === "th" ? section.titleTh : section.titleEn;
  const html = locale === "th" ? section.contentTh : section.contentEn;

  return (
    <section
      id={section.id}
      className="mb-spacing-12 scroll-mt-[120px] last:mb-0"
    >
      <h2 className="mb-4 font-kanit text-heading-3 text-surface-navy">
        {index + 1}. {title}
      </h2>
      <div
        className="static-page-content"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  );
}

export default function PrivacyPolicyPage() {
  const t = useTranslations("privacy");
  const locale = useLocale();
  const [showBackToTop, setShowBackToTop] = useState(false);

  const page = getPageContentBySlug(PAGE_SLUG);

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

  if (!page) {
    return (
      <div className="mx-auto max-w-container-max px-4 py-12 text-center font-sarabun text-body-md text-text-muted">
        {t("notFound")}
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
        <h1 className="font-kanit text-heading-2 font-bold leading-tight text-surface-navy md:text-heading-1">
          {title}
        </h1>
        <p className="mt-2 font-sarabun text-label text-text-muted">{updatedLabel}</p>
      </header>

      {tocSections.length > 0 && (
        <div className="sticky top-[72px] z-40 mb-spacing-6 md:hidden">
          <label className="sr-only" htmlFor="privacy-toc-mobile">
            {t("jumpToSection")}
          </label>
          <select
            id="privacy-toc-mobile"
            className="w-full rounded-radius-lg border border-border-input bg-surface-card p-4 font-sarabun text-label text-text-primary shadow-level-1 focus:border-border-focus focus:outline-none focus:ring-1 focus:ring-primary-dark/30"
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                document.getElementById(e.target.value)?.scrollIntoView({
                  behavior: "smooth",
                });
              }
            }}
          >
            <option value="">{t("jumpToSection")}</option>
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
          {page.sections.length === 0 ? (
            <p className="font-sarabun text-body-md text-text-secondary">
              {t("emptyContent")}
            </p>
          ) : (
            page.sections.map((section, index) => (
              <SectionBlock
                key={section.id}
                section={section}
                index={index}
                locale={locale}
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
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </main>
  );
}
