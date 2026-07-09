"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
  ACTIVITY_LOG_PAGE_SIZE,
  type AgencyActivityLogItem,
  useAgencyActivityLogs,
} from "@/hooks/useAgencyActivityLogs";
import apiClient from "@/services/api";

function getPageNumbers(
  current: number,
  total: number
): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, "ellipsis", total];
  if (current >= total - 2) return [1, "ellipsis", total - 2, total - 1, total];
  return [1, "ellipsis", current, "ellipsis", total];
}

type FilterTab = "all" | "dataset" | "scholarship";

function getFilterTabs(t: ReturnType<typeof useTranslations>): { key: FilterTab; label: string }[] {
  return [
    { key: "all", label: t("filterAll") },
    { key: "dataset", label: t("filterDataset") },
    { key: "scholarship", label: t("filterScholarship") },
  ];
}

function actionStyle(activityType: AgencyActivityLogItem["activityType"]) {
  switch (activityType) {
    case "upload":
      return { dot: "bg-[#43a047]", text: "text-[#43a047]" };
    case "draft":
      return { dot: "bg-[#8e24aa]", text: "text-[#8e24aa]" };
    case "update":
      return { dot: "bg-[#f57c00]", text: "text-[#f57c00]" };
    case "delete":
      return { dot: "bg-status-error", text: "text-status-error" };
    default:
      return { dot: "bg-text-muted", text: "text-text-muted" };
  }
}

function typePillStyle(itemType: AgencyActivityLogItem["itemType"]) {
  return itemType === "scholarship"
    ? "bg-[#fff3e0] text-[#f57c00]"
    : "bg-primary-light text-primary-dark";
}

function mapActivityLabel(
  activityType: AgencyActivityLogItem["activityType"],
  t: ReturnType<typeof useTranslations<"agency.activity">>
) {
  switch (activityType) {
    case "upload":
      return t("actionUpload");
    case "draft":
      return t("actionDraft");
    case "update":
      return t("actionUpdate");
    case "delete":
      return t("actionDelete");
    default:
      return t("actionOther");
  }
}

function mapItemTypeLabel(
  itemType: AgencyActivityLogItem["itemType"],
  t: ReturnType<typeof useTranslations<"agency.activity">>
) {
  return itemType === "scholarship" ? t("typeScholarship") : t("typeDataset");
}

