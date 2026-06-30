"use client";

import { useState } from "react";
import type { ApiQuickStartStep } from "@/data/apiDocsContent";
import { getLocalizedText } from "@/data/apiDocsContent";
import CodeBlock from "@/components/common/CodeBlock";

type QuickStartProps = {
  steps: ApiQuickStartStep[];
  locale: string;
  title: string;
  description: string;
};

export default function QuickStart({
  steps,
  locale,
  title,
  description,
}: QuickStartProps) {
  const [page, setPage] = useState(0);
  const perPage = 2;
  const totalPages = Math.ceil(steps.length / perPage);
  const visibleSteps = steps.slice(page * perPage, page * perPage + perPage);

  return (
    <section id="quick-start" className="scroll-mt-28">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: "#e8f5e9", color: "#00695c" }}>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <h2 className="font-kanit text-[1.5rem] font-bold" style={{ color: "#1a3a2a" }}>
            {title}
          </h2>
          <p className="font-sarabun text-body-md text-text-secondary">
            {description}
          </p>
        </div>
      </div>

      <div className="grid min-h-[280px] gap-5 grid-cols-2">
        {visibleSteps.map((step, i) => {
          const stepTitle = getLocalizedText(step.title, locale);
          const stepDescription = getLocalizedText(step.description, locale);
          const globalIndex = page * perPage + i;

          return (
            <div
              key={step.id}
              className="flex min-w-0 flex-col rounded-2xl border border-border-default/60 bg-white p-6 shadow-level-1 md:p-8"
              style={{ borderTopWidth: 3, borderTopColor: "#00695c" }}
            >
              <span
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-full font-kanit text-body-md font-bold text-white"
                style={{ backgroundColor: "#004d40" }}
              >
                {globalIndex + 1}
              </span>
              <h3 className="font-kanit text-body-lg font-bold md:text-[1.25rem]" style={{ color: "#1a3a2a" }}>
                {stepTitle}
              </h3>
              <p className="mt-3 flex-1 font-sarabun text-body-md leading-relaxed text-text-secondary">
                {stepDescription}
              </p>
              {step.code && (
                <div className="mt-5">
                  <CodeBlock code={step.code} label="EXAMPLE" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="mt-5 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border-default bg-white shadow-level-1 transition-colors hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPage(i)}
                className={`h-2.5 rounded-full transition-all ${
                  i === page ? "w-8" : "w-2.5"
                }`}
                style={{ backgroundColor: i === page ? "#00695c" : "#c8e6c9" }}
                aria-label={`Page ${i + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border-default bg-white shadow-level-1 transition-colors hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </section>
  );
}
