"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api";

type SubmittedDataset = {
  id: string;
  title: string;
  status: string;
};

async function submitDataset(datasetId: string): Promise<SubmittedDataset> {
  const res = await apiClient.post<{ data: SubmittedDataset }>(
    `/datasets/${datasetId}/submit`
  );
  return res.data.data;
}

export function useSubmitDataset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitDataset,
    retry: 1,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agency", "datasets"] });
      queryClient.invalidateQueries({ queryKey: ["agency", "dashboard"] });
    },
  });
}
