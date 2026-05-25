"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api";
import { toUploadApiFormData } from "@/utils/datasetFormApi";

export type UploadedDataset = {
  id: string;
  title: string;
  status: string;
};

async function uploadDataset(formData: FormData): Promise<UploadedDataset> {
  const apiForm = await toUploadApiFormData(formData);
  const res = await apiClient.post<{ data: UploadedDataset }>(
    "/datasets",
    apiForm,
    {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120000,
    }
  );
  return res.data.data;
}

export function useUploadDataset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadDataset,
    retry: 1,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agency", "datasets"] });
      queryClient.invalidateQueries({ queryKey: ["agency", "dashboard"] });
    },
  });
}
