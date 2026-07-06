"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import type { AdminUser, AdminUsersFilters } from "@/types/admin";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { useUnsuspendUser } from "@/hooks/useSuspendUser";
import { useAuthStore } from "@/stores/useAuthStore";
import ApproveUserModal from "./ApproveUserModal";
import ChangeRoleModal from "./ChangeRoleModal";
import DeleteUserModal from "./DeleteUserModal";
import RejectUserModal from "./RejectUserModal";
import SuspendUserModal from "./SuspendUserModal";

type UserTableProps = {
  filters: AdminUsersFilters;
  onPageChange: (page: number) => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
};

function formatDate(date: string, locale: string): string {
  return new Date(date).toLocaleDateString(locale === "th" ? "th-TH" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getPageNumbers(
  current: number,
  total: number
): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 3) {
    return [1, 2, 3, "ellipsis", total];
  }
  if (current >= total - 2) {
    return [1, "ellipsis", total - 2, total - 1, total];
  }
  return [1, "ellipsis", current, "ellipsis", total];
}

function StatusBadge({
  status,
  label,
}: {
  status: AdminUser["status"];
  label: string;
}) {
  const dotColor: Record<AdminUser["status"], string> = {
    pending: "bg-amber-400",
    active: "bg-emerald-500",
    rejected: "bg-red-500",
    suspended: "bg-gray-400",
  };

  return (
    <span className="inline-flex items-center gap-1.5 font-sarabun text-caption font-semibold text-text-primary">
      <span className={`h-2 w-2 rounded-full ${dotColor[status]}`} />
      {label}
    </span>
  );
}

