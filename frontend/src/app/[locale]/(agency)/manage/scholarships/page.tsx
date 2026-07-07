"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import type { Scholarship } from "@/hooks/useScholarships";
import {
  useDeleteScholarship,
  useMyScholarships,
} from "@/hooks/useManageScholarships";
import { toast } from "@/stores/toastStore";
import { useEffect } from "react";

function formatDate(value: string, locale: string): string {
  return new Date(value).toLocaleDateString(
    locale === "th" ? "th-TH" : "en-US",
    { year: "numeric", month: "short", day: "numeric" }
  );
}

function StatusBadge({
  status,
  publishedLabel,
  draftLabel,
}: {
  status: Scholarship["status"];
  publishedLabel: string;
  draftLabel: string;
}) {
  if (status === "published") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-status-published-bg px-3 py-1 font-sarabun text-caption font-semibold text-status-published">
        <span className="h-2 w-2 rounded-full bg-status-published" />
        {publishedLabel}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-status-draft-bg px-3 py-1 font-sarabun text-caption font-semibold text-status-draft">
      <span className="h-2 w-2 rounded-full bg-status-draft" />
      {draftLabel}
    </span>
  );
}

function TypePill({ label }: { label: string }) {
  return (
    <span className="inline-flex max-w-[120px] truncate rounded-full bg-primary-light px-3 py-1 font-sarabun text-caption font-medium text-primary-dark">
      {label}
    </span>
  );
}

function LevelPill({ label }: { label: string }) {
  return (
    <span className="inline-flex max-w-[120px] truncate rounded-full bg-[#f3e5f5] px-3 py-1 font-sarabun text-caption font-medium text-[#8e24aa]">
      {label}
    </span>
  );
}

function DeleteScholarshipDialog({
  open,
  title,
  onClose,
  onConfirm,
  isDeleting,
  confirmTitle,
  confirmMsg,
  cancelLabel,
  confirmLabel,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  confirmTitle: string;
  confirmMsg: string;
  cancelLabel: string;
  confirmLabel: string;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="absolute inset-0 bg-surface-navy/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label={cancelLabel}
      />
      <div className="relative w-full max-w-md rounded-2xl bg-surface-card p-6 shadow-level-3">
        <h2 className="mb-2 font-kanit text-heading-3 font-bold text-text-primary">
          {confirmTitle}
        </h2>
        <p className="mb-6 font-sarabun text-body-md text-text-secondary">
          {confirmMsg}
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-border-input px-4 py-2.5 font-sarabun text-label font-medium text-text-primary transition-colors hover:bg-surface-container"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 rounded-xl bg-status-error px-4 py-2.5 font-sarabun text-label font-semibold text-white disabled:opacity-60"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function getPageNumbers(
  current: number,
  total: number
): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, "ellipsis", total];
  if (current >= total - 2) return [1, "ellipsis", total - 2, total - 1, total];
  return [1, "ellipsis", current, "ellipsis", total];
}

