"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import apiClient from "@/services/api";
import type { AgencyBookmarkMock } from "@/data/mockData";
import { fetchBookmarks } from "@/utils/savedItemsApi";

export function useBookmarks() {
  return useQuery<AgencyBookmarkMock[]>({
    queryKey: ["agency", "bookmarks"],
    queryFn: fetchBookmarks,
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAddBookmark() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const locale = useLocale();

  return useMutation({
    mutationFn: async (datasetId: string) => {
      await apiClient.post("/bookmarks", { dataset_id: datasetId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agency", "bookmarks"] });
    },
    onError: (error: unknown) => {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 401 || status === 403) {
        router.push(`/${locale}/login`);
      }
    },
  });
}

export function useDeleteBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (datasetId: string) => {
      await apiClient.delete(`/bookmarks/${datasetId}`);
    },
    retry: 0,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agency", "bookmarks"] });
    },
  });
}
