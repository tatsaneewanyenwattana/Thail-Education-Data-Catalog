"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import type { DatasetDetailMock } from "@/data/mockData";

type CitationStyle = "apa" | "vancouver";

type CitationBoxProps = {
  dataset: DatasetDetailMock;
};

export default function CitationBox({ dataset }: CitationBoxProps) {
  const t = useTranslations("dataset");
  const tStyles = useTranslations("dataset.citationStyles");
  const locale = useLocale();
  const [style, setStyle] = useState<CitationStyle>("apa");
  const [copied, setCopied] = useState(false);

  const citationText =
    style === "apa"
      ? locale === "th"
        ? dataset.citationApaTh
        : dataset.citationApaEn
      : locale === "th"
        ? dataset.citationVancouverTh
        : dataset.citationVancouverEn;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(citationText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const tabClass = (active: boolean) =>
    `pb-2 font-sarabun text-label transition-colors ${
      active
        ? "border-b-2 border-primary font-semibold text-primary"
        : "font-medium text-text-muted hover:text-text-primary"
    }`;

  return (
    <section className="bg-surface-page px-4 py-spacing-6 md:px-spacing-10">
      <div className="mx-auto max-w-container-max">
        <h2 className="mb-4 font-kanit text-heading-3-mobile text-text-primary md:text-heading-3">
          {t("detail.citation")}
        </h2>
        <div className="rounded-radius-lg border border-border-default/80 bg-surface-container p-spacing-6">
          <div className="mb-4 flex items-center gap-6 border-b border-border-default/60">
            <button
              type="button"
              className={tabClass(style === "apa")}
              onClick={() => setStyle("apa")}
            >
              {tStyles("apa")}
            </button>
            <button
              type="button"
              className={tabClass(style === "vancouver")}
              onClick={() => setStyle("vancouver")}
            >
              {tStyles("vancouver")}
            </button>
          </div>
          <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-center">
            <code className="flex-1 rounded-radius-md border border-border-default/60 bg-surface-card p-4 font-mono text-code text-text-secondary">
              {citationText}
            </code>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-radius-md bg-surface-container px-4 py-2 font-sarabun text-label font-medium text-text-primary transition-colors hover:bg-border-default/40"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              {copied ? tStyles("copied") : tStyles("copy")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
