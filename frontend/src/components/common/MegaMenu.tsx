"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  MOCK_MEGAMENU_AGENCIES,
  MOCK_MEGAMENU_CATEGORIES,
  MOCK_MEGAMENU_YEARS,
} from "@/data/mockData";

type MegaMenuProps = {
  open: boolean;
  onClose: () => void;
  variant?: "dropdown" | "drawer";
};

export default function MegaMenu({
  open,
  onClose,
  variant = "dropdown",
}: MegaMenuProps) {
  const t = useTranslations("megamenu");
  const locale = useLocale();
  const isTh = locale === "th";

  if (!open) {
    return null;
  }

  const label = (item: { labelTh: string; labelEn: string }) =>
    isTh ? item.labelTh : item.labelEn;

  const content = (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-6">
      <div>
        <h4 className="mb-3 font-kanit text-label font-bold text-primary-dark">
          {t("categories")}
        </h4>
        <ul className="space-y-2">
          {MOCK_MEGAMENU_CATEGORIES.map((cat) => (
            <li key={cat.id}>
              <button
                type="button"
                className="font-sarabun text-label text-text-secondary transition-colors hover:text-primary-dark"
                onClick={onClose}
              >
                {label(cat)}
              </button>
              {cat.children && cat.children.length > 0 && (
                <ul className="mt-1 space-y-1 border-l-2 border-primary-light pl-3">
                  {cat.children.map((child) => (
                    <li key={child.id}>
                      <button
                        type="button"
                        className="font-sarabun text-caption text-text-muted transition-colors hover:text-primary-dark"
                        onClick={onClose}
                      >
                        {label(child)}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="mb-3 font-kanit text-label font-bold text-primary-dark">
          {t("year")}
        </h4>
        <ul className="space-y-2">
          {MOCK_MEGAMENU_YEARS.map((year) => (
            <li key={year.id}>
              <Link
                href={`/${locale}/search?year=${year.id.replace("y", "")}`}
                className="font-sarabun text-label text-text-secondary transition-colors hover:text-primary-dark"
                onClick={onClose}
              >
                {label(year)}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="mb-3 font-kanit text-label font-bold text-primary-dark">
          {t("agency")}
        </h4>
        <ul className="space-y-2">
          {MOCK_MEGAMENU_AGENCIES.map((agency) => (
            <li key={agency.id}>
              <Link
                href={`/${locale}/search?agency=${agency.id}`}
                className="font-sarabun text-label text-text-secondary transition-colors hover:text-primary-dark"
                onClick={onClose}
              >
                {label(agency)}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  if (variant === "drawer") {
    return (
      <div className="fixed inset-0 z-[60] md:hidden">
        <button
          type="button"
          className="absolute inset-0 bg-surface-navy/40"
          aria-label={t("close")}
          onClick={onClose}
        />
        <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-surface-card shadow-level-3">
          <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
            <span className="font-kanit text-heading-3-mobile text-primary-dark">
              {t("categories")}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="rounded-radius-sm p-2 text-text-muted hover:bg-surface-container"
              aria-label={t("close")}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">{content}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute left-0 top-full z-50 hidden w-[min(800px,calc(100vw-2rem))] rounded-b-radius-lg border border-border-default bg-surface-card p-6 shadow-level-2 md:block">
      {content}
    </div>
  );
}
