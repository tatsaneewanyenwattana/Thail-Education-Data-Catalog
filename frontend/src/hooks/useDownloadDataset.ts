"use client";

import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import apiClient from "@/services/api";

export type DownloadFormat = "csv" | "excel" | "json" | "xml" | "pdf" | "sql";

export type DownloadDatasetVariables = {
  datasetId: string;
  purpose: string;
  format: DownloadFormat;
  fileId?: string;
};

type JSendErrorBody = {
  success?: boolean;
  error?: { code?: string; message?: string };
};

function fileExtension(format: DownloadFormat): string {
  return format === "excel" ? "xlsx" : format;
}

async function parseBlobError(blob: Blob): Promise<never> {
  try {
    const text = await blob.text();
    const json = JSON.parse(text) as JSendErrorBody;
    if (json.error?.message) {
      const err = new Error(json.error.message);
      (err as Error & { code?: string }).code = json.error.code;
      throw err;
    }
  } catch (e) {
    if (e instanceof Error && e.message !== "Download failed") {
      throw e;
    }
  }
  throw new Error("ดาวน์โหลดไม่สำเร็จ");
}

async function downloadDataset(
  variables: DownloadDatasetVariables
): Promise<Blob> {
  try {
    const res = await apiClient.get<Blob>(
      `/datasets/${variables.datasetId}/download`,
      {
        params: {
        purpose: variables.purpose,
        format: variables.format,
        ...(variables.fileId ? { file_id: variables.fileId } : {}),
      },
        responseType: "blob",
        timeout: 120000,
      }
    );

    const blob = res.data;
    if (blob.type.includes("json") && variables.format !== "json") {
      await parseBlobError(blob);
    }
    return blob;
  } catch (error) {
    if (
      error instanceof AxiosError &&
      error.response?.data instanceof Blob
    ) {
      await parseBlobError(error.response.data);
    }
    throw error;
  }
}

function triggerFileDownload(
  blob: Blob,
  datasetId: string,
  format: DownloadFormat
) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `dataset-${datasetId}.${fileExtension(format)}`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function useDownloadDataset() {
  return useMutation({
    mutationFn: downloadDataset,
    retry: 1,
    onSuccess: (blob, variables) => {
      triggerFileDownload(blob, variables.datasetId, variables.format);
    },
  });
}
