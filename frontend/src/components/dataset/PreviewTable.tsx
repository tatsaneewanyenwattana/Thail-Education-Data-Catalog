"use client";

import { useLocale, useTranslations } from "next-intl";
import type { DatasetDetailMock } from "@/data/mockData";

type PreviewTableProps = {
  columns: DatasetDetailMock["columns"];
  rows: DatasetDetailMock["previewData"];
};

function LockIcon() {
  return (
    <svg
      className="h-4 w-4 text-text-muted"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  );
}

export default function PreviewTable({ columns, rows }: PreviewTableProps) {
  const t = useTranslations("dataset.detail");
  const locale = useLocale();
  const previewRows = rows.slice(0, 20);

  return (
    <section className="px-4 py-spacing-6 md:px-spacing-10">
      <div className="mx-auto max-w-container-max">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-kanit text-heading-3-mobile text-text-primary md:text-heading-3">
              {t("preview")}
            </h2>
            <p className="mt-1 flex items-center gap-1 font-sarabun text-caption text-text-muted">
              <LockIcon />
              {t("piiNote")}
            </p>
          </div>
          <p className="font-sarabun text-caption text-text-muted">
            {t("previewRowCount", { count: previewRows.length })}
          </p>
        </div>

        <div className="max-h-[560px] overflow-auto rounded-radius-lg border border-border-default/80 shadow-level-1">
          <table className="w-full min-w-[640px] border-collapse bg-surface-card text-left">
            <thead>
              <tr className="border-b border-border-default bg-surface-container">
                {columns.map((col) => {
                  const label = locale === "th" ? col.labelTh : col.labelEn;
                  return (
                    <th
                      key={col.key}
                      className="whitespace-nowrap px-4 py-3 font-sarabun text-label font-semibold text-text-primary"
                    >
                      <span className="inline-flex items-center gap-1">
                        {label}
                        {col.masked && <LockIcon />}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="font-sarabun text-label text-text-secondary">
              {previewRows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-b border-border-default/30 transition-colors hover:bg-surface-container/60"
                >
                  {columns.map((col) => {
                    const value = row[col.key];
                    return (
                      <td key={col.key} className="px-4 py-3">
                        {col.masked ? (
                          <span
                            className="inline-block select-none blur-sm opacity-60"
                            aria-hidden
                          >
                            {String(value)}
                          </span>
                        ) : (
                          String(value ?? "")
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
