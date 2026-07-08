"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useAgencyScholarships } from "@/hooks/useAgencyScholarships";

const TYPE_KEYS: Record<string, string> = {
  government: "government",
  private: "private",
  foundation: "foundation",
  exchange: "exchange",
  other: "other",
};

const TYPE_COLORS: Record<string, string> = {
  government: "#1565c0",
  private: "#c62828",
  foundation: "#2e7d32",
  exchange: "#e65100",
  other: "#546e7a",
};

export default function ScholarshipsList() {
  const t = useTranslations("agency.dashboard");
  const tType = useTranslations("scholarship.types");
  const locale = useLocale();
  const base = `/${locale}`;
  const { data: scholarships = [] } = useAgencyScholarships();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale === "th" ? "th-TH" : "en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const sorted = [...scholarships].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <h3 className="font-kanit text-[15px] font-semibold text-gray-900 mb-0.5">
        {t("recentScholarships")}
      </h3>
      <p className="font-sarabun text-xs text-gray-500 mb-3">
        {t("recentScholarshipsCount", { count: sorted.length })}
      </p>

      {sorted.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.slice(0, 6).map((scholarship) => {
            const typeKey = TYPE_KEYS[scholarship.scholarshipType] || "other";
            const typeLabel = tType(typeKey);
            const typeColor = TYPE_COLORS[scholarship.scholarshipType] || TYPE_COLORS.other;
            return (
              <div
                key={scholarship.id}
                className="rounded-xl bg-[#f3e5f5] p-3"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: typeColor }}
                  />
                  <div className="flex-1 min-w-0">
                    <span
                      className="inline-block rounded-full px-2.5 py-0.5 font-sarabun text-caption font-medium text-white mb-1"
                      style={{ backgroundColor: typeColor }}
                    >
                      {typeLabel}
                    </span>
                    <p className="font-kanit text-label font-semibold text-gray-900 mb-0.5">
                      {locale === "th" ? scholarship.title : scholarship.titleEn}
                    </p>
                    {scholarship.description && (
                      <p className="font-sarabun text-caption text-gray-600 line-clamp-1 mb-1">
                        {scholarship.description}
                      </p>
                    )}
                    <p className="font-sarabun text-caption text-gray-500">
                      {t("scholarshipDeadline", { date: formatDate(scholarship.closeDate) })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="font-sarabun text-body-md text-gray-500">
          {t("noScholarships")}
        </p>
      )}

      <div className="mt-3 flex justify-end">
        <Link
          href={`${base}/manage/scholarships`}
          className="rounded-full border border-[#01579b]/30 px-4 py-1.5 font-sarabun text-label font-medium text-[#01579b] transition-colors hover:bg-[#e3f2fd]"
        >
          {t("viewAll")}
        </Link>
      </div>
    </div>
  );
}
