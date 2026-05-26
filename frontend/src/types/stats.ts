import type { ApiDataset } from "@/types/dataset";

export type StatsOverviewData = {
  total_datasets: number;
  total_downloads: number;
  total_agencies: number;
  datasets_by_year: { year: number; count: number }[];
};

export type TrendingDatasetsData = {
  datasets: ApiDataset[];
};

export type NewReleasesData = {
  datasets: ApiDataset[];
};
