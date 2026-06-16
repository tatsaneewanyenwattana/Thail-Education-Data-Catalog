"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api";

type PublishedDataset = {
  id: string;
  title: string;
  status: string;
};

async function publishDataset(datasetId: string): Promise<PublishedDataset> {
  const res = await apiClient.post<{ data: PublishedDataset }>(
    `/datasets/${datasetId}/publish`
  );
  return res.data.data;
}

export function usePublishDataset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: publishDataset,
    retry: 1,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agency", "datasets"] });
      queryClient.invalidateQueries({ queryKey: ["agency", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["datasets"] });
    },
  });
}
