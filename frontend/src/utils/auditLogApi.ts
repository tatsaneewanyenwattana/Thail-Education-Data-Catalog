import type { AuditLog, AuditLogAction } from "@/data/mockData";

export type ApiAuditLog = {
  id: string;
  user_id: string | null;
  email: string | null;
  action: string;
  target_type: string;
  target_id: string | null;
  detail: Record<string, unknown> | null;
  ip_address: string;
  created_at: string;
};

export function mapActionToUi(action: string): AuditLogAction {
  const value = action.toLowerCase();
  if (value.includes("login")) return "LOGIN";
  if (value.includes("upload")) return "UPLOAD";
  if (value.includes("download")) return "DOWNLOAD";
  if (value.includes("delete")) return "DELETE";
  if (value.includes("approve")) return "APPROVE";
  if (value.includes("reject")) return "REJECT";
  return "LOGIN";
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function formatAuditDetail(log: ApiAuditLog): string {
  if (log.detail && Object.keys(log.detail).length > 0) {
    return Object.entries(log.detail)
      .map(([key, value]) => `${key}: ${String(value)}`)
      .join(", ");
  }
  if (log.target_type && log.target_id) {
    return `${log.target_type} (${log.target_id})`;
  }
  return "—";
}

export function mapAuditLog(item: ApiAuditLog): AuditLog {
  return {
    id: String(item.id),
    timestamp: formatTimestamp(item.created_at),
    email: item.email?.trim() || "—",
    action: mapActionToUi(item.action),
    detail: formatAuditDetail(item),
    ip: item.ip_address,
  };
}
