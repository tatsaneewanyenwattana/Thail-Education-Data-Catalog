"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/services/api";

export type ScholarshipItem = {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  scholarshipType: string;
  status: string;
  openDate: string;
  closeDate: string;
  updatedAt: string;
};

async function fetchAgencyScholarships(): Promise<ScholarshipItem[]> {
  const res = await apiClient.get<{
    data: Array<{
      id: string;
      title: string;
      title_en: string;
      description: string;
      scholarship_type: string;
      status: string;
      open_date: string;
      close_date: string;
      updated_at: string;
    }>;
  }>("/scholarship/mine?status=published&page=1&page_size=6");

  const data = res.data?.data || [];
  return data.map((item) => ({
    id: item.id,
    title: item.title,
    titleEn: item.title_en,
    description: item.description || "",
    scholarshipType: item.scholarship_type || "other",
    status: item.status,
    openDate: item.open_date,
    closeDate: item.close_date,
    updatedAt: item.updated_at,
  }));
}

export function useAgencyScholarships() {
  return useQuery({
    queryKey: ["agency", "scholarships"],
    queryFn: fetchAgencyScholarships,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
