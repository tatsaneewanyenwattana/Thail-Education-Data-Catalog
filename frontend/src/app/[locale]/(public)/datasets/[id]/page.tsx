import { notFound } from "next/navigation";
import DatasetDetail from "@/components/dataset/DatasetDetail";
import { getDatasetDetailById } from "@/data/mockData";

type DatasetDetailPageProps = {
  params: { locale: string; id: string };
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

export default function DatasetDetailPage({ params }: DatasetDetailPageProps) {
  const dataset = getDatasetDetailById(params.id);

  if (!dataset) {
    notFound();
  }

  return (
    <DatasetDetail
      dataset={dataset}
      publishedDateLabel={formatPublishedDate(dataset.publishedAt, params.locale)}
      downloadCountLabel={formatDownloadCount(
        dataset.downloadCount,
        params.locale
      )}
    />
  );
}
