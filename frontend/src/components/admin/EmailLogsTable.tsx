"use client";

import { useLocale, useTranslations } from "next-intl";
import type { AdminEmailLog, EmailLogStatus } from "@/hooks/useAdminEmailLogs";

export const EMAIL_LOG_TEMPLATE_OPTIONS = [
  "verify_email",
  "account_approved",
  "account_rejected",
  "account_suspended",
  "account_unsuspended",
  "password_reset",
  "password_changed",
  "account_lockout",
  "new_dataset_notification",
  "admin_new_registration",
] as const;

export type EmailLogTemplateName = (typeof EMAIL_LOG_TEMPLATE_OPTIONS)[number];

export const EMAIL_LOG_STATUS_OPTIONS: EmailLogStatus[] = [
  "pending",
  "sent",
  "delivered",
  "bounced",
  "failed",
  "complained",
];

type EmailLogsTableProps = {
  logs: AdminEmailLog[];
  isLoading: boolean;
};

const STATUS_STYLES: Record<EmailLogStatus, string> = {
  delivered: "bg-emerald-50 text-emerald-700",
  sent: "bg-blue-50 text-blue-700",
  pending: "bg-gray-100 text-gray-600",
  bounced: "bg-amber-50 text-amber-700",
  failed: "bg-red-50 text-red-600",
  complained: "bg-red-50 text-red-600",
};

function formatDateTime(value: string | null, locale: string): string {
  if (!value) return "-";
  return new Intl.DateTimeFormat(locale === "th" ? "th-TH" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function StatusBadge({ status }: { status: EmailLogStatus }) {
  const t = useTranslations("admin.emailLogs.status");

  return (
    <span
      className={`inline-flex rounded-full px-3.5 py-1 font-sarabun text-[12px] font-bold uppercase tracking-wide ${STATUS_STYLES[status]}`}
    >
      {t(status)}
    </span>
  );
}

export default function EmailLogsTable({
  logs,
  isLoading,
}: EmailLogsTableProps) {
  const t = useTranslations("admin.emailLogs");
  const tTemplates = useTranslations("admin.emailLogs.templates");
  const locale = useLocale();

  const templateLabel = (name: string) => {
    if (EMAIL_LOG_TEMPLATE_OPTIONS.includes(name as EmailLogTemplateName)) {
      return tTemplates(name as EmailLogTemplateName);
    }
    return name;
  };

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-white/80 bg-white shadow-md">
        <div className="animate-pulse space-y-3 p-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/80 bg-white shadow-md">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-left">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80 font-kanit text-[13px] font-bold uppercase tracking-wider text-text-secondary">
              <th className="px-6 py-4">{t("colTemplate")}</th>
              <th className="px-6 py-4">{t("colEmail")}</th>
              <th className="px-6 py-4">{t("colSubject")}</th>
              <th className="px-6 py-4">{t("colStatus")}</th>
              <th className="px-6 py-4">{t("colSentAt")}</th>
              <th className="px-6 py-4">{t("colCreatedAt")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/60">
            {logs.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center font-sarabun text-body-md text-text-muted"
                >
                  {t("empty")}
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log.id}
                  className="transition-colors hover:bg-gray-50/50"
                >
                  <td className="px-6 py-4 font-sarabun text-body-md text-text-primary">
                    {templateLabel(log.template_name)}
                  </td>
                  <td className="px-6 py-4 font-sarabun text-body-md text-[#0081A7]">
                    {log.recipient_email}
                  </td>
                  <td
                    className="max-w-[280px] truncate px-6 py-4 font-sarabun text-body-sm text-text-muted"
                    title={log.subject}
                  >
                    {log.subject}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={log.status} />
                  </td>
                  <td className="px-6 py-4 font-sarabun text-body-sm text-text-secondary">
                    {formatDateTime(log.sent_at, locale)}
                  </td>
                  <td className="px-6 py-4 font-sarabun text-body-sm text-text-secondary">
                    {formatDateTime(log.created_at, locale)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
