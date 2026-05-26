"use client";

import { useQuery } from "@tanstack/react-query";
import { getApiDocsMock, type ApiDocsMock } from "@/data/mockData";
import apiClient from "@/services/api";
import type { ApiPageContent } from "@/utils/pageContentApi";

async function fetchApiDocs(): Promise<ApiDocsMock> {
  const base = getApiDocsMock();
  try {
    const res = await apiClient.get<{ data: ApiPageContent }>(
      "/public/pages/api-docs"
    );
    const page = res.data.data;
    if (!page) return base;

    return {
      ...base,
      titleTh: page.title_th || base.titleTh,
      titleEn: page.title_en || base.titleEn,
      descriptionTh: page.content_th?.trim()
        ? stripHtml(page.content_th).slice(0, 500)
        : base.descriptionTh,
      descriptionEn: page.content_en?.trim()
        ? stripHtml(page.content_en).slice(0, 500)
        : base.descriptionEn,
    };
  } catch {
    return base;
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

/** API docs page — title/description from API, endpoint reference from bundled docs */
export function useApiDocs() {
  return useQuery<ApiDocsMock, Error>({
    queryKey: ["pages", "api-docs"],
    queryFn: fetchApiDocs,
    retry: 1,
    staleTime: 1000 * 60 * 10,
  });
}
