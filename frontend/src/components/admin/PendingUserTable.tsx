"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { AdminPendingUser } from "@/data/mockData";
import { useApproveUser } from "@/hooks/useApproveUser";
import { useRejectUser } from "@/hooks/useRejectUser";

type PendingUserTableProps = {
  users: AdminPendingUser[];
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
};

const rejectSchema = z.object({
  reason: z.string().min(3, "rejectReasonMin"),
});

type RejectFormValues = z.infer<typeof rejectSchema>;

const avatarStyles = [
  "bg-status-draft-bg text-status-draft",
  "bg-primary-light text-primary-dark",
  "bg-status-published-bg text-status-published",
];

function formatDate(date: string, locale: string): string {
  return new Date(date).toLocaleDateString(locale === "th" ? "th-TH" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function PendingUserTable({
  users,
  onSuccess,
  onError,
}: PendingUserTableProps) {
  const t = useTranslations("admin.dashboard");
  const tAdmin = useTranslations("admin");
  const locale = useLocale();
  const base = `/${locale}`;

  const approveMutation = useApproveUser();
  const rejectMutation = useRejectUser();

  const [rejectTarget, setRejectTarget] = useState<AdminPendingUser | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RejectFormValues>({
    resolver: zodResolver(rejectSchema),
    defaultValues: { reason: "" },
  });

  const handleApprove = async (userId: string) => {
    try {
      await approveMutation.mutateAsync(userId);
      onSuccess(tAdmin("userApproved"));
    } catch {
      onError(t("actionError"));
    }
  };

  const handleReject = handleSubmit(async (values) => {
    if (!rejectTarget) return;
    try {
      await rejectMutation.mutateAsync({
        userId: rejectTarget.id,
        reason: values.reason,
      });
      setRejectTarget(null);
      reset();
      onSuccess(tAdmin("userRejected"));
    } catch {
      onError(t("actionError"));
    }
  });

  const openRejectModal = (user: AdminPendingUser) => {
    reset({ reason: "" });
    setRejectTarget(user);
  };

  const closeRejectModal = () => {
    setRejectTarget(null);
    reset({ reason: "" });
  };

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-white/80 bg-white shadow-md">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <h2 className="font-kanit text-heading-3 font-semibold text-text-primary">
            {t("pendingTitle")}
          </h2>
          <Link
            href={`${base}/admin/users`}
            className="flex items-center gap-1 rounded-full bg-primary-dark/5 px-4 py-2 font-sarabun text-label font-medium text-primary-dark transition-colors hover:bg-primary-dark/10"
          >
            {t("viewAll")}
            <ChevronIcon />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80 font-sarabun text-label font-medium text-text-muted">
                <th className="px-6 py-4">{t("agencyColumn")}</th>
                <th className="px-6 py-4">{t("emailColumn")}</th>
                <th className="px-6 py-4">{t("dateColumn")}</th>
                <th className="px-6 py-4 text-right">{t("actionColumn")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default/30">
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-10 text-center font-sarabun text-body-md text-text-muted"
                  >
                    {t("pendingEmpty")}
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr key={user.id} className="transition-colors hover:bg-surface-page">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-kanit text-caption font-bold ${
                            avatarStyles[index % avatarStyles.length]
                          }`}
                        >
                          {user.initials}
                        </div>
                        <span className="font-sarabun text-body-md text-text-primary">
                          {locale === "th" ? user.agencyName : user.agencyNameEn}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-sarabun text-body-md text-text-muted">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 font-sarabun text-body-md text-text-primary">
                      {formatDate(user.createdAt, locale)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleApprove(user.id)}
                          disabled={approveMutation.isPending}
                          className="rounded-full bg-emerald-500 px-4 py-1.5 font-sarabun text-caption font-bold text-white shadow-sm transition-all hover:bg-emerald-600 hover:shadow-md disabled:opacity-50"
                        >
                          {t("approve")}
                        </button>
                        <button
                          type="button"
                          onClick={() => openRejectModal(user)}
                          disabled={rejectMutation.isPending}
                          className="rounded-full border border-gray-300 bg-white px-4 py-1.5 font-sarabun text-caption font-bold text-gray-600 transition-all hover:border-status-error hover:text-status-error disabled:opacity-50"
                        >
                          {t("reject")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {rejectTarget ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reject-user-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-surface-navy/40 backdrop-blur-sm"
            onClick={closeRejectModal}
            aria-label={t("cancelReject")}
          />
          <form
            onSubmit={handleReject}
            className="relative w-full max-w-md rounded-radius-lg bg-surface-card p-6 shadow-level-3"
          >
            <h2
              id="reject-user-title"
              className="mb-2 font-kanit text-heading-3 font-bold text-text-primary"
            >
              {t("rejectModalTitle")}
            </h2>
            <p className="mb-4 font-sarabun text-body-md text-text-muted">
              {t("rejectModalDesc", {
                agency:
                  locale === "th"
                    ? rejectTarget.agencyName
                    : rejectTarget.agencyNameEn,
              })}
            </p>
            <label className="mb-1 block font-sarabun text-label font-medium text-text-secondary">
              {tAdmin("rejectComment")}
            </label>
            <textarea
              {...register("reason")}
              rows={4}
              className="mb-1 w-full rounded-radius-sm border border-border-input px-3 py-2 font-sarabun text-body-md focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-primary-dark/20"
              placeholder={t("rejectReasonPlaceholder")}
            />
            {errors.reason ? (
              <p className="mb-4 font-sarabun text-caption text-status-error">
                {tAdmin("rejectCommentRequired")}
              </p>
            ) : (
              <div className="mb-4" />
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={closeRejectModal}
                disabled={rejectMutation.isPending}
                className="flex-1 rounded-radius-lg border border-border-default py-3 font-sarabun text-label font-medium text-text-secondary hover:bg-surface-container disabled:opacity-50"
              >
                {t("cancelReject")}
              </button>
              <button
                type="submit"
                disabled={rejectMutation.isPending}
                className="flex-1 rounded-radius-lg bg-status-error py-3 font-sarabun text-label font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                {rejectMutation.isPending ? t("rejecting") : t("reject")}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}

function ChevronIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M9.29 6.71 7.88 8.12 12.75 13l-4.87 4.88 1.41 1.41L15.58 13 9.29 6.71Z" />
    </svg>
  );
}
