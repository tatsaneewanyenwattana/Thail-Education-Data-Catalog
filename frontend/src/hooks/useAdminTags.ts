"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdminTagMock,
  deleteAdminTagMock,
  getAdminTagsMock,
  updateAdminTagMock,
  type AdminTag,
} from "@/data/mockData";

async function fetchAdminTags(search?: string): Promise<AdminTag[]> {
  // TODO: GET /api/v1/admin/tags
  await Promise.resolve();
  return getAdminTagsMock(search);
}

export function useAdminTags(search?: string) {
  return useQuery({
    queryKey: ["admin", "tags", search],
    queryFn: () => fetchAdminTags(search),
    staleTime: 1000 * 60 * 5,
    placeholderData: () => getAdminTagsMock(search),
  });
}

async function createTag(name: string): Promise<void> {
  // TODO: POST /api/v1/admin/tags
  await Promise.resolve();
  try {
    createAdminTagMock(name);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("CREATE_FAILED");
  }
}

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tags"] });
    },
  });
}

type UpdateTagVariables = {
  id: string;
  name: string;
};

async function updateTag(variables: UpdateTagVariables): Promise<void> {
  // TODO: PUT /api/v1/admin/tags/{id}
  await Promise.resolve();
  try {
    updateAdminTagMock(variables.id, variables.name);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("UPDATE_FAILED");
  }
}

export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tags"] });
    },
  });
}

async function deleteTag(id: string): Promise<void> {
  // TODO: DELETE /api/v1/admin/tags/{id}
  await Promise.resolve();
  try {
    deleteAdminTagMock(id);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("DELETE_FAILED");
  }
}

export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tags"] });
    },
  });
}
