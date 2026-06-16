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
  delivered: "bg-status-published-bg text-status-published",
  failed: "bg-status-error-bg text-status-error",
  bounced: "bg-status-warning-bg text-status-warning",
  sent: "bg-status-draft-bg text-status-draft",
  pending: "bg-surface-container text-text-muted",
  complained: "bg-red-950 text-white",
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
      className={`inline-flex rounded-radius-full px-3 py-1 font-sarabun text-caption font-semibold ${STATUS_STYLES[status]}`}
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

  return (
    <div className="overflow-hidden rounded-radius-xl border border-border-default bg-surface-card shadow-level-1">
      <div className="overflow-x-auto">
        <table className="min-w-[960px] w-full border-collapse text-left">
          <thead className="bg-surface-container font-sarabun text-label text-text-secondary">
            <tr>
              <th className="px-4 py-3 font-semibold">{t("colTemplate")}</th>
              <th className="px-4 py-3 font-semibold">{t("colEmail")}</th>
              <th className="px-4 py-3 font-semibold">{t("colSubject")}</th>
              <th className="px-4 py-3 font-semibold">{t("colStatus")}</th>
              <th className="px-4 py-3 font-semibold">{t("colSentAt")}</th>
              <th className="px-4 py-3 font-semibold">{t("colCreatedAt")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default/50 font-sarabun text-body-sm text-text-primary">
            {isLoading ? (
              <tr>
                <td className="px-4 py-8 text-center text-text-muted" colSpan={6}>
                  {t("loading")}
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-text-muted" colSpan={6}>
                  {t("empty")}
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log.id}
                  className="transition-colors hover:bg-surface-page"
                >
                  <td className="px-4 py-3">{templateLabel(log.template_name)}</td>
                  <td className="px-4 py-3">{log.recipient_email}</td>
                  <td className="max-w-[280px] truncate px-4 py-3" title={log.subject}>
                    {log.subject}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={log.status} />
                  </td>
                  <td className="px-4 py-3">
                    {formatDateTime(log.sent_at, locale)}
                  </td>
                  <td className="px-4 py-3">
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
