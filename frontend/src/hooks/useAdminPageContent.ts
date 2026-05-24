"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminPageContentMock,
  getAdminStaticPagesMock,
  updateAdminPageContentMock,
  type AdminPageEditorContent,
  type AdminPageUpdateInput,
  type AdminStaticPageMeta,
} from "@/data/mockData";

async function fetchAdminStaticPages(): Promise<AdminStaticPageMeta[]> {
  // TODO: GET /api/v1/admin/pages
  await Promise.resolve();
  return getAdminStaticPagesMock();
}

async function fetchAdminPageContent(
  slug: string
): Promise<AdminPageEditorContent | null> {
  // TODO: GET /api/v1/admin/pages/{slug}
  await Promise.resolve();
  return getAdminPageContentMock(slug);
}

export function useAdminStaticPages() {
  return useQuery({
    queryKey: ["admin", "pages"],
    queryFn: fetchAdminStaticPages,
    staleTime: 1000 * 60 * 5,
    placeholderData: () => getAdminStaticPagesMock(),
  });
}

export function useAdminPageContent(slug: string) {
  return useQuery({
    queryKey: ["admin", "pages", slug],
    queryFn: () => fetchAdminPageContent(slug),
    staleTime: 1000 * 60 * 5,
    placeholderData: () => getAdminPageContentMock(slug) ?? undefined,
    enabled: Boolean(slug),
  });
}

type UpdatePageContentVariables = {
  slug: string;
  data: AdminPageUpdateInput;
};

export function useUpdatePageContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ slug, data }: UpdatePageContentVariables) => {
      // TODO: PUT /api/v1/admin/pages/{slug}
      await Promise.resolve();
      return updateAdminPageContentMock(slug, data);
    },
    onSuccess: (_, { slug }) => {
      queryClient.invalidateQueries({ queryKey: ["pages", slug] });
      queryClient.invalidateQueries({ queryKey: ["admin", "pages", slug] });
      queryClient.invalidateQueries({ queryKey: ["admin", "pages"] });
    },
  });
}
