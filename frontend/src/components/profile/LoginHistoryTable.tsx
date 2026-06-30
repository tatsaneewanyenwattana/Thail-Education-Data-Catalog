"use client";

import type {
  LoginHistoryItem,
  LoginHistoryResult,
} from "@/hooks/useLoginHistory";
import { useLoginHistory } from "@/hooks/useLoginHistory";

const RESULT_STYLES: Record<LoginHistoryResult, string> = {
  success: "bg-status-published-bg text-status-published",
  fail: "bg-status-error-bg text-status-error",
};

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function ResultBadge({ result }: { result: LoginHistoryResult }) {
  return (
    <span
      className={`inline-flex rounded-radius-full px-3 py-1 font-sarabun text-caption font-semibold ${RESULT_STYLES[result]}`}
    >
      {result === "success" ? "success" : "fail"}
    </span>
  );
}

function LoginHistoryRow({ item }: { item: LoginHistoryItem }) {
  return (
    <tr className="transition-colors hover:bg-surface-page">
      <td className="px-4 py-3">{formatDateTime(item.timestamp)}</td>
      <td className="px-4 py-3 font-mono text-code">{item.ip_address}</td>
      <td className="max-w-[360px] truncate px-4 py-3">
        {item.user_agent ?? "-"}
      </td>
      <td className="px-4 py-3">
        <ResultBadge result={item.result} />
      </td>
    </tr>
  );
}

export default function LoginHistoryTable() {
  const { data: history = [], isLoading, isError } = useLoginHistory();

  if (isError) {
    return (
      <p className="rounded-radius-md border border-status-error bg-status-error-bg px-4 py-3 font-sarabun text-body-md text-status-error">
        โหลดประวัติการเข้าสู่ระบบไม่สำเร็จ
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-radius-lg border border-border-default bg-surface-card shadow-level-1">
      <div className="overflow-x-auto">
        <table className="min-w-[760px] w-full border-collapse text-left">
          <thead className="bg-surface-container font-sarabun text-label text-text-secondary">
            <tr>
              <th className="px-4 py-3 font-semibold">วันเวลา</th>
              <th className="px-4 py-3 font-semibold">ที่อยู่ IP</th>
              <th className="px-4 py-3 font-semibold">Browser</th>
              <th className="px-4 py-3 font-semibold">ผลลัพธ์</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default/50 font-sarabun text-body-sm text-text-primary">
            {isLoading ? (
              <tr>
                <td className="px-4 py-8 text-center text-text-muted" colSpan={4}>
                  กำลังโหลดประวัติการเข้าสู่ระบบ...
                </td>
              </tr>
            ) : history.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-text-muted" colSpan={4}>
                  ยังไม่มีประวัติการเข้าสู่ระบบ
                </td>
              </tr>
            ) : (
              history.map((item) => (
                <LoginHistoryRow key={item.id} item={item} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
