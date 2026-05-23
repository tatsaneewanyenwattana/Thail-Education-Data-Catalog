import DatasetCard from "@/components/dataset/DatasetCard";
import type { MockDataset } from "@/data/mockDatasets";

type DatasetListProps = {
  datasets: MockDataset[];
};

export default function DatasetList({ datasets }: DatasetListProps) {
  if (datasets.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {datasets.map((dataset) => (
        <DatasetCard
          key={dataset.id}
          id={dataset.id}
          title={dataset.title}
          category={dataset.category}
          agency={dataset.agency}
          status="published"
          downloadCount={dataset.downloadCount}
          updatedAt={dataset.publishedAt}
          license={dataset.license}
        />
      ))}
    </div>
  );
}
