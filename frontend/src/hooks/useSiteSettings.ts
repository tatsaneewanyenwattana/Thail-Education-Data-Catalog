"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/services/api";

export type SiteSettings = {
  ribbon_enabled: boolean;
  ribbon_image_url: string;
  grayscale_enabled: boolean;
};

export function useSiteSettings() {
  return useQuery<SiteSettings>({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const res = await apiClient.get<{ data: SiteSettings }>(
        "/public/settings/site"
      );
      return res.data.data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
