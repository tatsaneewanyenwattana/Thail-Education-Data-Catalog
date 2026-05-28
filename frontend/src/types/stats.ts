import type { ApiDataset } from "@/types/dataset";

export type StatsOverviewData = {
  total_datasets: number;
  total_downloads: number;
  total_agencies: number;
  total_categories_level1: number;
  total_categories_level2: number;
  datasets_by_year: { year: number; count: number }[];
  datasets_published_this_month: number;
  datasets_published_last_month: number;
  datasets_month_change_percent: number | null;
  agencies_with_published_datasets: number;
  top_download_format: string | null;
  top_download_format_percent: number | null;
};

export type TrendingDatasetsData = {
  datasets: ApiDataset[];
};

export type NewReleasesData = {
  datasets: ApiDataset[];
};
