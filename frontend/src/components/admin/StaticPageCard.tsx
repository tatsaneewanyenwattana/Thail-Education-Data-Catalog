"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import type { AdminStaticPageMeta } from "@/data/mockData";

const ICON_CONFIG = {
  policy: {
    Icon: PolicyIcon,
    bgClass: "bg-primary/10 text-primary",
  },
  gavel: {
    Icon: GavelIcon,
    bgClass: "bg-primary-light text-primary-dark",
  },
  api: {
    Icon: ApiIcon,
    bgClass: "bg-primary-container/10 text-primary-container",
  },
  help: {
    Icon: HelpIcon,
    bgClass: "bg-primary-container/10 text-primary-container",
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

  const { Icon, bgClass } = ICON_CONFIG[page.icon];
  const title = locale === "th" ? page.titleTh : page.titleEn;
  const isDraft = page.status === "draft";

  return (
    <article className="group flex flex-col justify-between rounded-2xl border border-white/80 bg-white p-7 shadow-md transition-all hover:shadow-lg">
      <div>
        {/* Icon + Status */}
        <div className="mb-5 flex items-start justify-between">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl ${bgClass}`}
          >
            <Icon />
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-3.5 py-1.5 font-sarabun text-body-sm font-bold uppercase tracking-wide">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isDraft ? "bg-amber-400" : "bg-emerald-500"
              }`}
            />
            <span className={isDraft ? "text-amber-600" : "text-emerald-600"}>
              {isDraft ? t("draft") : t("published")}
            </span>
          </span>
        </div>

        {/* Title */}
        <h4 className="font-kanit text-xl font-bold text-text-primary transition-colors group-hover:text-primary-dark">
          {title}
        </h4>
        <p className="mt-1 font-sarabun text-body-sm text-text-muted">
          {page.route}
        </p>

        {/* Meta row */}
        <div className="mt-5 flex items-center justify-between text-text-muted">
          <div>
            <p className="font-sarabun text-body-sm">{t("lastEdit")}</p>
            <p className="font-sarabun text-body-md font-bold text-text-primary">
              {formatUpdatedAt(page.updatedAt, locale)}
            </p>
          </div>
          <div className="text-right">
            <p className="font-sarabun text-body-sm">{t("totalViews")}</p>
            <p className="font-sarabun text-body-md font-bold text-text-primary">
              &mdash;
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => router.push(`/${locale}/admin/pages/${page.slug}`)}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-primary-dark py-2.5 font-sarabun text-body-md font-semibold text-primary-dark transition-all hover:bg-primary-dark/5 hover:shadow-md"
      >
        <EditIcon />
        {t("editContent")}
      </button>
    </article>
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
