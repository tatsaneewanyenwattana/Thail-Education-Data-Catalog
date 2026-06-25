"use client";

import DOMPurify from "dompurify";
import type { PageContentSection } from "@/types/content";

type StaticPageSectionProps = {
  section: PageContentSection;
  index: number;
  locale: string;
  allowedLabel: string;
  prohibitedLabel: string;
};

function isRightsSection(
  section: PageContentSection
): section is Extract<PageContentSection, { type: "rights" }> {
  return section.type === "rights";
}

function isWarningSection(
  section: PageContentSection
): section is Extract<PageContentSection, { type: "warning" }> {
  return section.type === "warning";
}

export default function StaticPageSection({
  section,
  index,
  locale,
  allowedLabel,
  prohibitedLabel,
}: StaticPageSectionProps) {
  const title = locale === "th" ? section.titleTh : section.titleEn;

  if (isRightsSection(section)) {
    const allowed = locale === "th" ? section.allowedTh : section.allowedEn;
    const prohibited =
      locale === "th" ? section.prohibitedTh : section.prohibitedEn;

    return (
      <section
        id={section.id}
        className="scroll-mt-[120px] last:mb-0"
      >
        <h2 className="mb-4 font-kanit text-heading-3 text-text-primary">
          {index + 1}. {title}
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-radius-lg border border-primary/20 bg-status-published-bg p-spacing-6">
            <h3 className="mb-3 flex items-center gap-2 font-kanit text-label font-bold text-primary-dark">
              <CheckIcon />
              {allowedLabel}
            </h3>
            <ul className="list-inside list-disc space-y-2 font-sarabun text-label text-text-secondary">
              {allowed.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-radius-lg border border-status-error/10 bg-status-error-bg p-spacing-6">
            <h3 className="mb-3 flex items-center gap-2 font-kanit text-label font-bold text-status-error">
              <CancelIcon />
              {prohibitedLabel}
            </h3>
            <ul className="list-inside list-disc space-y-2 font-sarabun text-label text-text-secondary">
              {prohibited.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    );
  }

  if (isWarningSection(section)) {
    const warningText =
      locale === "th" ? section.contentTh : section.contentEn;
    const body =
      locale === "th"
        ? section.bodyTh ?? section.bodyEn
        : section.bodyEn ?? section.bodyTh;

    return (
      <section
        id={section.id}
        className="scroll-mt-[120px] last:mb-0"
      >
        <h2 className="mb-4 font-kanit text-heading-3 text-text-primary">
          {index + 1}. {title}
        </h2>
        <div className="mb-4 rounded-r-radius-lg border-l-4 border-status-warning bg-status-warning-bg p-4">
          <p className="font-sarabun text-body-md text-text-primary">
            {warningText}
          </p>
        </div>
        {body && (
          <p className="font-sarabun text-body-md leading-relaxed text-text-secondary">
            {body}
          </p>
        )}
      </section>
    );
  }

  if (!("contentTh" in section)) {
    return null;
  }

  const html = locale === "th" ? section.contentTh : section.contentEn;

  return (
    <section
      id={section.id}
      className="scroll-mt-[120px] last:mb-0"
    >
      <h2 className="mb-4 font-kanit text-heading-3 text-text-primary">
        {index + 1}. {title}
      </h2>
      <div
        className="static-page-content"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
      />
    </section>
  );
}

function CheckIcon() {
  return (
    <svg
      className="h-5 w-5 text-primary-dark"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  );
}

function CancelIcon() {
  return (
    <svg
      className="h-5 w-5 text-status-error"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
    </svg>
  );
}
