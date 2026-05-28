"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { AdminUser } from "@/data/mockData";
import { useChangeUserRole } from "@/hooks/useChangeUserRole";

type ChangeRoleModalProps = {
  user: AdminUser | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
};

export default function ChangeRoleModal({
  user,
  open,
  onClose,
  onSuccess,
  onError,
}: ChangeRoleModalProps) {
  const t = useTranslations("admin.users");
  const changeRoleMutation = useChangeUserRole();
  const [selectedRole, setSelectedRole] = useState<"admin" | "agency">("agency");

  useEffect(() => {
    if (user) {
      setSelectedRole(user.role === "admin" ? "agency" : "admin");
    }
  }, [user]);

  if (!open || !user) {
    return null;
  }

  const handleConfirm = async () => {
    if (selectedRole === user.role) {
      onClose();
      return;
    }

    try {
      await changeRoleMutation.mutateAsync({
        userId: user.id,
        role: selectedRole,
      });
      onClose();
      onSuccess();
    } catch (err) {
      const code = (err as Error & { code?: string }).code;
      if (code === "CANNOT_CHANGE_OWN_ROLE") {
        onError(t("changeRoleOwnError"));
        return;
      }
      if (code === "LAST_ADMIN_ERROR") {
        onError(t("changeRoleLastAdminError"));
        return;
      }
      onError(t("changeRoleError"));
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-role-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-surface-overlay backdrop-blur-sm"
        onClick={onClose}
        aria-label={t("cancel")}
      />
      <div className="relative z-10 w-full max-w-md rounded-radius-lg bg-surface-card p-6 shadow-level-3">
        <h2
          id="change-role-title"
          className="mb-4 font-kanit text-[20px] font-semibold leading-[28px] text-text-primary"
        >
          {t("changeRoleTitle")}
        </h2>

        <div className="mb-4 space-y-2 font-sarabun text-body-md text-text-secondary">
          <p>
            <span className="font-medium text-text-primary">{t("colEmail")}:</span>{" "}
            {user.email}
          </p>
          <p>
            <span className="font-medium text-text-primary">{t("colRole")}:</span>{" "}
            {t(`role.${user.role}`)}
          </p>
        </div>

        <label
          htmlFor="change-role-select"
          className="mb-2 block font-sarabun text-label font-medium text-text-primary"
        >
          {t("changeRoleNewLabel")}
        </label>
        <select
          id="change-role-select"
          value={selectedRole}
          onChange={(event) =>
            setSelectedRole(event.target.value as "admin" | "agency")
          }
          className="mb-4 h-10 w-full rounded-radius-sm border border-border-input bg-surface-card px-3 font-sarabun text-body-md text-text-primary focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="agency">{t("role.agency")}</option>
          <option value="admin">{t("role.admin")}</option>
        </select>

        <p className="mb-6 font-sarabun text-[13px] leading-5 text-[#ba1a1a]">
          {t("changeRoleWarning")}
        </p>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onClose}
            disabled={changeRoleMutation.isPending}
            className="flex-1 rounded-radius-sm border border-border-default py-3 font-sarabun text-label font-medium text-text-secondary hover:bg-surface-container disabled:opacity-50"
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={changeRoleMutation.isPending}
            className="flex-1 rounded-radius-sm bg-primary py-3 font-sarabun text-label font-medium text-white hover:bg-primary-hover disabled:opacity-50"
          >
            {changeRoleMutation.isPending ? t("changeRoleSubmitting") : t("changeRoleConfirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
