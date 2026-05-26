"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import { MOCK_MEGAMENU_AGENCIES } from "@/data/mockData";
import { useCategories } from "@/hooks/useCategories";

// TODO: เชื่อม GET /api/v1/public/agencies เมื่อ Backend เพิ่ม endpoint นี้

type MegaMenuProps = {
  open: boolean;
  onClose: () => void;
  variant?: "dropdown" | "drawer";
};

function buildMegamenuYears(): string[] {
  const currentYear = new Date().getFullYear() + 543;
  return Array.from({ length: 5 }, (_, i) => String(currentYear - i));
}

export default function MegaMenu({
  open,
  onClose,
  variant = "dropdown",
}: MegaMenuProps) {
  const t = useTranslations("megamenu");
  const locale = useLocale();
  const isTh = locale === "th";

  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();

  const level1Categories = useMemo(
    () => categories.filter((c) => c.level === 1),
    [categories]
  );

  const years = useMemo(() => buildMegamenuYears(), []);

  if (!open) {
    return null;
  }

  const label = (item: { labelTh: string; labelEn: string }) =>
    isTh ? item.labelTh : item.labelEn;

  const yearLabel = (year: string) =>
    isTh ? `ปี พ.ศ. ${year}` : `B.E. ${year}`;

  const content = (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-6">
      <div>
        <h4 className="mb-3 font-kanit text-label font-bold text-primary-dark">
          {t("categories")}
        </h4>
        {categoriesLoading ? (
          <p className="font-sarabun text-caption text-text-muted">
            {isTh ? "กำลังโหลด..." : "Loading..."}
          </p>
        ) : level1Categories.length === 0 ? (
          <p className="font-sarabun text-caption text-text-muted">
            {isTh ? "ยังไม่มีหมวดหมู่" : "No categories yet"}
          </p>
        ) : (
          <ul className="space-y-2">
            {level1Categories.map((cat) => (
              <li key={cat.id}>
                <Link
                  href={
                    cat.slug
                      ? `/${locale}/categories/${cat.slug}`
                      : `/${locale}/search`
                  }
                  className="font-sarabun text-label text-text-secondary transition-colors hover:text-primary-dark"
                  onClick={onClose}
                >
                  {isTh ? cat.name_th : cat.name_en}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h4 className="mb-3 font-kanit text-label font-bold text-primary-dark">
          {t("year")}
        </h4>
        <ul className="space-y-2">
          {years.map((year) => (
            <li key={year}>
              <Link
                href={`/${locale}/search?year=${year}`}
                className="font-sarabun text-label text-text-secondary transition-colors hover:text-primary-dark"
                onClick={onClose}
              >
                {yearLabel(year)}
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
