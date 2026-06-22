import type { DatasetLicense, DatasetStatus } from "@/data/mockData";

export type ApiDataset = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  license: string;
  category_id: string | null;
  tags: string[];
  metadata?: Record<string, unknown> | null;
  quality_score: number | null;
  download_count: number;
  api_download_count?: number;
  view_count?: number;
  published_at: string | null;
  created_at: string;
  updated_at?: string;
  agency_name?: string | null;
  category_name_th?: string | null;
  category_name_en?: string | null;
  file_format?: string | null;
  user_id?: string;
  rating_avg?: number;
  rating_count?: number;
  user_rating?: number | null;
};

export type DatasetPreviewData = {
  rows: Record<string, string | number>[];
  total_rows: number;
  columns: string[];
  masked_columns: string[];
};

export type DatasetCitationData = {
  dataset_id: string;
  title: string;
  agency_name: string | null;
  license: string;
  published_at: string | null;
  apa: string;
  vancouver: string;
};

export type DatasetDetailView = {
  id: string;
  title: string;
  description: string;
  categoryLabel: string;
  subcategoryLabel: string;
  agencyName: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  downloadCount: number;
  qualityScore: number;
  license: DatasetLicense;
  status: DatasetStatus;
};
