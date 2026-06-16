"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/services/api";

export type EmailLogStatus =
  | "pending"
  | "sent"
  | "delivered"
  | "bounced"
  | "failed"
  | "complained";

export type AdminEmailLogsFilters = {
  status?: EmailLogStatus;
  recipient_email?: string;
  template_name?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
};

export type AdminEmailLog = {
  id: string;
  user_id: string | null;
  template_name: string;
  recipient_email: string;
  subject: string;
  status: EmailLogStatus;
  error_message: string | null;
  retry_count: number;
  provider_message_id: string | null;
  sent_at: string | null;
  delivered_at: string | null;
  created_at: string;
};

export type AdminEmailLogsResult = {
  data: AdminEmailLog[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

type AdminEmailLogsResponse = {
  success: boolean;
  data: AdminEmailLog[];
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
  };
  message: string;
};

function buildQueryParams(filters: AdminEmailLogsFilters) {
  const params: Record<string, string | number> = {
    page: filters.page ?? 1,
    page_size: filters.page_size ?? 20,
  };

  if (filters.status) params.status = filters.status;
  if (filters.recipient_email?.trim()) {
    params.recipient_email = filters.recipient_email.trim();
  }
  if (filters.template_name) params.template_name = filters.template_name;
  if (filters.date_from) params.date_from = filters.date_from;
  if (filters.date_to) params.date_to = filters.date_to;

  return params;
}

async function fetchAdminEmailLogs(
  filters: AdminEmailLogsFilters
): Promise<AdminEmailLogsResult> {
  const res = await apiClient.get<AdminEmailLogsResponse>("/admin/email-logs", {
    params: buildQueryParams(filters),
  });
  const pagination = res.data.pagination;

  return {
    data: res.data.data ?? [],
    page: pagination.page,
    pageSize: pagination.page_size,
    totalItems: pagination.total_items,
    totalPages: pagination.total_pages,
  };
}

export function useAdminEmailLogs(filters: AdminEmailLogsFilters) {
  return useQuery({
    queryKey: ["admin", "email-logs", filters],
    queryFn: () => fetchAdminEmailLogs(filters),
    staleTime: 30 * 1000,
    retry: 1,
  });
}
