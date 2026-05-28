"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api";

type HideDatasetResult = {
  id: string;
  status: string;
};

async function hideDataset(datasetId: string): Promise<HideDatasetResult> {
  const res = await apiClient.post<{ data: HideDatasetResult }>(
    `/admin/datasets/${datasetId}/hide`
  );
  return res.data.data;
}

export function useHideDataset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: hideDataset,
    retry: 0,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "datasets"] });
    },
  });
}
