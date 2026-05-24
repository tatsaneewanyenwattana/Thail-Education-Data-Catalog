"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteHeroImageMock,
  getHeroImageMock,
  uploadHeroImageMock,
  type HeroImageMock,
} from "@/data/mockData";

async function fetchHeroImage(): Promise<HeroImageMock> {
  // TODO: GET /api/v1/admin/hero-image
  await Promise.resolve();
  return getHeroImageMock();
}

export function useHeroImage() {
  return useQuery({
    queryKey: ["admin", "hero-image"],
    queryFn: fetchHeroImage,
    staleTime: 1000 * 60 * 5,
    placeholderData: () => getHeroImageMock(),
  });
}

export function useUploadHeroImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      // TODO: POST /api/v1/admin/hero-image
      return uploadHeroImageMock(file);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["admin", "hero-image"], data);
    },
  });
}

export function useDeleteHeroImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // TODO: DELETE /api/v1/admin/hero-image
      return deleteHeroImageMock();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["admin", "hero-image"], data);
    },
  });
}
