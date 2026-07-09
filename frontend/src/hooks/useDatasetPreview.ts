"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/services/api";
import type { DatasetPreviewData } from "@/types/dataset";

/** GET /api/v1/datasets/{id}/preview — ไม่ต้อง Auth */
export function useDatasetPreview(datasetId: string, enabled = true, fileId?: string) {
  return useQuery<DatasetPreviewData, Error>({
    queryKey: ["datasets", datasetId, "preview", fileId ?? "latest"],
    queryFn: async () => {
      const params = fileId ? { file_id: fileId } : undefined;
      const res = await apiClient.get<{ data: DatasetPreviewData }>(
        `/datasets/${datasetId}/preview`,
        { params, timeout: 120000 }
      );
      return res.data.data;
    },
    enabled: Boolean(datasetId) && enabled,
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });
}
