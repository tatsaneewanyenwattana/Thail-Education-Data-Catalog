"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/services/api";
import type {
  AuditLog,
  AuditLogsFilters,
  AuditLogsResult,
} from "@/data/mockData";
import { mapAuditLog, type ApiAuditLog } from "@/utils/auditLogApi";

const AUDIT_LOGS_PAGE_SIZE = 20;

type AuditLogsListResponse = {
  success: boolean;
  data: ApiAuditLog[];
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
  };
};

function buildQueryParams(filters?: AuditLogsFilters) {
  const params: Record<string, string | number> = {
    page: filters?.page || 1,
    page_size: AUDIT_LOGS_PAGE_SIZE,
    sort: "created_at",
    order: "desc",
  };

  if (filters?.dateFrom) {
    params.date_from = filters.dateFrom;
  }
  if (filters?.dateTo) {
    params.date_to = filters.dateTo;
  }
  if (filters?.action && filters.action !== "all") {
    params.action = filters.action;
  }
  if (filters?.search?.trim()) {
    params.search = filters.search.trim();
  }

  return params;
}

async function fetchAuditLogs(
  filters?: AuditLogsFilters
): Promise<AuditLogsResult> {
  const res = await apiClient.get<AuditLogsListResponse>("/admin/audit-logs", {
    params: buildQueryParams(filters),
  });

  const pagination = res.data.pagination;
  return {
    data: (res.data.data ?? []).map(mapAuditLog),
    total: pagination.total_items,
    page: pagination.page,
    pageSize: pagination.page_size,
    totalPages: pagination.total_pages,
  };
}

async function fetchAuditLogsForExport(
  filters?: Omit<AuditLogsFilters, "page">
): Promise<AuditLog[]> {
  const res = await apiClient.get<AuditLogsListResponse>("/admin/audit-logs", {
    params: { ...buildQueryParams({ ...filters, page: 1 }), page_size: 100 },
  });
  return (res.data.data ?? []).map(mapAuditLog);
}

/** GET /api/v1/admin/audit-logs */
export function useAuditLogs(filters?: AuditLogsFilters) {
  return useQuery({
    queryKey: ["admin", "audit-logs", filters],
    queryFn: () => fetchAuditLogs(filters),
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });
}

/** Client-side CSV export — TODO: GET /admin/audit-logs/export when backend adds it */
export async function exportAuditLogsCsv(
  filters?: Omit<AuditLogsFilters, "page">
): Promise<void> {
  const logs = await fetchAuditLogsForExport(filters);
  const header = "วันที่,Email,Action,รายละเอียด,IP";
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const rows = logs.map(
    (log) =>
      `${escape(log.timestamp)},${escape(log.email)},${escape(log.action)},${escape(log.detail)},${escape(log.ip)}`
  );
  const csv = [header, ...rows].join("\n");
  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}