function exportCsv(items: AgencyActivityLogItem[]) {
  const header = "วันที่,เวลา,ประเภท,การดำเนินการ,ชื่อ";
  const rows = items.map((item) => {
    const d = new Date(item.created_at);
    const date = d.toLocaleDateString("th-TH");
    const time = d.toLocaleTimeString("th-TH");
    const type = item.itemType === "scholarship" ? "ทุนการศึกษา" : "ชุดข้อมูล";
    const action = item.activityType;
    const title = (item.title ?? "-").replace(/,/g, " ");
    return `${date},${time},${type},${action},${title}`;
  });
  const csv = "﻿" + [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `activity-log-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

type QuickPreviewTarget = {
  id: string;
  title: string;
  itemType: "dataset" | "scholarship";
};

type DatasetQuickInfo = {
  title: string;
  status: string;
  description: string | null;
  download_count: number;
  view_count: number;
  file_format: string | null;
  files: Array<{ file_name: string; file_format: string; file_size: number }>;
  published_at: string | null;
  agency_name: string | null;
  tag_names: string[];
  quality_score: number | null;
};

type PreviewRow = Record<string, string | number>;

function QuickPreviewModal({
  target,
  onClose,
  locale,
}: {
  target: QuickPreviewTarget;
  onClose: () => void;
  locale: string;
}) {
  const [detail, setDetail] = useState<DatasetQuickInfo | null>(null);
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [previewCols, setPreviewCols] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const isTh = locale === "th";
  const base = `/${locale}`;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    if (target.itemType === "dataset") {
      Promise.all([
        apiClient.get(`/datasets/${target.id}`).then((r) => r.data.data),
        apiClient.get(`/datasets/${target.id}/preview`, { timeout: 15000 }).then((r) => r.data.data).catch(() => null),
      ]).then(([ds, preview]) => {
        if (cancelled) return;
        setDetail(ds);
        if (preview) {
          setPreviewCols(preview.columns?.slice(0, 5) ?? []);
          setPreviewRows(preview.rows?.slice(0, 5) ?? []);
        }
        setLoading(false);
      }).catch(() => !cancelled && setLoading(false));
    } else {
      apiClient.get(`/scholarships/${target.id}`).then((r) => {
        if (cancelled) return;
        setDetail(r.data.data);
        setLoading(false);
      }).catch(() => !cancelled && setLoading(false));
    }

    return () => { cancelled = true; };
  }, [target.id, target.itemType]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const formatSize = (bytes: number) => bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${(bytes / 1024).toFixed(0)} KB`;

  const FORMAT_COLORS: Record<string, { bg: string; text: string }> = {
    csv: { bg: "#e3f2fd", text: "#1565c0" },
    excel: { bg: "#e8f5e9", text: "#2e7d32" },
    json: { bg: "#fff3e0", text: "#e65100" },
    pdf: { bg: "#ffebee", text: "#c62828" },
    sql: { bg: "#e0f2f1", text: "#00695c" },
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} aria-label="ปิด" />
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-border-default/80 bg-white shadow-level-3">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border-default/60 bg-white px-6 py-4">
          <h3 className="font-kanit text-lg font-bold text-[#01579b]">
            {target.itemType === "dataset"
              ? (isTh ? "รายละเอียดชุดข้อมูล" : "Dataset Detail")
              : (isTh ? "รายละเอียดทุนการศึกษา" : "Scholarship Detail")}
          </h3>
          <button type="button" onClick={onClose} className="rounded-full p-1 text-text-muted hover:bg-surface-container">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-5 animate-pulse rounded bg-surface-container" />
              ))}
            </div>
          ) : !detail ? (
            <p className="text-center font-sarabun text-body-md text-text-muted">
              {isTh ? "ไม่พบข้อมูล" : "Not found"}
            </p>
          ) : (
            <div className="space-y-5">
              {/* Title + Status */}
              <div>
                <h4 className="font-kanit text-heading-3-mobile font-bold text-text-primary">{detail.title}</h4>
                {detail.status && (
                  <span className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-sarabun text-caption font-semibold ${
                    detail.status === "published"
                      ? "border border-green-200 bg-green-50 text-green-700"
                      : "border border-amber-200 bg-amber-50 text-amber-700"
                  }`}>
                    <span className={`h-2 w-2 rounded-full ${detail.status === "published" ? "bg-green-500" : "bg-amber-500"}`} />
                    {detail.status === "published" ? (isTh ? "เผยแพร่แล้ว" : "Published") : (isTh ? "ฉบับร่าง" : "Draft")}
                  </span>
                )}
              </div>

              {/* Description */}
              {detail.description && (
                <p className="font-sarabun text-body-md text-text-secondary">
                  {detail.description.length > 200 ? `${detail.description.slice(0, 200)}...` : detail.description}
                </p>
              )}

              {/* Stats grid */}
              {target.itemType === "dataset" && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-border-default/60 bg-surface-container/30 p-3 text-center">
                    <p className="font-kanit text-lg font-bold text-[#01579b]">{(detail.download_count ?? 0).toLocaleString()}</p>
                    <p className="font-sarabun text-caption text-text-muted">{isTh ? "ดาวน์โหลด" : "Downloads"}</p>
                  </div>
                  <div className="rounded-xl border border-border-default/60 bg-surface-container/30 p-3 text-center">
                    <p className="font-kanit text-lg font-bold text-[#01579b]">{(detail.view_count ?? 0).toLocaleString()}</p>
                    <p className="font-sarabun text-caption text-text-muted">{isTh ? "เข้าชม" : "Views"}</p>
                  </div>
                  <div className="rounded-xl border border-border-default/60 bg-surface-container/30 p-3 text-center">
                    <p className="font-kanit text-lg font-bold text-[#01579b]">{detail.quality_score ?? "-"}</p>
                    <p className="font-sarabun text-caption text-text-muted">{isTh ? "คะแนนคุณภาพ" : "Quality"}</p>
                  </div>
                </div>
              )}

              {/* Files */}
              {target.itemType === "dataset" && detail.files && detail.files.length > 0 && (
                <div>
                  <h5 className="mb-2 font-kanit text-label font-bold text-text-primary">
                    {isTh ? `ไฟล์ (${detail.files.length})` : `Files (${detail.files.length})`}
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {detail.files.map((f, i) => {
                      const colors = FORMAT_COLORS[f.file_format] ?? { bg: "#f5f5f5", text: "#616161" };
                      return (
                        <div key={i} className="flex items-center gap-2 rounded-lg border border-border-default px-3 py-1.5">
                          <span className="rounded px-1.5 py-0.5 text-[11px] font-bold uppercase" style={{ backgroundColor: colors.bg, color: colors.text }}>
                            {f.file_format}
                          </span>
                          <span className="font-sarabun text-caption text-text-primary">{f.file_name}</span>
                          <span className="font-sarabun text-caption text-text-muted">({formatSize(f.file_size)})</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tags */}
              {detail.tag_names && detail.tag_names.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {detail.tag_names.map((tag) => (
                    <span key={tag} className="rounded-full bg-primary-light/50 px-3 py-1 font-sarabun text-caption font-medium text-primary-dark">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Preview table (5 rows max) */}
              {previewCols.length > 0 && previewRows.length > 0 && (
                <div>
                  <h5 className="mb-2 font-kanit text-label font-bold text-text-primary">
                    {isTh ? "ตัวอย่างข้อมูล" : "Data preview"}
                  </h5>
                  <div className="overflow-x-auto rounded-lg border border-border-default/60">
                    <table className="w-full text-left font-sarabun text-caption">
                      <thead>
                        <tr className="bg-[#f3f4f5]">
                          {previewCols.map((col) => (
                            <th key={col} className="whitespace-nowrap px-3 py-2 font-semibold text-text-muted">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {previewRows.map((row, ri) => (
                          <tr key={ri} className="hover:bg-gray-50/50">
                            {previewCols.map((col) => (
                              <td key={col} className="whitespace-nowrap px-3 py-1.5 text-text-primary">
                                {row[col] != null ? String(row[col]) : "-"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Action button */}
              <div className="flex justify-end pt-2">
                <Link
                  href={`${base}/datasets/${target.id}/edit`}
                  className="inline-flex items-center gap-2 rounded-full bg-[#01579b] px-5 py-2 font-sarabun text-label font-medium text-white transition-all hover:brightness-110"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  {isTh ? "แก้ไข" : "Edit"}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AgencyActivityPage() {
  const t = useTranslations("agency.activity");
  const locale = useLocale();
  const base = `/${locale}`;
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const [previewTarget, setPreviewTarget] = useState<QuickPreviewTarget | null>(null);
  const itemTypeParam = activeTab === "all" ? undefined : activeTab;
  const { data, isLoading, isError, error } = useAgencyActivityLogs(
    page,
    ACTIVITY_LOG_PAGE_SIZE,
    itemTypeParam,
  );

  const items = data?.items ?? [];
  const pagination = data?.pagination;
  const totalPages = Math.max(1, pagination?.total_pages ?? 1);
  const totalItems = pagination?.total_items ?? 0;
  const currentPage = Math.min(page, totalPages);
  const from =
    totalItems === 0 ? 0 : (currentPage - 1) * ACTIVITY_LOG_PAGE_SIZE + 1;
  const to = Math.min(currentPage * ACTIVITY_LOG_PAGE_SIZE, totalItems);
  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <div className="space-y-6">
      <header
        className="relative overflow-hidden rounded-2xl p-6 lg:p-7"
        style={{ background: "linear-gradient(135deg, #01579b 0%, #0277bd 60%, #0288d1 100%)" }}
      >
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-kanit text-xl font-bold text-white">
              {t("title")}
            </h1>
            <p className="mt-1 font-sarabun text-sm text-white/70">
              {t("subtitle")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => items.length > 0 && exportCsv(items)}
            disabled={items.length === 0}
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 font-sarabun text-label font-medium text-[#01579b] shadow-sm transition-all hover:bg-white/90 active:scale-[0.97] disabled:opacity-50"
          >
            <ExportIcon />
            {t("exportCsv")}
          </button>
        </div>
        <div className="absolute -right-5 -top-5 h-28 w-28 rounded-full bg-white/[0.06]" />
        <div className="absolute right-16 -bottom-8 h-20 w-20 rounded-full bg-white/[0.04]" />
      </header>

      {/* Filter tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {getFilterTabs(t).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setActiveTab(tab.key);
              setPage(1);
            }}
            className={`rounded-full px-5 py-2 font-sarabun text-label font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-[#01579b] text-white shadow-sm"
                : "border border-border-input bg-surface-card text-text-muted hover:bg-surface-container hover:text-text-primary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isError && (
        <div className="rounded-2xl border border-status-error/30 bg-status-error/5 px-4 py-3 font-sarabun text-label text-status-error">
          {error instanceof Error ? error.message : t("loadError")}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border-default/60 bg-surface-card shadow-level-1">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border-default/30 bg-[#f3f4f5] font-sarabun text-[15px] font-bold text-text-muted">
                <th className="px-6 py-4">{t("colDateTime")}</th>
                <th className="px-6 py-4">{t("colType")}</th>
                <th className="px-6 py-4">{t("colAction")}</th>
                <th className="px-6 py-4">{t("colTitle")}</th>
                <th className="px-6 py-4 text-center">{t("colManage")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/60">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-6 py-5">
                      <div className="h-5 animate-pulse rounded-lg bg-surface-container" />
                    </td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td
                    className="px-6 py-12 text-center font-sarabun text-body-md text-text-muted"
                    colSpan={5}
                  >
                    {t("empty")}
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const dateObj = new Date(item.created_at);
                  const dateStr = dateObj.toLocaleDateString(
                    locale === "th" ? "th-TH" : "en-US",
                    { year: "numeric", month: "numeric", day: "numeric" }
                  );
                  const timeStr = dateObj.toLocaleTimeString(
                    locale === "th" ? "th-TH" : "en-US",
                    { hour: "2-digit", minute: "2-digit", second: "2-digit" }
                  );
                  const aStyle = actionStyle(item.activityType);
                  const tPill = typePillStyle(item.itemType);

                  return (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-gray-50/50"
                    >
                      <td className="px-6 py-4">
                        <span className="block font-sarabun text-body-md font-semibold text-text-primary">
                          {dateStr}
                        </span>
                        <span className="font-sarabun text-[11px] text-text-muted">
                          {timeStr}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 font-sarabun text-caption font-semibold ${tPill}`}
                        >
                          {mapItemTypeLabel(item.itemType, t)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-2">
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${aStyle.dot}`}
                          />
                          <span
                            className={`font-sarabun text-body-md font-semibold ${aStyle.text}`}
                          >
                            {mapActivityLabel(item.activityType, t)}
                          </span>
                        </span>
                      </td>
                      <td className="max-w-[300px] px-6 py-4">
                        <span className="block truncate font-sarabun text-body-md text-text-primary">
                          {item.title ?? "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {item.targetId ? (
                            <button
                              type="button"
                              onClick={() => setPreviewTarget({
                                id: item.targetId!,
                                title: item.title ?? "-",
                                itemType: item.itemType,
                              })}
                              className="flex h-7 w-7 items-center justify-center rounded-full text-[#01579b] transition-colors hover:bg-[#e1f5fe]"
                              title={t("viewDetail")}
                            >
                              <EyeIcon />
                            </button>
                          ) : (
                            <span className="flex h-7 w-7 items-center justify-center rounded-full text-text-muted/40">
                              <EyeIcon />
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-sarabun text-label text-text-muted">
            {t("paginationSummary", { from, to, total: totalItems })}
          </p>
          <nav
            className="flex items-center justify-center gap-1 sm:justify-end"
            aria-label={t("pagination")}
          >
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-container disabled:opacity-30"
              aria-label={t("prevPage")}
            >
              <ChevronLeftIcon />
            </button>
            {pages.map((pageNum, index) =>
              pageNum === "ellipsis" ? (
                <span
                  key={`ellipsis-${index}`}
                  className="px-1 font-sarabun text-label text-text-muted"
                >
                  ...
                </span>
              ) : (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setPage(pageNum)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg font-sarabun text-caption font-bold transition-colors ${
                    pageNum === currentPage
                      ? "bg-[#01579b] text-white"
                      : "text-text-primary hover:bg-surface-container"
                  }`}
                  aria-current={pageNum === currentPage ? "page" : undefined}
                >
                  {pageNum}
                </button>
              )
            )}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-container disabled:opacity-30"
              aria-label={t("nextPage")}
            >
              <ChevronRightIcon />
            </button>
          </nav>
        </div>
      )}

      {previewTarget && (
        <QuickPreviewModal
          target={previewTarget}
          onClose={() => setPreviewTarget(null)}
          locale={locale}
        />
      )}
    </div>
  );
}

function ExportIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 9h-4V3H9v6H5l7 7 7-7ZM5 18v2h14v-2H5Z" />
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
    </svg>
  );
}
function ChevronLeftIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12l4.58-4.59z" />
    </svg>
  );
}
function ChevronRightIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
    </svg>
  );
}
