"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import ToggleSwitch from "@/components/admin/ToggleSwitch";
import type { AdminStaticPageMeta } from "@/types/content";
import { useTogglePageStatus, useDeletePage } from "@/hooks/useAdminPageContent";

const ICON_CONFIG = {
  policy: {
    Icon: PolicyIcon,
    bgClass: "bg-[#0081A7]/10 text-[#0081A7]",
  },
  gavel: {
    Icon: GavelIcon,
    bgClass: "bg-[#ef6c00]/10 text-[#ef6c00]",
  },
  api: {
    Icon: ApiIcon,
    bgClass: "bg-[#00AFB9]/10 text-[#00AFB9]",
  },
  help: {
    Icon: HelpIcon,
    bgClass: "bg-[#053F5C]/10 text-[#053F5C]",
  },
} as const;

function formatUpdatedAt(date: string, locale: string): string {
  return new Date(date).toLocaleDateString(locale === "th" ? "th-TH" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type StaticPageCardProps = {
  page: AdminStaticPageMeta;
};

export default function StaticPageCard({ page }: StaticPageCardProps) {
  const t = useTranslations("admin.pages");
  const locale = useLocale();
  const router = useRouter();
  const toggleStatus = useTogglePageStatus();
  const deletePage = useDeletePage();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { Icon, bgClass } = ICON_CONFIG[page.icon];
  const title = locale === "th" ? page.titleTh : page.titleEn;
  const isPublished = page.status === "published";

  const handleToggle = () => {
    toggleStatus.mutate({
      slug: page.slug,
      status: isPublished ? "draft" : "published",
    });
  };

  const handleDelete = () => {
    deletePage.mutate(page.slug);
    setConfirmDelete(false);
  };

  return (
    <>
      <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/80 bg-white/90 shadow-sm backdrop-blur-sm transition-all hover:shadow-xl">
        <div className="h-2 w-full bg-gradient-to-r from-[#053F5C] to-[#0081A7]" />
        <div className="flex flex-1 flex-col p-8">
          <div className="mb-6 flex justify-center">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-2xl ${bgClass} transition-transform group-hover:scale-110`}
            >
              <Icon />
            </div>
          </div>

          <h4 className="text-center font-kanit text-xl font-bold text-[#053F5C] transition-colors group-hover:text-[#0081A7]">
            {title}
          </h4>
          <p className="mt-2 text-center font-sarabun text-sm text-text-muted line-clamp-2">
            {page.route}
          </p>

          <div className="mt-4 flex justify-center">
            <span className={`inline-flex rounded-full px-3 py-1 font-sarabun text-xs font-bold ${
              isPublished
                ? "bg-[#E6F4EA] text-[#1E8E3E]"
                : "bg-[#FFF3E0] text-[#8c6f53]"
            }`}>
              {isPublished ? t("published") : t("draft")}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 bg-white/40 px-6 py-4">
          <span className="font-sarabun text-xs text-text-muted">
            {t("lastEdit")}: {formatUpdatedAt(page.updatedAt, locale)}
          </span>
          <button
            type="button"
            onClick={() => router.push(`/${locale}/admin/pages/${page.slug}`)}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#053F5C] to-[#0081A7] px-5 py-2 font-sarabun text-sm font-bold text-white shadow-sm transition-all hover:brightness-110 active:scale-95"
          >
            {t("editContent")}
          </button>
        </div>
      </article>

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
            <h3 className="font-kanit text-xl font-bold text-text-primary">
              {locale === "th" ? "ยืนยันการลบ" : "Confirm Delete"}
            </h3>
            <p className="mt-3 font-sarabun text-body-md text-text-muted">
              {locale === "th"
                ? `ต้องการลบหน้า "${title}" ใช่หรือไม่? ข้อมูลจะถูกลบถาวร`
                : `Are you sure you want to delete "${title}"? This action cannot be undone.`}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="rounded-full border-2 border-gray-200 px-6 py-2 font-sarabun text-body-md font-semibold text-text-secondary transition-colors hover:bg-gray-50"
              >
                {locale === "th" ? "ยกเลิก" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deletePage.isPending}
                className="rounded-full bg-red-500 px-6 py-2 font-sarabun text-body-md font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
              >
                {locale === "th" ? "ลบ" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function PolicyIcon() {
  return (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function GavelIcon() {
  return (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
  );
}

function ApiIcon() {
  return (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}