function RoleBadge({ role, label }: { role: AdminUser["role"]; label: string }) {
  const isAdmin = role === "admin";
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 font-sarabun text-[10px] font-bold uppercase ${
        isAdmin
          ? "border-green-200 bg-green-100 text-green-700"
          : "border-blue-200 bg-blue-100 text-blue-700"
      }`}
    >
      {label}
    </span>
  );
}

function TableSkeleton() {
  return (
    <div className="animate-pulse space-y-3 p-6">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="h-12 rounded-radius-sm bg-surface-container" />
      ))}
    </div>
  );
}

export default function UserTable({
  filters,
  onPageChange,
  onSuccess,
  onError,
}: UserTableProps) {
  const t = useTranslations("admin.users");
  const tAdmin = useTranslations("admin");
  const locale = useLocale();
  const currentUser = useAuthStore((s) => s.user);
  const { data, isLoading } = useAdminUsers(filters);
  const unsuspendMutation = useUnsuspendUser();

  const [approveTarget, setApproveTarget] = useState<AdminUser | null>(null);
  const [rejectTarget, setRejectTarget] = useState<AdminUser | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<AdminUser | null>(null);
  const [reasonTarget, setReasonTarget] = useState<AdminUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [changeRoleTarget, setChangeRoleTarget] = useState<AdminUser | null>(null);

  const rows = data?.data ?? [];
  const total = data?.total ?? 0;
  const currentPage = data?.page ?? 1;
  const totalPages = data?.totalPages ?? 1;
  const pageSize = data?.pageSize ?? 5;

  const startItem = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  const handleUnsuspend = async (userId: string) => {
    try {
      await unsuspendMutation.mutateAsync(userId);
      onSuccess(tAdmin("userUnsuspended"));
    } catch {
      onError(t("actionError"));
    }
  };

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-white/80 bg-white shadow-md">
        {isLoading && !data ? (
          <TableSkeleton />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-slate-50 font-sarabun text-[10px] font-bold uppercase tracking-widest text-text-muted">
                    <th className="px-6 py-4">{t("colAgency")}</th>
                    <th className="px-6 py-4">{t("colEmail")}</th>
                    <th className="px-6 py-4">{t("colRole")}</th>
                    <th className="px-6 py-4">{t("colStatus")}</th>
                    <th className="px-6 py-4">{t("colDate")}</th>
                    <th className="px-6 py-4 text-right">{t("colAction")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default/30">
                  {rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-12 text-center font-sarabun text-body-md text-text-muted"
                      >
                        {t("empty")}
                      </td>
                    </tr>
                  ) : (
                    rows.map((user) => {
                      const isMuted =
                        user.status === "suspended" || user.status === "rejected";
                      const agencyName =
                        locale === "th" ? user.agencyName : user.agencyNameEn;

                      return (
                        <tr
                          key={user.id}
                          className={`transition-colors hover:bg-surface-page ${
                            isMuted ? "opacity-60" : ""
                          }`}
                        >
                          <td className="px-6 py-4 font-sarabun text-body-md font-medium text-text-primary">
                            {agencyName}
                          </td>
                          <td className="px-6 py-4 font-sarabun text-label text-text-muted">
                            {user.email}
                          </td>
                          <td className="px-6 py-4">
                            <RoleBadge
                              role={user.role}
                              label={t(`role.${user.role}`)}
                            />
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge
                              status={user.status}
                              label={t(`status.${user.status}`)}
                            />
                          </td>
                          <td className="px-6 py-4 font-sarabun text-label text-text-muted">
                            {formatDate(user.createdAt, locale)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <UserRowActions
                              user={user}
                              currentUserId={currentUser?.id ?? null}
                              onApprove={() => setApproveTarget(user)}
                              onReject={() => setRejectTarget(user)}
                              onSuspend={() => setSuspendTarget(user)}
                              onUnsuspend={() => handleUnsuspend(user.id)}
                              onViewReason={() => setReasonTarget(user)}
                              onDelete={() => setDeleteTarget(user)}
                              onChangeRole={() => setChangeRoleTarget(user)}
                              approveLabel={t("approve")}
                              rejectLabel={t("reject")}
                              suspendLabel={t("suspend")}
                              unsuspendLabel={t("unsuspend")}
                              viewReasonLabel={t("viewReason")}
                              deleteLabel={t("deleteUser")}
                              changeRoleLabel={t("changeRole")}
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 0 ? (
              <div className="flex flex-col gap-4 border-t border-gray-100 bg-gray-50/50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-sarabun text-label text-text-muted">
                  {t("paginationSummary", {
                    start: startItem,
                    end: endItem,
                    total,
                  })}
                </p>
                {totalPages > 1 ? (
                  <UserTablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                  />
                ) : null}
              </div>
            ) : null}
          </>
        )}
      </div>

      <ApproveUserModal
        user={approveTarget}
        open={Boolean(approveTarget)}
        onClose={() => setApproveTarget(null)}
        onSuccess={() => onSuccess(tAdmin("userApproved"))}
        onError={onError}
      />
      <RejectUserModal
        user={rejectTarget}
        open={Boolean(rejectTarget)}
        onClose={() => setRejectTarget(null)}
        onSuccess={() => onSuccess(tAdmin("userRejected"))}
        onError={onError}
      />
      <SuspendUserModal
        user={suspendTarget}
        open={Boolean(suspendTarget)}
        onClose={() => setSuspendTarget(null)}
        onSuccess={() => onSuccess(tAdmin("userSuspended"))}
        onError={onError}
      />
      <DeleteUserModal
        user={deleteTarget}
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onSuccess={() => onSuccess(t("deleteSuccess"))}
        onError={onError}
      />
      <ChangeRoleModal
        user={changeRoleTarget}
        open={Boolean(changeRoleTarget)}
        onClose={() => setChangeRoleTarget(null)}
        onSuccess={() => onSuccess(t("changeRoleSuccess"))}
        onError={onError}
      />

      {reasonTarget ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="absolute inset-0 bg-surface-overlay backdrop-blur-sm"
            onClick={() => setReasonTarget(null)}
            aria-label={t("closeReason")}
          />
          <div className="relative w-full max-w-md rounded-radius-lg bg-surface-card p-6 shadow-level-3">
            <h2 className="mb-2 font-kanit text-heading-3 font-bold text-text-primary">
              {t("rejectReasonTitle")}
            </h2>
            <p className="mb-6 font-sarabun text-body-md text-text-secondary">
              {reasonTarget.rejectReason}
            </p>
            <button
              type="button"
              onClick={() => setReasonTarget(null)}
              className="w-full rounded-radius-lg border border-border-default py-3 font-sarabun text-label font-medium text-text-secondary hover:bg-surface-container"
            >
              {t("closeReason")}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

function UserRowActions({
  user,
  currentUserId,
  onApprove,
  onReject,
  onSuspend,
  onUnsuspend,
  onViewReason,
  onDelete,
  onChangeRole,
  approveLabel,
  rejectLabel,
  suspendLabel,
  unsuspendLabel,
  viewReasonLabel,
  deleteLabel,
  changeRoleLabel,
}: {
  user: AdminUser;
  currentUserId: string | null;
  onApprove: () => void;
  onReject: () => void;
  onSuspend: () => void;
  onUnsuspend: () => void;
  onViewReason: () => void;
  onDelete: () => void;
  onChangeRole: () => void;
  approveLabel: string;
  rejectLabel: string;
  suspendLabel: string;
  unsuspendLabel: string;
  viewReasonLabel: string;
  deleteLabel: string;
  changeRoleLabel: string;
}) {
  const canDelete =
    user.role !== "admin" && Boolean(currentUserId) && user.id !== currentUserId;
  const canChangeRole = Boolean(currentUserId) && user.id !== currentUserId;

  if (user.status === "pending") {
    return (
      <div className="flex flex-wrap justify-end gap-2">
        <ChangeRoleButton
          disabled={!canChangeRole}
          onClick={onChangeRole}
          label={changeRoleLabel}
        />
        <button
          type="button"
          onClick={onApprove}
          className="rounded-full bg-green-600 px-4 py-1.5 font-sarabun text-xs font-bold text-white shadow-sm transition-all hover:bg-green-700 hover:shadow-md"
        >
          {approveLabel}
        </button>
        <button
          type="button"
          onClick={onReject}
          className="rounded-full border border-slate-200 bg-white px-4 py-1.5 font-sarabun text-xs font-bold text-slate-500 transition-all hover:border-red-400 hover:text-red-600"
        >
          {rejectLabel}
        </button>
        <DeleteIconButton
          disabled={!canDelete}
          onClick={onDelete}
          label={deleteLabel}
        />
      </div>
    );
  }

  if (user.status === "active") {
    return (
      <div className="flex flex-wrap justify-end gap-2">
        <ChangeRoleButton
          disabled={!canChangeRole}
          onClick={onChangeRole}
          label={changeRoleLabel}
        />
        <button
          type="button"
          onClick={onSuspend}
          disabled={user.role === "admin"}
          className="rounded-full border border-slate-200 bg-white px-4 py-1.5 font-sarabun text-xs font-bold text-slate-500 transition-all hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {suspendLabel}
        </button>
        <DeleteIconButton
          disabled={!canDelete}
          onClick={onDelete}
          label={deleteLabel}
        />
      </div>
    );
  }

  if (user.status === "suspended") {
    return (
      <div className="flex flex-wrap justify-end gap-2">
        <ChangeRoleButton
          disabled={!canChangeRole}
          onClick={onChangeRole}
          label={changeRoleLabel}
        />
        <button
          type="button"
          onClick={onUnsuspend}
          className="rounded-full bg-blue-50 px-3.5 py-1.5 font-sarabun text-caption font-bold text-blue-700 transition-all hover:bg-blue-100"
        >
          {unsuspendLabel}
        </button>
        <DeleteIconButton
          disabled={!canDelete}
          onClick={onDelete}
          label={deleteLabel}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-end gap-2">
      <ChangeRoleButton
        disabled={!canChangeRole}
        onClick={onChangeRole}
        label={changeRoleLabel}
      />
      <button
        type="button"
        onClick={onViewReason}
        className="font-sarabun text-caption font-medium text-primary-dark hover:underline"
      >
        {viewReasonLabel}
      </button>
      <DeleteIconButton
        disabled={!canDelete}
        onClick={onDelete}
        label={deleteLabel}
      />
    </div>
  );
}

function ChangeRoleButton({
  disabled,
  onClick,
  label,
}: {
  disabled: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-full border border-[#0081A7]/30 bg-white px-4 py-1.5 font-sarabun text-xs font-bold text-[#0081A7] transition-all hover:bg-[#0081A7]/5 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {label}
    </button>
  );
}

function DeleteIconButton({
  disabled,
  onClick,
  label,
}: {
  disabled: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className="inline-flex items-center justify-center rounded-full border border-red-200 bg-red-50 px-2.5 py-1.5 text-caption font-bold text-red-600 transition-all hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <span aria-hidden>🗑️</span>
    </button>
  );
}

function UserTablePagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
}) {
  const t = useTranslations("common");
  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <nav className="flex items-center gap-2" aria-label={t("pagination.page")}>
      <button
        type="button"
        onClick={() => onPageChange?.(currentPage - 1)}
        disabled={currentPage <= 1}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-text-muted shadow-sm transition-all hover:bg-gray-50 hover:shadow-md disabled:opacity-30"
        aria-label={t("pagination.previous")}
      >
        <ChevronLeftIcon />
      </button>
      {pages.map((page, index) =>
        page === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="px-2 font-sarabun text-label text-text-muted"
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange?.(page)}
            className={`flex h-10 w-10 items-center justify-center rounded-full font-sarabun text-label font-bold transition-all ${
              page === currentPage
                ? "bg-[#053F5C] text-white shadow-md"
                : "border border-gray-200 bg-white text-text-muted shadow-sm hover:bg-gray-50 hover:shadow-md"
            }`}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </button>
        )
      )}
      <button
        type="button"
        onClick={() => onPageChange?.(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-text-muted shadow-sm transition-all hover:bg-gray-50 hover:shadow-md disabled:opacity-30"
        aria-label={t("pagination.next")}
      >
        <ChevronRightIcon />
      </button>
    </nav>
  );
}

function ChevronLeftIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}
