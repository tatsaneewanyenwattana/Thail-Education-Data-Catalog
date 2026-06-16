"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import type { StaticPageStatus } from "@/data/mockData";

type CreatePageModalProps = {
  open: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (input: {
    slug: string;
    titleTh: string;
    titleEn: string;
    status: StaticPageStatus;
  }) => void;
};

export default function CreatePageModal({
  open,
  isSubmitting,
  onClose,
  onSubmit,
}: CreatePageModalProps) {
  const t = useTranslations("admin.pages.create");
  const locale = useLocale();
  const [slug, setSlug] = useState("");
  const [titleTh, setTitleTh] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [status, setStatus] = useState<StaticPageStatus>("draft");
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return null;
  }

  const handleSubmit = () => {
    const normalizedSlug = slug.trim().toLowerCase();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalizedSlug)) {
      setError(t("slugInvalid"));
      return;
    }
    if (titleTh.trim().length < 2 || titleEn.trim().length < 2) {
      setError(t("titleRequired"));
      return;
    }
    setError(null);
    onSubmit({
      slug: normalizedSlug,
      titleTh: titleTh.trim(),
      titleEn: titleEn.trim(),
      status,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-page-title"
    >
      <div className="w-full max-w-lg rounded-radius-lg border border-border-default bg-surface-card p-6 shadow-level-3">
        <h2
          id="create-page-title"
          className="font-kanit text-heading-3-mobile font-bold text-text-primary"
        >
          {t("title")}
        </h2>
        <p className="mt-1 font-sarabun text-body-sm text-text-muted">
          {t("subtitle")}
        </p>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block font-sarabun text-label font-medium text-text-primary">
              {t("slugLabel")}
            </span>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder={t("slugPlaceholder")}
              className="w-full rounded-radius-sm border border-border-input px-3 py-2 font-mono text-body-sm text-text-primary focus:border-border-focus focus:outline-none focus:ring-1 focus:ring-primary-dark/30"
            />
            <span className="mt-1 block font-sarabun text-caption text-text-muted">
              {t("slugHint", { path: `/${locale}/pages/${slug || "your-slug"}` })}
            </span>
          </label>

          <label className="block">
            <span className="mb-1 block font-sarabun text-label font-medium text-text-primary">
              {t("titleThLabel")}
            </span>
            <input
              type="text"
              value={titleTh}
              onChange={(e) => setTitleTh(e.target.value)}
              className="w-full rounded-radius-sm border border-border-input px-3 py-2 font-sarabun text-body-md text-text-primary focus:border-border-focus focus:outline-none focus:ring-1 focus:ring-primary-dark/30"
            />
          </label>

          <label className="block">
            <span className="mb-1 block font-sarabun text-label font-medium text-text-primary">
              {t("titleEnLabel")}
            </span>
            <input
              type="text"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              className="w-full rounded-radius-sm border border-border-input px-3 py-2 font-sarabun text-body-md text-text-primary focus:border-border-focus focus:outline-none focus:ring-1 focus:ring-primary-dark/30"
            />
          </label>

          <label className="block">
            <span className="mb-1 block font-sarabun text-label font-medium text-text-primary">
              {t("statusLabel")}
            </span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StaticPageStatus)}
              className="w-full rounded-radius-sm border border-border-input px-3 py-2 font-sarabun text-body-md text-text-primary focus:border-border-focus focus:outline-none focus:ring-1 focus:ring-primary-dark/30"
            >
              <option value="draft">{t("statusDraft")}</option>
              <option value="published">{t("statusPublished")}</option>
            </select>
          </label>

          {error ? (
            <p className="font-sarabun text-body-sm text-error" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-radius-md border border-border-default px-4 py-2 font-sarabun text-label font-medium text-text-secondary hover:bg-surface-container disabled:opacity-60"
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-radius-md bg-primary-dark px-4 py-2 font-sarabun text-label font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
          >
            {isSubmitting ? t("creating") : t("submit")}
          </button>
        </div>
      </div>
    </div>
  );
}
