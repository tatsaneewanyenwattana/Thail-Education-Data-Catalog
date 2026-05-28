import apiClient from "@/services/api";
import type { DatasetFormValues } from "@/components/dataset/datasetFormSchema";
import type { AgencyDatasetFormInitial } from "@/data/mockData";

type ApiCategory = {
  id: string;
  slug: string;
  level: number;
  parent_id: string | null;
};

type ApiDataset = {
  id: string;
  title: string;
  description: string | null;
  license: string;
  category_id: string | null;
  metadata?: Record<string, unknown> | null;
  dataset_metadata?: Record<string, unknown> | null;
  status: string;
};

let categoriesCache: ApiCategory[] | null = null;

async function fetchCategories(): Promise<ApiCategory[]> {
  if (categoriesCache) {
    return categoriesCache;
  }
  const res = await apiClient.get<{ data: ApiCategory[] }>("/categories");
  categoriesCache = res.data.data ?? [];
  return categoriesCache;
}

export function resolveCategoryId(
  level2Slug: string,
  categories: ApiCategory[]
): string | undefined {
  const match = categories.find(
    (c) => c.slug === level2Slug && c.level === 2
  );
  return match?.id;
}

function buildMetadata(formData: FormData): Record<string, unknown> | null {
  const meta: Record<string, unknown> = {};
  const yearStart = formData.get("year_start");
  const yearEnd = formData.get("year_end");
  const province = formData.get("province");
  if (yearStart) {
    meta.year_start = Number(yearStart);
  }
  if (yearEnd) {
    meta.year_end = Number(yearEnd);
  }
  if (province && province !== "all") {
    meta.province = String(province);
  }
  return Object.keys(meta).length > 0 ? meta : null;
}

export async function toUploadApiFormData(
  formData: FormData
): Promise<FormData> {
  const categories = await fetchCategories();
  const level2Slug = String(formData.get("categoryLevel2") ?? "");
  const categoryId = resolveCategoryId(level2Slug, categories);

  const apiForm = new FormData();
  const file = formData.get("file");
  if (file instanceof File) {
    apiForm.append("file", file);
  }
  apiForm.append("title", String(formData.get("title") ?? ""));
  const description = formData.get("description");
  if (description) {
    apiForm.append("description", String(description));
  }
  apiForm.append("license", String(formData.get("license") ?? "open"));
  if (categoryId) {
    apiForm.append("category_id", categoryId);
  }
  const metadata = buildMetadata(formData);
  if (metadata) {
    apiForm.append("metadata", JSON.stringify(metadata));
  }
  const tags = formData
    .getAll("tags[]")
    .map((tag) => String(tag).trim())
    .filter(Boolean);
  apiForm.append("tags", JSON.stringify(tags));
  return apiForm;
}

export type DatasetUpdateBody = {
  title: string;
  description?: string;
  license: string;
  category_id?: string;
  metadata?: Record<string, unknown>;
  status?: "draft" | "published";
};

export async function toUpdateApiBody(
  formData: FormData
): Promise<DatasetUpdateBody> {
  const categories = await fetchCategories();
  const level2Slug = String(formData.get("categoryLevel2") ?? "");
  const categoryId = resolveCategoryId(level2Slug, categories);

  const body: DatasetUpdateBody = {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? "") || undefined,
    license: String(formData.get("license") ?? "open"),
  };
  if (categoryId) {
    body.category_id = categoryId;
  }
  const metadata = buildMetadata(formData);
  if (metadata) {
    body.metadata = metadata;
  }
  const statusVal = formData.get("status");
  if (statusVal === "draft" || statusVal === "published") {
    body.status = statusVal;
  }
  return body;
}

export async function fetchDatasetFormInitial(
  datasetId: string
): Promise<AgencyDatasetFormInitial | null> {
  try {
    const [datasetRes, categories] = await Promise.all([
      apiClient.get<{ data: ApiDataset }>(`/datasets/${datasetId}`),
      fetchCategories(),
    ]);
    const ds = datasetRes.data.data;
    if (!ds) {
      return null;
    }

    const meta = ds.metadata ?? ds.dataset_metadata ?? {};
    let categoryLevel1 = "";
    let categoryLevel2 = "";
    if (ds.category_id) {
      const level2 = categories.find((c) => c.id === ds.category_id);
      if (level2) {
        categoryLevel2 = level2.slug;
        if (level2.parent_id) {
          const level1 = categories.find((c) => c.id === level2.parent_id);
          if (level1) {
            categoryLevel1 = level1.slug;
          }
        }
      }
    }

    return {
      title: ds.title,
      description: ds.description ?? "",
      categoryLevel1,
      categoryLevel2,
      license: ds.license as AgencyDatasetFormInitial["license"],
      tags: [],
      yearStart:
        typeof meta.year_start === "number"
          ? meta.year_start
          : typeof meta.year === "number"
            ? meta.year
            : undefined,
      yearEnd:
        typeof meta.year_end === "number" ? meta.year_end : undefined,
      province:
        typeof meta.province === "string" ? meta.province : "all",
    };
  } catch {
    return null;
  }
}
