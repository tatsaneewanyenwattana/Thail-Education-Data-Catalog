"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import type { StatsTopDataset } from "@/data/mockData";
import { formatCompactCount } from "./chartUtils";

type TopDatasetListProps = {
  items: StatsTopDataset[];
};

export default function TopDatasetList({ items }: TopDatasetListProps) {
  const t = useTranslations("stats");
  const locale = useLocale();
  const base = `/${locale}`;
  const isTh = locale === "th";

  return (
    <div className="rounded-radius-lg border border-border-default bg-surface-card p-4 shadow-level-1 md:p-6">
      <h2 className="mb-6 font-kanit text-heading-3-mobile font-semibold text-text-primary md:text-heading-3">
        {t("topDatasets")}
      </h2>
      <ul className="flex flex-col gap-2">
        {items.map((item, index) => {
          const title = isTh ? item.titleTh : item.titleEn;
          const category = isTh ? item.categoryTh : item.categoryEn;
          const rankOpacity = 1 - index * 0.15;

          return (
            <li key={item.id}>
              <Link
                href={`${base}/datasets/${item.id}`}
                className="group flex items-center gap-4 rounded-radius-md p-3 transition-colors hover:bg-surface-container"
              >
                <span
                  className="w-8 shrink-0 font-kanit text-2xl font-bold text-primary-dark"
                  style={{ opacity: rankOpacity }}
                >
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-sarabun text-label font-medium text-text-primary transition-colors group-hover:text-primary-dark">
                    {title}
                  </p>
                  <span className="font-sarabun text-caption text-text-muted">
                    {t("categoryLabel")}: {category}
                  </span>
                </div>
                <div className="shrink-0 text-right">
                  <span className="block font-kanit text-label font-bold text-primary-dark">
                    {formatCompactCount(item.downloads, locale)}
                  </span>
                  <span className="font-sarabun text-caption uppercase text-text-muted">
                    {t("downloads")}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
