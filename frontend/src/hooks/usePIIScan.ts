"use client";

import apiClient from "@/services/api";
import type { PIIScanResult } from "@/types/pii";

export function usePIIScan() {
  const scanFile = async (file: File): Promise<PIIScanResult> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await apiClient.post<{ data: PIIScanResult }>(
      "/datasets/analyze",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return res.data.data as PIIScanResult;
  };

  return { scanFile };
}
