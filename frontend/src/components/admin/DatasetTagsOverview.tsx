"use client";

import { useLocale, useTranslations } from "next-intl";
import type { AdminTag } from "@/data/mockData";

type DatasetTagsOverviewProps = {
  tags: AdminTag[];
  isLoading?: boolean;
};

function formatCount(value: number, locale: string): string {
  return value.toLocaleString(locale === "th" ? "th-TH" : "en-US");
}

export default function DatasetTagsOverview({
  tags,
  isLoading,
}: DatasetTagsOverviewProps) {
  const t = useTranslations("admin.categories");
  const locale = useLocale();

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-radius-lg border border-border-default bg-surface-card shadow-level-1">
        <div className="animate-pulse space-y-3 p-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-10 rounded-radius-sm bg-surface-container"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-radius-lg border border-border-default bg-surface-card shadow-level-1">
      <table className="w-full text-left">
        <thead className="border-b border-border-default/30 bg-surface-container-low">
          <tr>
            <th className="px-6 py-4 font-kanit text-[13px] font-bold uppercase text-text-muted">
              {t("tagColName")}
            </th>
            <th className="px-6 py-4 text-center font-kanit text-[13px] font-bold uppercase text-text-muted">
              {t("tagColDatasets")}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-default/20">
          {tags.length === 0 ? (
            <tr>
              <td
                colSpan={2}
                className="px-6 py-12 text-center font-sarabun text-body-md text-text-muted"
              >
                {t("tagsEmpty")}
              </td>
            </tr>
          ) : (
            tags.map((tag) => (
              <tr
                key={tag.id}
                className="transition-colors hover:bg-surface-container-lowest"
              >
                <td className="px-6 py-4">
                  <span className="rounded-radius-sm bg-surface-container px-2 py-1 font-sarabun text-body-sm font-medium text-text-primary">
                    #{tag.name}
                  </span>
                </td>
                <td className="px-6 py-4 text-center font-sarabun text-body-md font-medium text-text-primary">
                  {formatCount(tag.datasetCount, locale)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
