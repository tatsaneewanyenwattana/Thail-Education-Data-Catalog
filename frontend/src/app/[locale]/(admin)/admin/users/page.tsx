"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AdminStatsCard from "@/components/admin/AdminStatsCard";
import UserTable from "@/components/admin/UserTable";
import type { AdminUsersFilters } from "@/types/admin";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";

type StatusFilter = "all" | "pending" | "active" | "rejected" | "suspended";
type RoleFilter = "all" | "agency" | "admin";

function UsersIcon() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3Zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3Zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5Zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5Z" />
    </svg>
  );
}

function HourglassIcon() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6 2v6h.01L6 8.01 10 12l-4 4 0.01 0.01H6V22h12v-5.99h-0.01L18 16l-4-4 4-3.99-0.01-0.01H18V2H6zm10 14.5V20H8v-3.5l4-4 4 4zm-4-7-4-4V4h8v1.5l-4 4z" />
    </svg>
  );
}

function ActiveIcon() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  );
}

function SuspendedIcon() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9A7.902 7.902 0 014 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1A7.902 7.902 0 0120 12c0 4.42-3.58 8-8 8z" />
    </svg>
  );
}

export default function AdminUsersPage() {
  const t = useTranslations("admin.users");
  const tDash = useTranslations("admin.dashboard");
  const locale = useLocale();
  const base = `/${locale}`;

  const { data: dashData } = useAdminDashboard();

  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedStatus, setAppliedStatus] = useState<StatusFilter>("all");
  const [appliedRole, setAppliedRole] = useState<RoleFilter>("all");
  const [page, setPage] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const numberLocale = locale === "th" ? "th-TH" : "en-US";

  const queryFilters: AdminUsersFilters = useMemo(
    () => ({
      search: appliedSearch || undefined,
      status: appliedStatus,
      role: appliedRole,
      page,
    }),
    [appliedSearch, appliedStatus, appliedRole, page]
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const trimmed = value.trim();
      if (trimmed.length >= 1 || trimmed.length === 0) {
        setAppliedSearch(trimmed);
        setPage(1);
      }
    }, 500);
  }, []);

  const clearSearch = () => {
    setSearchInput("");
    setAppliedSearch("");
    setPage(1);
  };

  const handleRoleChange = (v: string) => {
    setAppliedRole(v as RoleFilter);
    setPage(1);
  };

  const handleStatusChange = (v: string) => {
    setAppliedStatus(v as StatusFilter);
    setPage(1);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastError(null);
    window.setTimeout(() => setToastMessage(null), 3000);
  };

  const showError = (message: string) => {
    setToastError(message);
    setToastMessage(null);
    window.setTimeout(() => setToastError(null), 3000);
  };

  return (
    <div className="mx-auto max-w-container-max space-y-6 pb-24">
      <header>
        <h1 className="font-kanit text-[32px] font-bold leading-tight text-[#053F5C]">
          {t("title")}
        </h1>
        <nav className="mt-1 flex font-sarabun text-label text-text-muted">
          <Link href={base} className="hover:text-primary-dark">
            {t("breadcrumbHome")}
          </Link>
          <span className="mx-2">/</span>
          <span className="font-medium text-[#0081A7]">{t("title")}</span>
        </nav>
      </header>

      {dashData ? (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AdminStatsCard
            label={tDash("totalUsers")}
            value={dashData.totalUsers.toLocaleString(numberLocale)}
            icon={<UsersIcon />}
            variant="highlight"
            badge={
              <span className="rounded-radius-sm bg-white/20 px-2.5 py-1 font-sarabun text-caption font-bold text-white">
                +{dashData.userTrendPercent}%
              </span>
            }
          />
          <AdminStatsCard
            label={tDash("pendingUsers")}
            value={dashData.pendingUsers.toLocaleString(numberLocale)}
            icon={<HourglassIcon />}
            gradient={{ from: "#e84e40", to: "#f4a59a", darkText: true }}
            badge={dashData.pendingUsers > 0 ? <span className="h-3 w-3 animate-pulse rounded-full bg-[#e84e40]" /> : undefined}
          />
          <AdminStatsCard
            label={t("activeUsers")}
            value={(dashData.totalUsers - dashData.pendingUsers).toLocaleString(numberLocale)}
            icon={<ActiveIcon />}
            gradient={{ from: "#4a8f4a", to: "#5AA55A" }}
            badge={
              <span className="flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 font-sarabun text-[10px] font-bold text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
                ACTIVE
              </span>
            }
          />
          <AdminStatsCard
            label={t("status.suspended")}
            value="0"
            icon={<SuspendedIcon />}
            iconClassName="bg-gray-100 text-gray-500"
          />
        </section>
      ) : null}

      <section className="rounded-2xl border border-white/80 bg-white p-6 shadow-md">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[280px] flex-1">
            <label className="mb-2 block font-sarabun text-label font-medium text-text-muted">
              {t("search")}
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                <SearchIcon />
              </span>
              <input
                type="text"
                value={searchInput}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder={t("searchPlaceholder")}
                className="h-11 w-full rounded-full border border-gray-200 bg-gray-50 pl-10 pr-10 font-sarabun text-body-md shadow-sm transition-all hover:border-gray-300 focus:border-[#0081A7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0081A7]/20"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-text-muted transition-colors hover:text-[#053F5C]"
                >
                  <ClearIcon />
                </button>
              )}
            </div>
          </div>

          <FilterDropdown
            label={t("filterRole")}
            value={appliedRole}
            onChange={handleRoleChange}
            options={[
              { value: "all", label: t("filterAll") },
              { value: "agency", label: t("role.agency") },
              { value: "admin", label: t("role.admin") },
            ]}
          />

          <FilterDropdown
            label={t("filterStatus")}
            value={appliedStatus}
            onChange={handleStatusChange}
            options={[
              { value: "all", label: t("filterAll") },
              { value: "pending", label: t("status.pending") },
              { value: "active", label: t("status.active") },
              { value: "rejected", label: t("status.rejected") },
              { value: "suspended", label: t("status.suspended") },
            ]}
          />
        </div>
      </section>

      <UserTable
        filters={queryFilters}
        onPageChange={setPage}
        onSuccess={showToast}
        onError={showError}
      />

      {toastMessage ? (
        <div className="fixed bottom-6 right-6 z-[110] rounded-2xl bg-[#053F5C] px-4 py-3 font-sarabun text-label text-white shadow-lg">
          {toastMessage}
        </div>
      ) : null}
      {toastError ? (
        <div className="fixed bottom-6 right-6 z-[110] rounded-2xl bg-status-error px-4 py-3 font-sarabun text-label text-white shadow-lg">
          {toastError}
        </div>
      ) : null}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  );
}

function FilterDropdown({
  value,
  options,
  onChange,
  label,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative w-full sm:w-48" ref={ref}>
      <span className="mb-2 block font-sarabun text-label font-medium text-text-muted">
        {label}
      </span>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 w-full items-center justify-between rounded-full border border-gray-200 bg-gray-50 px-4 font-sarabun text-body-md text-text-primary shadow-sm transition-all hover:border-gray-300 hover:shadow-md"
      >
        {selected?.label ?? "—"}
        <svg className="h-4 w-4 shrink-0 text-gray-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-1.5 w-full overflow-hidden rounded-2xl border border-gray-200 bg-white py-1 shadow-lg">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`flex w-full px-4 py-2.5 font-sarabun text-label transition-colors ${
                opt.value === value
                  ? "bg-[#053F5C]/10 font-bold text-[#053F5C]"
                  : "text-text-primary hover:bg-gray-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
