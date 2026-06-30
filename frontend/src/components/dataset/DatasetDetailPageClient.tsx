"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import DatasetDetail from "@/components/dataset/DatasetDetail";
import DatasetDetailSkeleton from "@/components/dataset/DatasetDetailSkeleton";
import { useCategories } from "@/hooks/useCategories";
import { useDatasetCitation } from "@/hooks/useDatasetCitation";
import { useDatasetDetail } from "@/hooks/useDatasetDetail";
import { buildDatasetDetailView } from "@/utils/datasetDetailMappers";
import { markDatasetAsViewed } from "@/utils/datasetNew";

type DatasetDetailPageClientProps = {
  id: string;
  locale: string;
};

function formatPublishedDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale === "th" ? "th-TH" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function formatDownloadCount(count: number, locale: string): string {
  return count.toLocaleString(locale === "th" ? "th-TH" : "en-US");
}

export default function DatasetDetailPageClient({
  id,
  locale,
}: DatasetDetailPageClientProps) {
  const t = useTranslations("dataset");
  const base = `/${locale}`;
  const uiLocale = useLocale();

  const {
    data: apiDataset,
    isLoading: detailLoading,
    isError: detailError,
    error: detailErr,
  } = useDatasetDetail(id);

  const { data: categories = [] } = useCategories();

  const { data: citation } = useDatasetCitation(
    id,
    Boolean(apiDataset) && !detailLoading
  );

  useEffect(() => {
    if (apiDataset && !detailLoading) {
      markDatasetAsViewed(id);
    }
  }, [apiDataset, detailLoading, id]);

  if (detailLoading) {
    return <DatasetDetailSkeleton />;
  }

  if (detailError || !apiDataset) {
    const code = (detailErr as Error & { code?: string })?.code;
    const isNotFound = code === "DATASET_NOT_FOUND";

    return (
      <div className="mx-auto max-w-container-max px-4 py-16 text-center">
        <p className="font-kanit text-heading-3 text-text-primary">
          {isNotFound ? t("notFound") : t("detail.loadError")}
        </p>
        {detailErr?.message && !isNotFound && (
          <p className="mt-2 font-sarabun text-body-md text-text-secondary">
            {detailErr.message}
          </p>
        )}
        <Link
          href={`${base}/search`}
          className="mt-6 inline-block font-sarabun text-label text-primary-dark hover:underline"
        >
          {t("detail.breadcrumbCategory")}
        </Link>
      </div>
    );
  }

  const agencyDisplay =
    uiLocale === "en" && apiDataset.agency_name_en
      ? apiDataset.agency_name_en
      : (citation?.agency_name ?? apiDataset.agency_name);
  const detail = buildDatasetDetailView(
    apiDataset,
    categories,
    uiLocale,
    agencyDisplay
  );

  // ถ้า updated_at != created_at → แสดง "อัปเดตล่าสุด" ถ้าเหมือนกัน → "เผยแพร่เมื่อ" ตาม #5 M5
  const isUpdated =
    new Date(detail.updatedAt).getTime() !== new Date(detail.createdAt).getTime();
  const dateLabel = formatPublishedDate(
    isUpdated ? detail.updatedAt : detail.publishedAt,
    locale
  );

  return (
    <DatasetDetail
      datasetId={id}
      detail={detail}
      publishedDateLabel={dateLabel}
      isUpdated={isUpdated}
      downloadCountLabel={formatDownloadCount(detail.downloadCount, locale)}
      sourceFileFormat={apiDataset.file_format}
      viewCount={apiDataset.view_count ?? 0}
      ratingAvg={apiDataset.rating_avg ?? 0}
      ratingCount={apiDataset.rating_count ?? 0}
      userRating={apiDataset.user_rating ?? null}
      datasetOwnerId={apiDataset.user_id ? String(apiDataset.user_id) : ""}
      isPublished={apiDataset.status === "published"}
    />
  );
}
