"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import type { AdminUser, AdminUsersFilters } from "@/data/mockData";
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
  const styles: Record<AdminUser["status"], string> = {
    pending: "bg-status-warning-bg text-status-warning",
    active: "bg-status-published-bg text-status-published",
    rejected: "bg-status-error-bg text-status-error",
    suspended: "bg-surface-container text-text-secondary",
  };

  return (
    <span
      className={`inline-flex rounded-radius-full px-2.5 py-1 font-sarabun text-caption font-semibold ${styles[status]}`}
    >
      {label}
    </span>
  );
}

function RoleBadge({ role, label }: { role: AdminUser["role"]; label: string }) {
  const isAdmin = role === "admin";
  return (
    <span
      className={`inline-flex rounded-radius-full px-2.5 py-1 font-sarabun text-caption font-semibold ${
        isAdmin
          ? "bg-status-published-bg text-status-published"
          : "bg-status-draft-bg text-status-draft"
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
      <div className="overflow-hidden rounded-radius-lg border border-border-default bg-surface-card shadow-level-1">
        {isLoading && !data ? (
          <TableSkeleton />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead className="bg-surface-container">
                  <tr className="font-sarabun text-caption font-semibold uppercase tracking-wide text-text-muted">
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
              <div className="flex flex-col gap-4 border-t border-border-default/30 bg-surface-container/50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
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
          className="rounded-radius-sm bg-primary-light px-3 py-1.5 font-sarabun text-caption font-bold text-status-published hover:opacity-90"
        >
          {approveLabel}
        </button>
        <button
          type="button"
          onClick={onReject}
          className="rounded-radius-sm bg-status-error-bg px-3 py-1.5 font-sarabun text-caption font-bold text-status-error hover:opacity-90"
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
          className="rounded-radius-sm bg-surface-container px-3 py-1.5 font-sarabun text-caption font-bold text-text-secondary transition-colors hover:bg-surface-page disabled:cursor-not-allowed disabled:opacity-40"
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
          className="rounded-radius-sm bg-status-draft-bg px-3 py-1.5 font-sarabun text-caption font-bold text-status-draft transition-colors hover:opacity-90"
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
      className="rounded-radius-sm border border-primary-action px-3 py-1.5 font-sarabun text-caption font-bold text-primary-action transition-colors hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-40"
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
      className="inline-flex items-center justify-center rounded-radius-sm border border-status-error bg-status-error px-2 py-1.5 text-caption font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
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
        className="flex h-10 w-10 items-center justify-center rounded-radius-md border border-border-default bg-surface-card text-text-muted transition-colors hover:bg-surface-container disabled:opacity-30"
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
            className={`flex h-10 w-10 items-center justify-center rounded-radius-sm font-sarabun text-label font-bold transition-colors ${
              page === currentPage
                ? "bg-primary-dark text-white shadow-level-1"
                : "border border-border-default bg-surface-card text-text-muted hover:bg-surface-container"
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
        className="flex h-10 w-10 items-center justify-center rounded-radius-md border border-border-default bg-surface-card text-text-muted transition-colors hover:bg-surface-container disabled:opacity-30"
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
