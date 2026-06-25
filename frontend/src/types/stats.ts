import type { ApiDataset } from "@/types/dataset";

export type StatsYearPoint = {
  year: string;
  count: number;
};

export type StatsCategorySlice = {
  nameTh: string;
  nameEn: string;
  value: number;
};

export type StatsTopDataset = {
  id: string;
  titleTh: string;
  titleEn: string;
  categoryTh: string;
  categoryEn: string;
  downloads: number;
};

export type StatsDataMock = {
  overview: {
    totalDatasets: number;
    totalAgencies: number;
    totalDownloads: number;
    totalCategories: number;
  };
  studentsByYear: StatsYearPoint[];
  teachersByYear: StatsYearPoint[];
  schoolsByYear: StatsYearPoint[];
  datasetByCategory: StatsCategorySlice[];
  topDatasets: StatsTopDataset[];
};

export type AgencyMonthlyDownload = {
  month: string;
  monthEn: string;
  count: number;
};

export type AgencyDashboardStats = {
  totalDatasets: number;
  publishedDatasets: number;
  draftDatasets: number;
  submittedDatasets: number;
  totalDownloads: number;
  monthlyDownloads: AgencyMonthlyDownload[];
  datasetsCreatedThisMonth: number;
  datasetsCreatedLastMonth: number;
  datasetsMonthChangePercent: number | null;
  downloadsThisMonth: number;
  topDownloadFormat: string | null;
  topDownloadFormatPercent: number | null;
};

export type DashboardWidgetType = "bar" | "line" | "pie" | "stat";

export type DashboardGridWidget = {
  id: string;
  type: DashboardWidgetType;
  colSpan: 1 | 2 | 3;
};

export type WidgetChartPoint = {
  name: string;
  nameEn: string;
  value: number;
};

export type WidgetStatData = {
  value: number;
  labelTh: string;
  labelEn: string;
  trend: string;
  trendUp: boolean;
};

export type AgencyBookmarkMock = {
  id: string;
  datasetId: string;
  title: string;
  titleEn: string;
  category: string;
  categoryEn: string;
  agency: string;
  agencyEn: string;
  status: "published" | "draft";
  viewCount: number;
  updatedAt: string;
};

export type AgencySubscriptionMock = {
  id: string;
  type: "category" | "agency";
  name: string;
  nameEn: string;
  subscribedAt: string;
};

export type SavedSearchFilters = Record<string, string>;

export type AgencySavedSearchMock = {
  id: string;
  name: string;
  filters: SavedSearchFilters;
  createdAt: string;
};

export type StatsOverviewData = {
  total_datasets: number;
  total_downloads: number;
  total_agencies: number;
  total_categories: number;
  categories_by_level: Record<string, number>;
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
