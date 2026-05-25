"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api";
import type {
  AdminPageEditorContent,
  AdminPageUpdateInput,
  AdminStaticPageMeta,
} from "@/data/mockData";
import {
  mapPageContent,
  mapPageListItem,
  toPageContentUpdateBody,
  type ApiPageContent,
} from "@/utils/pageContentApi";

type PageContentResponse = {
  success: boolean;
  data: ApiPageContent;
};

type PageListResponse = {
  success: boolean;
  data: ApiPageContent[];
};

async function fetchAdminStaticPages(): Promise<AdminStaticPageMeta[]> {
  const res = await apiClient.get<PageListResponse>("/admin/pages");
  return (res.data.data ?? []).map(mapPageListItem);
}

async function fetchAdminPageContent(
  slug: string
): Promise<AdminPageEditorContent | null> {
  try {
    const res = await apiClient.get<PageContentResponse>(
      `/admin/pages/${slug}`
    );
    return mapPageContent(res.data.data);
  } catch (error) {
    const err = error as Error & { code?: string };
    if (err.code === "NOT_FOUND") {
      return null;
    }
    throw error;
  }
}

/** GET /api/v1/admin/pages */
export function useAdminStaticPages() {
  return useQuery({
    queryKey: ["admin", "pages"],
    queryFn: fetchAdminStaticPages,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

/** GET /api/v1/admin/pages/{slug} */
export function useAdminPageContent(slug: string) {
  return useQuery({
    queryKey: ["admin", "pages", slug],
    queryFn: () => fetchAdminPageContent(slug),
    staleTime: 1000 * 60 * 5,
    retry: 1,
    enabled: Boolean(slug),
  });
}

type UpdatePageContentVariables = {
  slug: string;
  data: AdminPageUpdateInput;
};

/** PUT /api/v1/admin/pages/{slug} */
export function useUpdatePageContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ slug, data }: UpdatePageContentVariables) => {
      const res = await apiClient.put<PageContentResponse>(
        `/admin/pages/${slug}`,
        toPageContentUpdateBody(data)
      );
      return mapPageContent(res.data.data);
    },
    onSuccess: (_, { slug }) => {
      queryClient.invalidateQueries({ queryKey: ["pages", slug] });
      queryClient.invalidateQueries({ queryKey: ["admin", "pages", slug] });
      queryClient.invalidateQueries({ queryKey: ["admin", "pages"] });
    },
  });
}
