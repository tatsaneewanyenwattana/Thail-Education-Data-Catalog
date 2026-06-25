export type DatasetStatus = "published" | "draft";

export type DatasetLicense = "open" | "conditional" | "cc";

export type SearchFileFormat = "csv" | "excel" | "json";

export type HomeDatasetMock = {
  id: string;
  title: string;
  category: string;
  agency: string;
  status: DatasetStatus;
  downloadCount: number;
  apiDownloadCount?: number;
  viewCount?: number;
  qualityScore?: number | null;
  fileFormat?: string | null;
  updatedAt: string;
  createdAt?: string;
  publishedAt?: string | null;
  license: DatasetLicense;
};

export type SearchResultMock = {
  id: string;
  titleTh: string;
  titleEn: string;
  descriptionTh: string;
  descriptionEn: string;
  categoryTh: string;
  categoryEn: string;
  categoryId: string;
  leafCategoryId?: string;
  subcategorySlug?: string;
  agencyTh: string;
  agencyEn: string;
  agencyId: string;
  status: DatasetStatus;
  downloadCount: number;
  createdAt?: string;
  updatedAt: string;
  publishedAt?: string | null;
  license: DatasetLicense;
  fileFormats: SearchFileFormat[];
  year: number;
};

export type DatasetPreviewColumn = {
  key: string;
  labelTh: string;
  labelEn: string;
  masked: boolean;
};

export type DatasetDetailMock = {
  id: string;
  titleTh: string;
  titleEn: string;
  descriptionTh: string;
  descriptionEn: string;
  categoryTh: string;
  categoryEn: string;
  subcategoryTh: string;
  subcategoryEn: string;
  agencyTh: string;
  agencyEn: string;
  publishedAt: string;
  downloadCount: number;
  qualityScore: number;
  license: DatasetLicense;
  status: DatasetStatus;
  tagsTh: string[];
  tagsEn: string[];
  columns: DatasetPreviewColumn[];
  previewData: Record<string, string | number>[];
  citationApaTh: string;
  citationApaEn: string;
  citationVancouverTh: string;
  citationVancouverEn: string;
};

export type AgencyDatasetRow = {
  id: string;
  title: string;
  titleEn: string;
  category: string;
  categoryEn: string;
  subcategory: string;
  subcategoryEn: string;
  status: "draft" | "published";
  qualityScore: number;
  downloadCount: number;
  updatedAt: string;
  fileFormat?: string | null;
};

export type AgencyDatasetFormInitial = {
  title: string;
  description: string;
  categoryId: string;
  license: DatasetLicense;
  tags: string[];
  yearStart?: number;
  yearEnd?: number;
  province?: string;
};

export type FileAnalysisResult = {
  qualityScore: number;
  piiColumnsTh: string[];
  piiColumnsEn: string[];
};

export type BulkUploadErrorDetail = {
  row: number;
  titleTh: string;
  titleEn: string;
  column: string;
  reasonTh: string;
  reasonEn: string;
};

export type BulkUploadResult = {
  success: number;
  errors: number;
  errorDetails: BulkUploadErrorDetail[];
};

export type DatasetVersionChangelogType = "edit" | "add" | "initial";

export type DatasetVersionItem = {
  version: string;
  createdAt: string;
  createdByTh: string;
  createdByEn: string;
  changelogType: DatasetVersionChangelogType;
  changelogTh: string[];
  changelogEn: string[];
  isCurrent: boolean;
};

export type UploadDatasetMockResult = {
  id: string;
  status: "draft" | "published";
};

export type MockDataset = {
  id: string;
  title: string;
  description: string;
  agency: string;
  category: string;
  categorySlug: string;
  license: "open" | "conditional" | "cc";
  downloadCount: number;
  viewCount: number;
  publishedAt: string;
  tags: string[];
  year?: number;
  province?: string;
};

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
