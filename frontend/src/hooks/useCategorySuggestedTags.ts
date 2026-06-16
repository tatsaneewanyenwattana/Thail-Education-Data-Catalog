"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/services/api";

type CategoryTagsResponse = {
  success: boolean;
  data: string[];
};

async function fetchCategorySuggestedTags(
  categoryId: string
): Promise<string[]> {
  const res = await apiClient.get<CategoryTagsResponse>(
    `/categories/${categoryId}/tags`
  );
  return res.data.data ?? [];
}

export function useCategorySuggestedTags(categoryId: string | undefined) {
  return useQuery({
    queryKey: ["categories", categoryId, "suggested-tags"],
    queryFn: () => fetchCategorySuggestedTags(categoryId!),
    enabled: Boolean(categoryId),
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });
}
