"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import RichTextEditor from "@/components/admin/RichTextEditor";
import {
  useAdminPageContent,
  useUpdatePageContent,
} from "@/hooks/useAdminPageContent";
import apiClient from "@/services/api";
import type { DisplayMode } from "@/types/content";

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
  const [displayMode, setDisplayMode] = useState<DisplayMode>("markdown");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (page) {
      setContentTh(page.contentTh);
      setContentEn(page.contentEn);
      setDisplayMode(page.displayMode || "markdown");
      setPdfUrl(page.pdfUrl ?? null);
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

  const handleUploadPdf = useCallback(
    async (file: File) => {
      if (file.size > 10 * 1024 * 1024) {
        showError("ไฟล์ใหญ่เกิน 10MB");
        return;
      }
      if (file.type !== "application/pdf") {
        showError("ไฟล์ต้องเป็น PDF เท่านั้น");
        return;
      }
      setUploading(true);
      try {
        const form = new FormData();
        form.append("file", file);
        const res = await apiClient.post<{ data: { pdf_url: string } }>(
          `/admin/pages/${slug}/pdf`,
          form,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        setPdfUrl(res.data.data.pdf_url);
        showToast("อัปโหลด PDF สำเร็จ");
      } catch {
        showError("อัปโหลด PDF ไม่สำเร็จ");
      } finally {
        setUploading(false);
      }
    },
    [slug]
  );

  const handleDeletePdf = useCallback(async () => {
    try {
      await apiClient.delete(`/admin/pages/${slug}/pdf`);
      setPdfUrl(null);
      showToast("ลบ PDF สำเร็จ");
    } catch {
      showError("ลบ PDF ไม่สำเร็จ");
    }
  }, [slug]);

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        slug,
        data: { contentTh, contentEn, displayMode, pdfUrl },
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
          className="mt-4 font-sarabun text-label font-semibold text-[#0081A7] hover:underline"
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
      <nav className="flex font-sarabun text-body-sm text-text-muted">
        <Link href={`${base}/admin`} className="hover:text-[#0081A7]">
          Admin
        </Link>
        <span className="mx-2">&gt;</span>
        <Link href={`${base}/admin/pages`} className="hover:text-[#0081A7]">
          Static Pages
        </Link>
        <span className="mx-2">&gt;</span>
        <span className="font-semibold text-[#053F5C]">Edit /{slug}</span>
      </nav>

      {/* Header card */}
      <header className="rounded-2xl border border-white/80 bg-white px-8 py-6 shadow-md">
        <p className="font-mono text-body-sm uppercase tracking-wide text-text-muted">
          SLUG: /{slug}
        </p>
        <h1 className="mt-1 font-kanit text-[28px] font-bold text-[#053F5C]">
          {t("editTitle", { title: pageTitle })}
        </h1>
      </header>

      {/* Display mode selector */}
      <div className="rounded-2xl border border-white/80 bg-white px-8 py-5 shadow-md">
        <label className="mb-2 block font-sarabun text-body-sm font-medium text-text-secondary">
          รูปแบบการแสดงผล
        </label>
        <select
          value={displayMode}
          onChange={(e) => setDisplayMode(e.target.value as DisplayMode)}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 font-sarabun text-body-md text-text-primary shadow-sm focus:border-[#0081A7] focus:outline-none focus:ring-1 focus:ring-[#0081A7]/20"
        >
          <option value="markdown">Markdown</option>
          <option value="pdf">PDF</option>
          <option value="both">ทั้ง 2 แบบ (Markdown + PDF)</option>
        </select>
      </div>

      {/* Editor — show when markdown or both */}
      {(displayMode === "markdown" || displayMode === "both") && (
        <RichTextEditor
          contentTh={contentTh}
          contentEn={contentEn}
          onChangeTh={setContentTh}
          onChangeEn={setContentEn}
          disabled={updateMutation.isPending}
        />
      )}

      {/* PDF upload — show when pdf or both */}
      {(displayMode === "pdf" || displayMode === "both") && (
        <div className="rounded-2xl border border-white/80 bg-white px-8 py-6 shadow-md">
          <h3 className="mb-4 font-kanit text-lg font-bold text-[#053F5C]">
            ไฟล์ PDF
          </h3>

          {pdfUrl ? (
            <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 px-5 py-4">
              <svg className="h-8 w-8 shrink-0 text-red-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zm-2.5 9.5a1 1 0 011-1h1a1 1 0 010 2h-1a1 1 0 01-1-1z" />
              </svg>
              <div className="flex-1">
                <p className="font-sarabun text-body-md font-medium text-text-primary">
                  document.pdf
                </p>
                <p className="font-sarabun text-body-sm text-text-muted">
                  อัปโหลดแล้ว
                </p>
              </div>
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL || ""}/api/v1${pdfUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-[#0081A7]/30 px-3 py-1.5 font-sarabun text-body-sm font-medium text-[#0081A7] hover:bg-[#0081A7]/5"
              >
                ดูไฟล์
              </a>
              <button
                type="button"
                onClick={handleDeletePdf}
                className="rounded-lg border border-red-200 px-3 py-1.5 font-sarabun text-body-sm font-medium text-red-600 hover:bg-red-50"
              >
                ลบ
              </button>
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const file = e.dataTransfer.files[0];
                if (file) handleUploadPdf(file);
              }}
              className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#0081A7]/30 bg-gray-50/50 px-6 py-10 transition-colors hover:border-[#0081A7]/50"
            >
              <svg className="mb-3 h-10 w-10 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="mb-1 font-sarabun text-body-md font-medium text-text-primary">
                อัปโหลดไฟล์ PDF
              </p>
              <p className="mb-4 font-sarabun text-body-sm text-text-muted">
                ลากไฟล์มาวาง หรือคลิกเพื่อเลือกไฟล์ (สูงสุด 10MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUploadPdf(file);
                }}
              />
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full border border-gray-200 bg-white px-5 py-2 font-sarabun text-body-sm font-medium text-text-secondary shadow-sm hover:bg-gray-50 disabled:opacity-60"
              >
                {uploading ? "กำลังอัปโหลด..." : "เลือกไฟล์"}
              </button>
            </div>
          )}
        </div>
      )}

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
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#053F5C] to-[#0081A7] px-6 py-2.5 font-sarabun text-body-md font-bold text-white shadow-lg transition-all hover:brightness-110 active:scale-95 disabled:opacity-60"
          >
            <SaveIcon />
            {updateMutation.isPending ? t("saving") : t("save")}
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[110] rounded-2xl bg-gradient-to-r from-[#053F5C] to-[#0081A7] px-4 py-3 font-sarabun text-label text-white shadow-lg">
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
