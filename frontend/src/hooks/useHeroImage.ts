"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api";

// TODO: ต้องการ MinIO รันก่อนทดสอบ
// docker-compose up -d minio
// ทดสอบที่: /th/admin/pages → Hero Background

export type HeroImageData = {
  imageUrl: string | null;
};

type HeroImageApiResponse = {
  image_url: string | null;
};

function mapHeroImage(data: HeroImageApiResponse): HeroImageData {
  return { imageUrl: resolveHeroImageUrl(data.image_url ?? null) };
}

function resolveHeroImageUrl(path: string | null): string | null {
  if (!path) {
    return null;
  }
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

async function fetchHeroImage(): Promise<HeroImageData> {
  const res = await apiClient.get<{ data: HeroImageApiResponse }>(
    "/public/settings/hero-image"
  );
  return mapHeroImage(res.data.data);
}

export function useHeroImage() {
  return useQuery({
    queryKey: ["settings", "hero-image"],
    queryFn: fetchHeroImage,
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUploadHeroImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      const res = await apiClient.post<{ data: HeroImageApiResponse }>(
        "/admin/settings/hero-image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return mapHeroImage(res.data.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "hero-image"] });
    },
  });
}

export function useDeleteHeroImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await apiClient.delete<{ data: HeroImageApiResponse }>(
        "/admin/settings/hero-image"
      );
      return mapHeroImage(res.data.data ?? { image_url: null });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", "hero-image"] });
    },
  });
}
