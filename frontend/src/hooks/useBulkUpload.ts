"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api";
import type { BulkUploadResult } from "@/data/mockData";

// TODO: ต้องการ MinIO รันก่อนทดสอบ
// docker-compose up -d minio
// ทดสอบที่: /th/datasets/bulk-upload

type BulkUploadApiRowError = {
  row: number;
  error: string;
};

type BulkUploadApiResponse = {
  success_count: number;
  error_count: number;
  errors: BulkUploadApiRowError[];
};

function mapBulkUploadResponse(data: BulkUploadApiResponse): BulkUploadResult {
  return {
    success: data.success_count,
    errors: data.error_count,
    errorDetails: data.errors.map((item) => ({
      row: item.row,
      titleTh: "—",
      titleEn: "—",
      column: "—",
      reasonTh: item.error,
      reasonEn: item.error,
    })),
  };
}

async function bulkUpload(file: File): Promise<BulkUploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await apiClient.post<{ data: BulkUploadApiResponse }>(
    "/datasets/bulk-upload",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120000,
    }
  );

  return mapBulkUploadResponse(res.data.data);
}

export async function downloadBulkUploadTemplate(): Promise<Blob> {
  const res = await apiClient.get<Blob>("/datasets/bulk-upload/template", {
    responseType: "blob",
  });
  return res.data;
}

export function useBulkUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkUpload,
    retry: 0,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agency", "datasets"] });
    },
  });
}
