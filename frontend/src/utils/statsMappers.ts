import type { DatasetLicense, DatasetStatus, HomeDatasetMock } from "@/data/mockData";
import type { ApiDataset } from "@/types/dataset";
import type { ApiCategory } from "@/utils/categoryApi";

function categoryLabel(
  categoryId: string | null | undefined,
  categories: ApiCategory[],
  locale: string
): string {
  if (!categoryId) return "—";
  const cat = categories.find((c) => String(c.id) === String(categoryId));
  if (!cat) return "—";
  return locale === "th" ? cat.name_th : cat.name_en;
}

function agencyLabel(
  agencyName: string | null | undefined,
  metadata: Record<string, unknown> | null | undefined
): string {
  if (typeof agencyName === "string" && agencyName.trim()) {
    return agencyName.trim();
  }
  if (metadata) {
    const agency = metadata.agency;
    if (typeof agency === "string" && agency.trim()) {
      return agency.trim();
    }
  }
  return "ไม่ระบุหน่วยงาน";
}

/** Map API dataset → HomeDatasetMock for DatasetCard */
export function mapApiDatasetToHomeCard(
  dataset: ApiDataset,
  categories: ApiCategory[],
  locale: string
): HomeDatasetMock {
  return {
    id: dataset.id,
    title: dataset.title,
    category: categoryLabel(dataset.category_id, categories, locale),
    agency: agencyLabel(
      dataset.agency_name,
      dataset.metadata as Record<string, unknown> | null
    ),
    status: (dataset.status === "published"
      ? "published"
      : "draft") as DatasetStatus,
    downloadCount: dataset.download_count ?? 0,
    updatedAt:
      dataset.updated_at ?? dataset.published_at ?? dataset.created_at,
    createdAt: dataset.created_at,
    license: dataset.license as DatasetLicense,
  };
}
