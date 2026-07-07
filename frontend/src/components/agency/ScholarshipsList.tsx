"use client";

import { useLocale } from "next-intl";
import { useAgencyScholarships } from "@/hooks/useAgencyScholarships";

export default function ScholarshipsList() {
  const locale = useLocale();
  const { data: scholarships = [] } = useAgencyScholarships();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale === "th" ? "th-TH" : "en-US", {
      day: "numeric",
      month: "short",
      year: "2-digit",
    });
  };

  const sortedScholarships = [...scholarships].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div className="rounded-2xl border border-border-default/60 bg-surface-card p-6 shadow-level-1">
      <h3 className="font-kanit text-heading-3-mobile font-semibold text-text-primary mb-4">
        ทุนที่เปิดรับ (ล่าสุด)
      </h3>
      {sortedScholarships.length > 0 ? (
        <div className="flex flex-col gap-0">
          {sortedScholarships.map((scholarship) => (
            <div
              key={scholarship.id}
              className="flex items-center justify-between border-b border-border-default/20 py-2.5 last:border-b-0"
            >
              <div className="flex-1 min-w-0">
                <p className="font-sarabun text-label text-text-primary truncate">
                  {locale === "th" ? scholarship.title : scholarship.titleEn}
                  <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-caption font-semibold text-green-700">
                    เปิดรับ
                  </span>
                </p>
              </div>
              <p className="font-sarabun text-caption text-text-muted ml-3 flex-shrink-0">
                {formatDate(scholarship.updatedAt)}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="font-sarabun text-body-md text-text-muted">
          ไม่มีทุนที่เปิดรับ
        </p>
      )}
    </div>
  );
}
