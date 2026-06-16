"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import BulkUploadResult from "@/components/dataset/BulkUploadResult";
import BulkUploadZone from "@/components/dataset/BulkUploadZone";
import type { BulkUploadResult as BulkUploadResultData } from "@/data/mockData";
import { downloadBulkUploadTemplate } from "@/hooks/useBulkUpload";

export default function BulkUploadPage() {
  const t = useTranslations("agency.bulk");
  const locale = useLocale();
  const base = `/${locale}`;

  const [uploadResult, setUploadResult] = useState<BulkUploadResultData | null>(
    null
  );
  const [resetKey, setResetKey] = useState(0);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [templateError, setTemplateError] = useState<string | null>(null);

  const handleDownloadTemplate = async () => {
    setTemplateError(null);
    setIsDownloadingTemplate(true);
    try {
      const blob = await downloadBulkUploadTemplate();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "bulk-upload-template.xlsx";
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      setTemplateError(t("templateDownloadError"));
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const handleUploadAgain = () => {
    setUploadResult(null);
    setResetKey((current) => current + 1);
  };

  return (
    <div className="mx-auto max-w-[800px] space-y-spacing-6 pb-24">
      <header>
        <nav className="mb-2 flex flex-wrap items-center gap-2 font-sarabun text-label text-text-muted">
          <Link href={`${base}/dashboard`} className="hover:text-primary-dark">
            {t("breadcrumbDashboard")}
          </Link>
          <ChevronIcon />
          <span className="font-medium text-primary-dark">{t("breadcrumbCurrent")}</span>
        </nav>
        <h1 className="font-kanit text-[28px] font-bold text-text-primary">
          {t("title")}
        </h1>
        <p className="mt-1 font-sarabun text-body-md text-text-muted">{t("subtitle")}</p>
      </header>

      <section className="rounded-radius-lg border border-border-default bg-surface-card p-spacing-6 shadow-level-1 transition-shadow hover:shadow-level-2">
        <span className="mb-1 block font-kanit text-label font-semibold text-primary-dark">
          {t("step1")}
        </span>
        <h2 className="mb-2 font-kanit text-heading-3-mobile font-semibold text-text-primary">
          {t("step1Title")}
        </h2>
        <p className="mb-spacing-6 font-sarabun text-body-md text-text-muted">
          {t("step1Desc")}
        </p>
        <button
          type="button"
          onClick={handleDownloadTemplate}
          disabled={isDownloadingTemplate}
          className="inline-flex items-center gap-2 rounded-radius-full border-2 border-primary-dark px-6 py-2.5 font-sarabun text-label font-medium text-primary-dark transition-colors hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60"
        >
          <DownloadIcon />
          {isDownloadingTemplate ? t("templateDownloading") : t("downloadTemplate")}
        </button>
        {templateError && (
          <p className="mt-2 font-sarabun text-body-sm text-error" role="alert">
            {templateError}
          </p>
        )}
      </section>

      <BulkUploadZone
        resetKey={resetKey}
        onComplete={(result) => setUploadResult(result)}
      />

      {uploadResult && (
        <BulkUploadResult result={uploadResult} onUploadAgain={handleUploadAgain} />
      )}
    </div>
  );
}

function ChevronIcon() {
  return (
    <svg className="h-4 w-4 text-text-muted" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 9h-4V3H9v6H5l7 7 7-7ZM5 18v2h14v-2H5Z" />
    </svg>
  );
}
