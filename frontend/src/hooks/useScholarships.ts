"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/services/api";

export type ScholarshipType =
  | "government"
  | "university"
  | "private"
  | "foundation"
  | "exchange"
  | "other";

export type EducationLevel =
  | "high_school"
  | "bachelor"
  | "master"
  | "doctoral"
  | "any";

export type ScholarshipStatus = "draft" | "published";

export type ScholarshipApplicationStatus = "open" | "closed";

export type ScholarshipSource = "agency" | "data_go_th" | "api";

export type Scholarship = {
  id: string;
  created_by: string;
  title: string;
  description: string | null;
  scholarship_type: ScholarshipType;
  target_level: EducationLevel;
  amount: number | null;
  amount_note: string | null;
  eligibility: string;
  application_url: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  open_date: string;
  close_date: string;
  status: ScholarshipStatus;
  source: ScholarshipSource;
  external_id: string | null;
  is_deleted: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  agency_name?: string | null;
};

export type ScholarshipListParams = {
  q?: string;
  scholarship_type?: string;
  target_level?: string;
  application_status?: ScholarshipApplicationStatus;
  updated_within_days?: number;
  current_month_only?: boolean;
  sort?: string;
  order?: "asc" | "desc";
  page?: number;
  page_size?: number;
};

type PaginationMeta = {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
};

export type ScholarshipListResult = {
  items: Scholarship[];
  pagination: PaginationMeta;
};

const STALE_TIME_MS = 30_000;

export function useScholarships(params: ScholarshipListParams) {
  return useQuery<ScholarshipListResult, Error>({
    queryKey: ["scholarships", params],
    queryFn: async () => {
      const res = await apiClient.get<{
        data: Scholarship[];
        pagination: PaginationMeta;
      }>("/scholarship", {
        params: {
          q: params.q || undefined,
          scholarship_type: params.scholarship_type || undefined,
          target_level: params.target_level || undefined,
          application_status: params.application_status || undefined,
          updated_within_days: params.updated_within_days ?? undefined,
          current_month_only: params.current_month_only || undefined,
          sort: params.sort || undefined,
          order: params.order || undefined,
          page: params.page ?? 1,
          page_size: params.page_size ?? 20,
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

export function useScholarship(id: string) {
  return useQuery<Scholarship, Error>({
    queryKey: ["scholarships", id],
    queryFn: async () => {
      const res = await apiClient.get<{ data: Scholarship }>(
        `/scholarship/${id}`
      );
      return res.data.data;
    },
    enabled: Boolean(id),
    staleTime: STALE_TIME_MS,
    retry: 1,
  });
}