export default function ManageScholarshipsPage() {
  const locale = useLocale();
  const base = `/${locale}`;
  const t = useTranslations("scholarship");
  const tManage = useTranslations("scholarship.manage");
  const tTypes = useTranslations("scholarship.types");
  const tLevels = useTranslations("scholarship.levels");
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Scholarship | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading, isError } = useMyScholarships(
    page,
    filterStatus || undefined,
    debouncedSearch || undefined,
    filterType || undefined,
    filterLevel || undefined,
  );
  const deleteMutation = useDeleteScholarship();

  const items = data?.items ?? [];
  const pagination = data?.pagination;
  const totalPages = Math.max(1, pagination?.total_pages ?? 1);
  const totalItems = pagination?.total_items ?? items.length;
  const pageSize = 20;
  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success(tManage("deleteSuccess"));
      setDeleteTarget(null);
    } catch {
      toast.error(tManage("deleteError"));
    }
  };

  const pages = getPageNumbers(page, totalPages);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-2 font-sarabun text-caption uppercase tracking-wider text-text-muted">
        <Link href={`${base}/dashboard`} className="hover:text-primary-dark">
          Dashboard
        </Link>
        <span>›</span>
        <span className="font-semibold text-text-primary">
          Manage Scholarships
        </span>
      </nav>

      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <h1 className="font-kanit text-[28px] font-bold text-text-primary">
            {tManage("title")}
          </h1>
          <p className="mt-1 font-sarabun text-body-md text-text-muted">
            {tManage("subtitle")}
          </p>
        </div>
        <Link
          href={`${base}/manage/scholarships/new`}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0d5302] px-6 py-2.5 font-sarabun text-label font-medium text-white shadow-level-1 transition-opacity hover:opacity-90"
        >
          <PlusIcon />
          {tManage("createNew")}
        </Link>
      </header>

      {/* Summary card */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          icon={<ScholarshipIcon />}
          iconBg="bg-primary-light"
          iconColor="text-primary-dark"
          label="ทุนทั้งหมด"
          value={`${totalItems} ทุน`}
        />
        <StatCard
          icon={<PublishIcon />}
          iconBg="bg-[#e8f5e9]"
          iconColor="text-[#43a047]"
          label="เผยแพร่แล้ว"
          value={`${items.filter((s) => s.status === "published").length} ทุน`}
        />
      </div>

      {/* Table section */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="font-kanit text-heading-3-mobile font-bold text-text-primary">
            รายการทุนการศึกษา
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่อทุน..."
                className="h-10 w-full rounded-xl border border-border-input bg-surface-card pl-10 pr-4 font-sarabun text-body-md text-text-primary placeholder:text-text-muted focus:border-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-dark/20 md:w-[220px]"
              />
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                <SearchIcon />
              </span>
            </div>
            <select
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
              className="h-10 rounded-xl border border-border-input bg-surface-card px-3 font-sarabun text-label text-text-muted focus:border-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-dark/20"
            >
              <option value="">ประเภททุน</option>
              <option value="government">{tTypes("government")}</option>
              <option value="university">{tTypes("university")}</option>
              <option value="private">{tTypes("private")}</option>
              <option value="foundation">{tTypes("foundation")}</option>
              <option value="exchange">{tTypes("exchange")}</option>
              <option value="other">{tTypes("other")}</option>
            </select>
            <select
              value={filterLevel}
              onChange={(e) => { setFilterLevel(e.target.value); setPage(1); }}
              className="h-10 rounded-xl border border-border-input bg-surface-card px-3 font-sarabun text-label text-text-muted focus:border-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-dark/20"
            >
              <option value="">ระดับ</option>
              <option value="high_school">{tLevels("high_school")}</option>
              <option value="bachelor">{tLevels("bachelor")}</option>
              <option value="master">{tLevels("master")}</option>
              <option value="doctoral">{tLevels("doctoral")}</option>
              <option value="any">{tLevels("any")}</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              className="h-10 rounded-xl border border-border-input bg-surface-card px-3 font-sarabun text-label text-text-muted focus:border-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-dark/20"
            >
              <option value="">สถานะ</option>
              <option value="published">{t("common.statusPublished")}</option>
              <option value="draft">{t("common.statusDraft")}</option>
            </select>
          </div>
        </div>

        {isLoading && (
          <div className="animate-pulse space-y-3 rounded-2xl border border-border-default/60 bg-surface-card p-6 shadow-level-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-surface-container" />
            ))}
          </div>
        )}

        {isError && (
          <div className="rounded-2xl border border-status-error/30 bg-status-error/5 px-6 py-8 text-center">
            <p className="font-sarabun text-body-md text-status-error">
              {tManage("loadError")}
            </p>
          </div>
        )}

        {!isLoading && !isError && items.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border-default/60 bg-surface-card px-6 py-16 text-center shadow-level-1">
            <p className="font-sarabun text-body-lg text-text-secondary">
              {tManage("empty")}
            </p>
          </div>
        )}

        {!isLoading && !isError && items.length > 0 && (
          <>
            <div className="overflow-hidden rounded-2xl border border-border-default/60 bg-surface-card shadow-level-1">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-border-default/30 bg-[#f3f4f5] font-sarabun text-[15px] font-bold text-text-muted">
                      <th className="px-6 py-4">{tManage("colTitle")}</th>
                      <th className="px-6 py-4">{tManage("colType")}</th>
                      <th className="px-6 py-4">{tManage("colLevel")}</th>
                      <th className="px-6 py-4">{tManage("colStatus")}</th>
                      <th className="px-6 py-4">{tManage("colCloseDate")}</th>
                      <th className="px-6 py-4 text-center">
                        {tManage("colActions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100/60">
                    {items.map((scholarship) => (
                      <tr
                        key={scholarship.id}
                        className="transition-colors hover:bg-gray-50/50"
                      >
                        <td className="px-6 py-4">
                          <div className="min-w-0">
                            <span className="block font-sarabun text-body-md font-semibold text-text-primary">
                              {scholarship.title}
                            </span>
                            <span className="font-sarabun text-[11px] text-text-muted">
                              ID: {scholarship.id}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <TypePill
                            label={tTypes(scholarship.scholarship_type)}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <LevelPill
                            label={tLevels(scholarship.target_level)}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge
                            status={scholarship.status}
                            publishedLabel={t("common.statusPublished")}
                            draftLabel={t("common.statusDraft")}
                          />
                        </td>
                        <td className="px-6 py-4 font-sarabun text-body-md text-text-muted">
                          {formatDate(scholarship.close_date, locale)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              href={`${base}/manage/scholarships/${scholarship.id}/edit`}
                              className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-container hover:text-primary-dark"
                              aria-label={tManage("edit")}
                              title={tManage("edit")}
                            >
                              <EditIcon />
                            </Link>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(scholarship)}
                              className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-[#ffdad6] hover:text-status-error"
                              aria-label={tManage("delete")}
                              title={tManage("delete")}
                            >
                              <DeleteIcon />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-4 px-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-sarabun text-label text-text-muted">
                Showing {from} to {to} of {totalItems} scholarships
              </p>
              {totalPages > 1 && (
                <nav className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPage((v) => Math.max(1, v - 1))}
                    disabled={page <= 1}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-input text-text-muted transition-colors hover:bg-surface-container disabled:opacity-40"
                  >
                    <ChevronLeftIcon />
                  </button>
                  {pages.map((p, i) =>
                    p === "ellipsis" ? (
                      <span
                        key={`e-${i}`}
                        className="px-2 font-sarabun text-label text-text-muted"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPage(p)}
                        className={`flex h-10 w-10 items-center justify-center rounded-xl font-sarabun text-label font-bold transition-colors ${
                          p === page
                            ? "bg-[#0d5302] text-white shadow-level-1"
                            : "border border-border-input text-text-primary hover:bg-surface-container"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                  <button
                    type="button"
                    onClick={() => setPage((v) => Math.min(totalPages, v + 1))}
                    disabled={page >= totalPages}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-input text-text-muted transition-colors hover:bg-surface-container disabled:opacity-40"
                  >
                    <ChevronRightIcon />
                  </button>
                </nav>
              )}
            </div>
          </>
        )}
      </div>

      <DeleteScholarshipDialog
        open={Boolean(deleteTarget)}
        title={deleteTarget?.title ?? ""}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
        isDeleting={deleteMutation.isPending}
        confirmTitle={tManage("confirmTitle")}
        confirmMsg={tManage("confirmMsg", { title: deleteTarget?.title ?? "" })}
        cancelLabel={tManage("cancel")}
        confirmLabel={tManage("confirm")}
      />
    </div>
  );
}

function StatCard({
  icon,
  iconBg,
  iconColor,
  label,
  value,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border-default/60 bg-surface-card px-6 py-5 shadow-level-1">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-full ${iconBg} ${iconColor}`}
      >
        {icon}
      </div>
      <div>
        <p className="font-sarabun text-caption text-text-muted">{label}</p>
        <p className="font-kanit text-heading-3-mobile font-bold text-text-primary">
          {value}
        </p>
      </div>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}
function FilterIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M10 18h4v-2h-4v2ZM3 6v2h18V6H3Zm3 7h12v-2H6v2Z" />
    </svg>
  );
}
function EditIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
    </svg>
  );
}
function DeleteIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
    </svg>
  );
}
function ScholarshipIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3 1 9l11 6 9-4.91V17h2V9L12 3z" />
    </svg>
  );
}
function PublishIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
    </svg>
  );
}
function DraftIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
    </svg>
  );
}
function PeopleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
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
