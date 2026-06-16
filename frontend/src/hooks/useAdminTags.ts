"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api";
import type { AdminTag } from "@/data/mockData";

type ApiTag = {
  id: string;
  name: string;
  dataset_count?: number;
};

type TagsListResponse = {
  success: boolean;
  data: ApiTag[];
};

function mapTag(item: ApiTag): AdminTag {
  return {
    id: String(item.id),
    name: item.name,
    datasetCount: item.dataset_count ?? 0,
  };
}

type FetchAdminTagsOptions = {
  search?: string;
  usedOnly?: boolean;
};

async function fetchAdminTags(
  options?: FetchAdminTagsOptions
): Promise<AdminTag[]> {
  const res = await apiClient.get<TagsListResponse>("/admin/tags");
  let tags = (res.data.data ?? []).map(mapTag);

  if (options?.usedOnly) {
    tags = tags.filter((tag) => tag.datasetCount > 0);
  }

  if (options?.search?.trim()) {
    const keyword = options.search.trim().toLowerCase();
    tags = tags.filter((tag) => tag.name.toLowerCase().includes(keyword));
  }

  return tags;
}

/** GET /api/v1/admin/tags — read-only overview with dataset counts */
export function useAdminTags(search?: string, usedOnly = false) {
  return useQuery({
    queryKey: ["admin", "tags", search, usedOnly],
    queryFn: () => fetchAdminTags({ search, usedOnly }),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

async function createTag(name: string): Promise<void> {
  await apiClient.post("/admin/tags", { name });
}

/** POST /api/v1/admin/tags */
export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tags"] });
      queryClient.invalidateQueries({ queryKey: ["search", "filters"] });
    },
  });
}

export const useAdminCreateTag = useCreateTag;

type UpdateTagVariables = {
  id: string;
  name: string;
};

async function updateTag(variables: UpdateTagVariables): Promise<void> {
  await apiClient.patch(`/admin/tags/${variables.id}`, { name: variables.name });
}

/** PATCH /api/v1/admin/tags/{id} */
export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tags"] });
    },
  });
}

export const useAdminUpdateTag = useUpdateTag;

async function deleteTag(id: string): Promise<void> {
  await apiClient.delete(`/admin/tags/${id}`);
}

/** DELETE /api/v1/admin/tags/{id} */
export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTag,
    retry: 0,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tags"] });
    },
  });
}

export const useAdminDeleteTag = useDeleteTag;
