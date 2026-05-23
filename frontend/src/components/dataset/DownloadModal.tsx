"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const downloadFormats = ["csv", "excel", "json", "xml"] as const;

const downloadSchema = z.object({
  format: z.enum(downloadFormats),
  purpose: z.string().min(10),
});

type DownloadFormValues = z.infer<typeof downloadSchema>;

type DownloadModalProps = {
  open: boolean;
  onClose: () => void;
  datasetId: string;
};

export default function DownloadModal({
  open,
  onClose,
  datasetId,
}: DownloadModalProps) {
  const t = useTranslations("dataset.download");
  const tCommon = useTranslations("common");
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DownloadFormValues>({
    resolver: zodResolver(downloadSchema),
    defaultValues: { format: "csv", purpose: "" },
  });

  useEffect(() => {
    if (!open) {
      reset({ format: "csv", purpose: "" });
      setSubmitting(false);
      setSuccess(false);
    }
  }, [open, reset]);

  useEffect(() => {
    if (!open || !mounted || typeof document === "undefined") return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open, mounted]);

  if (!open || !mounted) return null;

  const onSubmit = async (values: DownloadFormValues) => {
    setSubmitting(true);
    console.log("Download request", { datasetId, ...values });
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSubmitting(false);
    setSuccess(true);
    window.setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1000);
  };

  const formatLabels: Record<(typeof downloadFormats)[number], string> = {
    csv: "CSV",
    excel: "Excel",
    json: "JSON",
    xml: "XML",
  };

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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <p className="mb-3 font-sarabun text-label font-semibold text-text-primary">
              {t("format")}
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {downloadFormats.map((format) => (
                <label
                  key={format}
                  className="flex cursor-pointer items-center gap-2 rounded-radius-md border border-border-input p-3 transition-colors hover:bg-surface-container"
                >
                  <input
                    type="radio"
                    value={format}
                    className="accent-primary-dark"
                    {...register("format")}
                  />
                  <span className="font-sarabun text-label">{formatLabels[format]}</span>
                </label>
              ))}
            </div>
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
              className="min-h-[100px] w-full rounded-radius-md border border-border-input p-3 font-sarabun text-label text-text-primary outline-none focus:border-border-focus focus:ring-2 focus:ring-primary-dark/20"
              {...register("purpose")}
            />
            {errors.purpose && (
              <p className="mt-1 font-sarabun text-caption text-status-error">
                {t("purposeMin")}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting || success}
              className="flex-1 rounded-radius-md bg-primary py-3 font-sarabun text-label font-medium text-white transition-all hover:bg-primary-hover disabled:opacity-70"
            >
              {success ? t("success") : submitting ? t("processing") : t("submit")}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-radius-md border border-border-input px-6 py-3 font-sarabun text-label text-text-secondary transition-colors hover:bg-surface-container"
            >
              {tCommon("cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
