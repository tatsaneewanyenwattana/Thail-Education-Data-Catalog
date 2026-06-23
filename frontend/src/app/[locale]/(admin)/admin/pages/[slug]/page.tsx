"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import RichTextEditor from "@/components/admin/RichTextEditor";
import {
  useAdminPageContent,
  useUpdatePageContent,
} from "@/hooks/useAdminPageContent";

export default function AdminPageEditorPage() {
  const t = useTranslations("admin.pages");
  const locale = useLocale();
  const base = `/${locale}`;
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { data: page, isLoading, isError } = useAdminPageContent(slug);
  const updateMutation = useUpdatePageContent();

  const [contentTh, setContentTh] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);

  useEffect(() => {
    if (page) {
      setContentTh(page.contentTh);
      setContentEn(page.contentEn);
    }
  }, [page]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastError(null);
    window.setTimeout(() => setToastMessage(null), 3000);
  };

  const showError = (message: string) => {
    setToastError(message);
    setToastMessage(null);
    window.setTimeout(() => setToastError(null), 3000);
  };

  const goBackToPages = () => {
    router.push(`/${locale}/admin/pages`);
  };

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        slug,
        data: { contentTh, contentEn },
      });
      const now = new Date();
      setLastSaved(
        `Today, ${now.toLocaleTimeString(locale === "th" ? "th-TH" : "en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })}`
      );
      showToast(t("savedSuccess"));
    } catch {
      showError(t("saveError"));
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-container-max pb-24">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-64 rounded-full bg-gray-100" />
          <div className="h-32 rounded-2xl bg-gray-100" />
          <div className="h-96 rounded-2xl bg-gray-100" />
        </div>
      </div>
    );
  }

  if (isError || !page) {
    return (
      <div className="mx-auto max-w-container-max pb-24">
        <p className="font-sarabun text-body-md text-error">{t("notFound")}</p>
        <button
          type="button"
          onClick={goBackToPages}
          className="mt-4 font-sarabun text-label font-semibold text-primary hover:underline"
        >
          {t("backToPages")}
        </button>
      </div>
    );
  }

  const pageTitle = locale === "th" ? page.titleTh : page.titleEn;

  return (
    <div className="space-y-6 pb-24">
      {/* Breadcrumb */}
      <nav className="flex font-sarabun text-body-md text-text-muted">
        <Link href={`${base}/admin`} className="hover:text-primary-dark">
          Admin
        </Link>
        <span className="mx-2">&gt;</span>
        <Link href={`${base}/admin/pages`} className="hover:text-primary-dark">
          Static Pages
        </Link>
        <span className="mx-2">&gt;</span>
        <span className="font-medium text-primary-dark">Edit /{slug}</span>
      </nav>

      {/* Header card */}
      <header className="rounded-2xl border border-white/80 bg-white px-8 py-6 shadow-md">
        <p className="font-mono text-body-sm uppercase tracking-wide text-text-muted">
          SLUG: /{slug}
        </p>
        <h1 className="mt-1 font-kanit text-[28px] font-bold text-text-primary">
          {t("editTitle", { title: pageTitle })}
        </h1>
      </header>

      {/* Editor */}
      <RichTextEditor
        contentTh={contentTh}
        contentEn={contentEn}
        onChangeTh={setContentTh}
        onChangeEn={setContentEn}
        disabled={updateMutation.isPending}
      />

      {/* Footer actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-text-muted">
          {lastSaved && (
            <>
              <ClockIcon />
              <span className="font-sarabun text-body-sm">
                Last saved: {lastSaved}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={goBackToPages}
            disabled={updateMutation.isPending}
            className="rounded-full border border-gray-200 bg-white px-5 py-2.5 font-sarabun text-body-md font-medium text-text-secondary shadow-sm transition-all hover:bg-gray-50 disabled:opacity-60"
          >
            {t("backToPages")}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="inline-flex items-center gap-2 rounded-full bg-primary-dark px-6 py-2.5 font-sarabun text-body-md font-semibold text-white shadow-md transition-all hover:bg-primary-hover hover:shadow-lg disabled:opacity-60"
          >
            <SaveIcon />
            {updateMutation.isPending ? t("saving") : t("save")}
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[110] rounded-2xl bg-primary-dark px-4 py-3 font-sarabun text-label text-white shadow-lg">
          {toastMessage}
        </div>
      )}
      {toastError && (
        <div className="fixed bottom-6 right-6 z-[110] rounded-2xl bg-status-error px-4 py-3 font-sarabun text-label text-white shadow-lg">
          {toastError}
        </div>
      )}
    </div>
  );
}

function ClockIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
    </svg>
  );
}
