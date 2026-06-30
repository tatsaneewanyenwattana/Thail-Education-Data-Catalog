import apiClient from "@/services/api";
import type { DatasetFormValues } from "@/components/dataset/datasetFormSchema";
import type { AgencyDatasetFormInitial } from "@/types/dataset";

type ApiDataset = {
  id: string;
  title: string;
  description: string | null;
  license: string;
  category_id: string | null;
  metadata?: Record<string, unknown> | null;
  dataset_metadata?: Record<string, unknown> | null;
  tags?: string[];
  tag_names?: string[];
  file_info?: { file_name: string; file_size: number; file_format: string } | null;
  image_url?: string | null;
  status: string;
};

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
  const categoryId = String(formData.get("categoryId") ?? "");

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
  const statusVal = formData.get("status");
  if (statusVal === "draft" || statusVal === "published") {
    apiForm.append("status", String(statusVal));
  }
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
  const categoryId = String(formData.get("categoryId") ?? "");

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
    const datasetRes = await apiClient.get<{ data: ApiDataset }>(
      `/datasets/${datasetId}`
    );
    const ds = datasetRes.data.data;
    if (!ds) {
      return null;
    }

    const meta = ds.metadata ?? ds.dataset_metadata ?? {};

    return {
      title: ds.title,
      description: ds.description ?? "",
      categoryId: ds.category_id ?? "",
      license: ds.license as AgencyDatasetFormInitial["license"],
      tags: ds.tag_names ?? ds.tags ?? [],
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
      fileInfo: ds.file_info ?? undefined,
      image_url: ds.image_url ?? null,
    };
  } catch {
    return null;
  }
}
