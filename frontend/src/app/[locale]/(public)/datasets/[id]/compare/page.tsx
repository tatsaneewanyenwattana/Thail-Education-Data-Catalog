import DatasetComparePageClient from "@/components/dataset/DatasetComparePageClient";

type ComparePageProps = {
  params: { locale: string; id: string };
};

export default function DatasetComparePage({ params }: ComparePageProps) {
  return (
    <DatasetComparePageClient
      primaryId={params.id}
      locale={params.locale}
    />
  );
}
