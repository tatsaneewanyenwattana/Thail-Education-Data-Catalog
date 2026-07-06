"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import type { StaticPageStatus } from "@/types/content";

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

  const [statusOpen, setStatusOpen] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setStatusOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!open) return null;

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

  const statusOptions: { value: StaticPageStatus; label: string }[] = [
    { value: "draft", label: t("statusDraft") },
    { value: "published", label: t("statusPublished") },
  ];

  const inputClass =
    "w-full rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 font-sarabun text-body-md text-text-primary shadow-sm transition-all hover:border-gray-300 focus:border-[#0081A7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0081A7]/20";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-page-title"
    >
      <div className="w-full max-w-lg rounded-2xl border border-white/80 bg-white p-6 shadow-xl">
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
            <span className="mb-1.5 block font-sarabun text-label font-medium text-text-primary">
              {t("slugLabel")}
            </span>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder={t("slugPlaceholder")}
              className={`${inputClass} font-mono`}
            />
            <span className="mt-1.5 block font-sarabun text-caption text-text-muted">
              {t("slugHint", { path: `/${locale}/pages/${slug || "your-slug"}` })}
            </span>
          </label>

          <label className="block">
            <span className="mb-1.5 block font-sarabun text-label font-medium text-text-primary">
              {t("titleThLabel")}
            </span>
            <input
              type="text"
              value={titleTh}
              onChange={(e) => setTitleTh(e.target.value)}
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block font-sarabun text-label font-medium text-text-primary">
              {t("titleEnLabel")}
            </span>
            <input
              type="text"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              className={inputClass}
            />
          </label>

          {/* Status dropdown */}
          <div className="block">
            <span className="mb-1.5 block font-sarabun text-label font-medium text-text-primary">
              {t("statusLabel")}
            </span>
            <div ref={statusRef} className="relative">
              <button
                type="button"
                onClick={() => setStatusOpen(!statusOpen)}
                className="flex w-full items-center justify-between rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 font-sarabun text-body-md text-text-primary shadow-sm transition-all hover:border-gray-300 focus:border-[#0081A7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0081A7]/20"
              >
                <span>{statusOptions.find((o) => o.value === status)?.label}</span>
                <svg
                  className={`h-4 w-4 text-text-muted transition-transform ${statusOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {statusOpen && (
                <ul className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-white/80 bg-white py-1 shadow-lg">
                  {statusOptions.map((opt) => (
                    <li key={opt.value}>
                      <button
                        type="button"
                        onClick={() => {
                          setStatus(opt.value);
                          setStatusOpen(false);
                        }}
                        className={`flex w-full px-4 py-2.5 text-left font-sarabun text-body-md transition-colors ${
                          status === opt.value
                            ? "bg-[#053F5C]/10 font-bold text-[#053F5C]"
                            : "text-text-primary hover:bg-gray-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2 font-sarabun text-body-sm text-error" role="alert">
              {error}
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-full border-2 border-gray-200 px-6 py-2.5 font-sarabun text-label font-semibold text-text-secondary transition-all hover:bg-gray-50 disabled:opacity-60"
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-full bg-gradient-to-r from-[#053F5C] to-[#0081A7] px-6 py-2.5 font-sarabun text-label font-bold text-white shadow-lg transition-all hover:brightness-110 active:scale-95 disabled:opacity-60"
          >
            {isSubmitting ? t("creating") : t("submit")}
          </button>
        </div>
      </div>
    </div>
  );
}
