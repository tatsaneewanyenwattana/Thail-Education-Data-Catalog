"use client";

import { useQuery } from "@tanstack/react-query";
import type { PageContentMock } from "@/data/mockData";
import apiClient from "@/services/api";
import {
  mapApiPageToPublicContent,
  type ApiPageContent,
} from "@/utils/pageContentApi";

/** GET /api/v1/public/pages/{slug} — ไม่ต้อง Auth */
export function usePageContent(slug: string) {
  return useQuery<PageContentMock, Error>({
    queryKey: ["pages", slug],
    queryFn: async () => {
      const res = await apiClient.get<{ data: ApiPageContent }>(
        `/public/pages/${slug}`
      );
      return mapApiPageToPublicContent(res.data.data);
    },
    enabled: Boolean(slug),
    retry: 1,
    staleTime: 1000 * 60 * 10,
  });
}
