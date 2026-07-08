"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  useDownloadDataset,
  type DownloadFormat,
} from "@/hooks/useDownloadDataset";
import { useDatasetFileFormat } from "@/hooks/useDatasetFileFormat";
import {
  DOWNLOAD_FORMAT_LABELS,
  getAvailableDownloadFormats,
} from "@/utils/downloadFormats";

type DownloadFormValues = {
  format: DownloadFormat;
  purpose: string;
};

type DownloadModalProps = {
  open: boolean;
  onClose: () => void;
  datasetId: string;
  /** ประเภทไฟล์ต้นฉบับ — ถ้าไม่ส่งจะดึงจาก API อัตโนมัติ */
  sourceFileFormat?: string | null;
  theme?: "agency";
};

function buildDownloadSchema(formats: DownloadFormat[]) {
  const [first, ...rest] = formats;
  const formatEnum =
    rest.length > 0
      ? z.enum([first, ...rest] as [DownloadFormat, ...DownloadFormat[]])
      : z.literal(first);

  return z.object({
    format: formatEnum,
    purpose: z.string().min(10),
  });
}

type DownloadModalFormProps = {
  datasetId: string;
  availableFormats: DownloadFormat[];
  onClose: () => void;
  theme?: "agency";
};

function DownloadModalForm({
  datasetId,
  availableFormats,
  onClose,
  theme,
}: DownloadModalFormProps) {
  const isAgency = theme === "agency";
  const t = useTranslations("dataset.download");
  const tCommon = useTranslations("common");
  const downloadMutation = useDownloadDataset();

  const defaultFormat = availableFormats[0] ?? "csv";
  const singleFormat = availableFormats.length === 1;
  const downloadSchema = useMemo(
    () => buildDownloadSchema(availableFormats),
    [availableFormats]
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DownloadFormValues>({
    resolver: zodResolver(downloadSchema),
    defaultValues: { format: defaultFormat, purpose: "" },
  });

  useEffect(() => {
    return () => {
      reset({ format: defaultFormat, purpose: "" });
      downloadMutation.reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cleanup on unmount
  }, []);

  const onSubmit = async (values: DownloadFormValues) => {
    try {
      await downloadMutation.mutateAsync({
        datasetId,
        purpose: values.purpose,
        format: values.format,
      });
      onClose();
    } catch {
      // Error shown via downloadMutation.error
    }
  };

  const isSubmitting = downloadMutation.isPending;
  const apiError =
    downloadMutation.error instanceof Error
      ? downloadMutation.error.message
      : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <p className="mb-3 font-sarabun text-label font-semibold text-text-primary">
          {t("format")}
        </p>
        {singleFormat ? (
          <div className="rounded-radius-md border border-border-input bg-surface-container px-4 py-3">
            <p className="font-sarabun text-label text-text-primary">
              {t("formatFixed", {
                format: DOWNLOAD_FORMAT_LABELS[defaultFormat],
              })}
            </p>
            <input type="hidden" value={defaultFormat} {...register("format")} />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
            {availableFormats.map((format) => (
              <label
                key={format}
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-border-default p-3 transition-colors hover:border-primary hover:bg-primary-light/30"
              >
                <input
                  type="radio"
                  value={format}
                  className="accent-primary-dark"
                  disabled={isSubmitting}
                  {...register("format")}
                />
                <span className="font-sarabun text-label font-normal text-text-primary">
                  {DOWNLOAD_FORMAT_LABELS[format]}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div>
        <label
          htmlFor="download-purpose"
          className="mb-3 block font-sarabun text-label font-semibold text-text-primary"
        >
          {t("purpose")} *
        </label>
        <textarea
          id="download-purpose"
          rows={4}
          placeholder={t("purposePlaceholder")}
          disabled={isSubmitting}
          className="min-h-[100px] w-full rounded-radius-md border border-border-input p-3 font-sarabun text-label text-text-primary outline-none focus:border-border-focus focus:ring-2 focus:ring-primary-dark/20 disabled:opacity-70"
          {...register("purpose")}
        />
        {errors.purpose && (
          <p className="mt-1 font-sarabun text-caption text-status-error">
            {t("purposeMin")}
          </p>
        )}
      </div>

      {apiError && (
        <p className="font-sarabun text-caption text-status-error" role="alert">
          {apiError}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`flex-1 rounded-radius-full py-3 font-sarabun text-label font-bold text-white shadow-level-1 transition-all hover:brightness-110 disabled:opacity-70 ${isAgency ? "bg-gradient-to-b from-[#0288d1] to-[#01579b]" : "bg-gradient-to-b from-primary-hover to-primary-dark"}`}
        >
          {isSubmitting ? t("processing") : t("submit")}
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="rounded-radius-full border border-border-default px-6 py-3 font-sarabun text-label font-normal text-text-secondary transition-colors hover:bg-surface-container disabled:opacity-70"
        >
          {tCommon("cancel")}
        </button>
      </div>
    </form>
  );
}

export default function DownloadModal({
  open,
  onClose,
  datasetId,
  sourceFileFormat,
  theme,
}: DownloadModalProps) {
  const t = useTranslations("dataset.download");
  const tCommon = useTranslations("common");
  const [mounted, setMounted] = useState(false);

  const shouldFetchFormat = open && sourceFileFormat == null;
  const { data: fetchedFormat, isLoading: formatLoading } = useDatasetFileFormat(
    datasetId,
    shouldFetchFormat
  );

  const effectiveSourceFormat = sourceFileFormat ?? fetchedFormat ?? null;
  const availableFormats = useMemo(
    () => getAvailableDownloadFormats(effectiveSourceFormat),
    [effectiveSourceFormat]
  );
  const formatReady = sourceFileFormat != null || !formatLoading;
  const formKey = `${datasetId}-${availableFormats.join(",")}`;

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
      aria-labelledby="download-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-surface-navy/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label={tCommon("close")}
      />
      <div className="relative w-full max-w-lg rounded-radius-lg border border-border-default/80 bg-surface-card p-spacing-6 shadow-level-3">
        <div className="mb-6 flex items-center justify-between">
          <h3
            id="download-modal-title"
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

        {!formatReady ? (
          <p className="font-sarabun text-body-sm text-text-secondary">
            {t("formatLoading")}
          </p>
        ) : (
          <DownloadModalForm
            key={formKey}
            datasetId={datasetId}
            availableFormats={availableFormats}
            onClose={onClose}
            theme={theme}
          />
        )}
      </div>
    </div>
  );
}
