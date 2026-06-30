"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api";
import type { Scholarship, ScholarshipStatus } from "@/hooks/useScholarships";

export type ScholarshipFormPayload = {
  title: string;
  description: string;
  scholarship_type: string;
  target_level: string;
  eligibility: string;
  open_date: string;
  close_date: string;
  amount?: number | null;
  amount_note?: string | null;
  application_url?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  status: ScholarshipStatus;
};

type PaginationMeta = {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
};

export type MyScholarshipsResult = {
  items: Scholarship[];
  pagination: PaginationMeta;
};

const STALE_TIME_MS = 30_000;

export function useMyScholarships(
  page = 1,
  status?: string,
  search?: string,
  scholarshipType?: string,
  targetLevel?: string,
) {
  return useQuery<MyScholarshipsResult, Error>({
    queryKey: ["agency", "scholarships", "mine", { page, status, search, scholarshipType, targetLevel }],
    queryFn: async () => {
      const res = await apiClient.get<{
        data: Scholarship[];
        pagination: PaginationMeta;
      }>("/scholarship/mine", {
        params: {
          page,
          page_size: 20,
          status: status || undefined,
          search: search || undefined,
          scholarship_type: scholarshipType || undefined,
          target_level: targetLevel || undefined,
        },
      });

      return {
        items: res.data.data ?? [],
        pagination: res.data.pagination ?? {
          page: 1,
          page_size: 20,
          total_items: 0,
          total_pages: 0,
        },
      };
    },
    staleTime: STALE_TIME_MS,
    retry: 1,
  });
}

export function useMyScholarship(id: string) {
  return useQuery<Scholarship, Error>({
    queryKey: ["agency", "scholarships", "mine", id],
    queryFn: async () => {
      let page = 1;
      let totalPages = 1;

      while (page <= totalPages) {
        const res = await apiClient.get<{
          data: Scholarship[];
          pagination: PaginationMeta;
        }>("/scholarship/mine", {
          params: { page, page_size: 100 },
        });

        const items = res.data.data ?? [];
        const found = items.find((item) => item.id === id);
        if (found) {
          return found;
        }

        totalPages = res.data.pagination?.total_pages ?? 1;
        page += 1;
      }

      throw new Error("Scholarship not found");
    },
    enabled: Boolean(id),
    staleTime: STALE_TIME_MS,
    retry: 0,
  });
}

export function useCreateScholarship() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ScholarshipFormPayload) => {
      const res = await apiClient.post<{ data: Scholarship }>(
        "/scholarship",
        payload
      );
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agency", "scholarships"] });
      queryClient.invalidateQueries({ queryKey: ["scholarships"] });
    },
  });
}

export function useUpdateScholarship() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<ScholarshipFormPayload>;
    }) => {
      const res = await apiClient.patch<{ data: Scholarship }>(
        `/scholarship/${id}`,
        payload
      );
      return res.data.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["agency", "scholarships"] });
      queryClient.invalidateQueries({ queryKey: ["scholarships"] });
      queryClient.invalidateQueries({
        queryKey: ["agency", "scholarships", "mine", variables.id],
      });
    },
  });
}

export function useDeleteScholarship() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/scholarship/${id}`);
    },
    retry: 0,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agency", "scholarships"] });
      queryClient.invalidateQueries({ queryKey: ["scholarships"] });
    },
  });
}
