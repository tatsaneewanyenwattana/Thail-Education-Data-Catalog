"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import type { DatasetPreviewData } from "@/types/dataset";

type ApiAccessModalProps = {
  open: boolean;
  onClose: () => void;
  datasetId: string;
  previewData: DatasetPreviewData | null;
};

function CopyButton({ text }: { text: string }) {
  const t = useTranslations("dataset.apiAccess");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="shrink-0 rounded-radius-md border border-border-input px-3 py-1.5 font-sarabun text-caption text-text-secondary transition-colors hover:bg-surface-container"
    >
      {copied ? t("copied") : t("copy")}
    </button>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="flex items-start gap-2">
      <pre className="flex-1 overflow-x-auto rounded-radius-md bg-surface-navy p-4 font-mono text-caption leading-relaxed text-white">
        {code}
      </pre>
      <CopyButton text={code} />
    </div>
  );
}

function buildExampleResponse(preview: DatasetPreviewData): string {
  const sample = {
    status: "success",
    data: {
      columns: preview.columns.slice(0, 4),
      total_rows: preview.total_rows,
      masked_columns: preview.masked_columns.slice(0, 2),
      rows: preview.rows.slice(0, 3),
    },
  };
  return JSON.stringify(sample, null, 2);
}

export default function ApiAccessModal({
  open,
  onClose,
  datasetId,
  previewData,
}: ApiAccessModalProps) {
  const t = useTranslations("dataset.apiAccess");
  const tCommon = useTranslations("common");
  const [mounted, setMounted] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/v1";

  const previewUrl = `${baseUrl}/public/datasets/${datasetId}/preview`;
  const downloadUrl = `${baseUrl}/public/datasets/${datasetId}/download`;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || !mounted || typeof document === "undefined") return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open, mounted]);

  if (!open || !mounted) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="api-access-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-surface-navy/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label={tCommon("close")}
      />
      <div className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-radius-lg border border-border-default/80 bg-surface-card p-spacing-6 shadow-level-3">
        <div className="mb-6 flex items-center justify-between">
          <h3
            id="api-access-modal-title"
            className="font-kanit text-heading-3 text-text-primary"
          >
            {t("title")}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-radius-full p-1 text-text-muted transition-colors hover:bg-surface-container"
            aria-label={tCommon("close")}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="mb-2 font-sarabun text-body-md text-text-secondary">
          {t("intro")}
        </p>
        <p className="mb-6 font-sarabun text-caption text-text-muted">
          {t("rateLimit")}
        </p>

        {/* ── Preview ── */}
        <section className="mb-8">
          <h4 className="mb-3 font-kanit text-label font-bold text-text-primary">
            {t("previewHeading")}
          </h4>

          <p className="mb-2 font-sarabun text-caption font-medium text-text-muted">
            Endpoint
          </p>
          <div className="mb-4 flex items-center gap-2">
            <code className="flex-1 overflow-x-auto rounded-radius-md bg-surface-container px-3 py-2 font-mono text-caption text-text-primary">
              GET {previewUrl}
            </code>
            <CopyButton text={previewUrl} />
          </div>

          <p className="mb-2 font-sarabun text-caption font-medium text-text-muted">
            curl
          </p>
          <CodeBlock code={`curl "${previewUrl}"`} />

          {previewData && (
            <>
              <p className="mb-2 mt-4 font-sarabun text-caption font-medium text-text-muted">
                {t("exampleResponse")}
              </p>
              <CodeBlock code={buildExampleResponse(previewData)} />
            </>
          )}
        </section>

        {/* ── Download ── */}
        <section>
          <h4 className="mb-3 font-kanit text-label font-bold text-text-primary">
            {t("downloadHeading")}
          </h4>

          <p className="mb-2 font-sarabun text-caption font-medium text-text-muted">
            Endpoint
          </p>
          <div className="mb-4 flex items-center gap-2">
            <code className="flex-1 overflow-x-auto rounded-radius-md bg-surface-container px-3 py-2 font-mono text-caption text-text-primary">
              GET {downloadUrl}?purpose=...&format=csv
            </code>
            <CopyButton text={`${downloadUrl}?purpose=YOUR_PURPOSE&format=csv`} />
          </div>

          <p className="mb-2 font-sarabun text-caption font-medium text-text-muted">
            {t("queryParams")}
          </p>
          <div className="mb-4 overflow-hidden rounded-radius-md border border-border-default">
            <table className="w-full text-left font-sarabun text-caption">
              <thead className="bg-surface-container">
                <tr>
                  <th className="px-3 py-2 font-medium text-text-muted">{t("paramName")}</th>
                  <th className="px-3 py-2 font-medium text-text-muted">{t("paramType")}</th>
                  <th className="px-3 py-2 font-medium text-text-muted">{t("paramDesc")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                <tr>
                  <td className="px-3 py-2 font-mono">purpose</td>
                  <td className="px-3 py-2">string</td>
                  <td className="px-3 py-2">{t("purposeDesc")}</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-mono">format</td>
                  <td className="px-3 py-2">string</td>
                  <td className="px-3 py-2">csv | excel | json | xml</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mb-2 font-sarabun text-caption font-medium text-text-muted">
            curl
          </p>
          <CodeBlock
            code={`curl -o data.csv \\\n  "${downloadUrl}?purpose=research%20and%20analysis&format=csv"`}
          />

          <p className="mt-4 font-sarabun text-caption text-text-muted">
            {t("downloadNote")}
          </p>
        </section>
      </div>
    </div>
  );
}
