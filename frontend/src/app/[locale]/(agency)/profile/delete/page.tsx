"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import apiClient from "@/services/api";
import { useAuthStore } from "@/stores/useAuthStore";

const DELETE_CONFIRM_TEXT = "ลบบัญชี";

type DeleteAccountValues = {
  password: string;
  confirm_text: string;
  confirm_checkbox: boolean;
};

function getErrorCode(error: unknown): string | undefined {
  if (error instanceof Error && "code" in error) {
    return (error as Error & { code?: string }).code;
  }
  return undefined;
}

export default function DeleteAccountPage() {
  const t = useTranslations("agency.profileDelete");
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || "th";
  const base = `/${locale}`;
  const logout = useAuthStore((state) => state.logout);

  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const deleteAccountSchema = useMemo(
    () =>
      z.object({
        password: z.string().min(1, t("passwordRequired")),
        confirm_text: z
          .string()
          .min(1, t("confirmTextRequired"))
          .refine((value) => value === DELETE_CONFIRM_TEXT, {
            message: t("confirmTextInvalid"),
          }),
        confirm_checkbox: z.boolean().refine((value) => value === true, {
          message: t("confirmCheckboxRequired"),
        }),
      }),
    [t]
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<DeleteAccountValues>({
    resolver: zodResolver(deleteAccountSchema),
    mode: "onChange",
    defaultValues: {
      password: "",
      confirm_text: "",
      confirm_checkbox: false,
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: DeleteAccountValues) => {
      await apiClient.delete("/auth/me", {
        data: {
          password: values.password,
          confirm_text: values.confirm_text,
          confirm_checkbox: values.confirm_checkbox,
        },
      });
    },
    onSuccess: () => {
      logout();
      setToast({ type: "success", message: t("successToast") });
      window.setTimeout(() => {
        router.push(base);
      }, 1500);
    },
    onError: (error: Error) => {
      const code = getErrorCode(error);
      if (code === "AUTH_INVALID_CREDENTIALS") {
        setToast({ type: "error", message: t("invalidPassword") });
        return;
      }
      setToast({
        type: "error",
        message: error.message || t("errorDefault"),
      });
    },
  });

  const onSubmit = (values: DeleteAccountValues) => {
    setToast(null);
    mutation.mutate(values);
  };

  const inputClass = (hasError: boolean) =>
    `h-10 w-full rounded-radius-sm border bg-surface-card px-3 font-sarabun text-body-md text-text-primary placeholder:text-text-muted focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-primary-dark/20 ${
      hasError ? "border-status-error" : "border-border-input"
    }`;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="font-kanit text-[28px] font-bold text-text-primary">
          {t("title")}
        </h1>
        <p className="mt-1 font-sarabun text-body-md text-text-muted">
          {t("subtitle")}
        </p>
      </header>

      <section className="rounded-radius-lg border border-status-error/30 bg-status-error-bg/30 p-6 shadow-level-1 sm:p-8">
        <p className="font-sarabun text-body-md text-text-primary">
          {t("warning")}
        </p>
      </section>

      <section className="rounded-radius-lg border border-border-default bg-surface-card p-6 shadow-level-1 sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          <div>
            <label
              htmlFor="password"
              className="mb-2 block font-sarabun text-label text-text-secondary"
            >
              {t("passwordLabel")}
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className={inputClass(!!errors.password)}
              {...register("password")}
            />
            {errors.password && (
              <p className="mt-1 font-sarabun text-caption text-status-error">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirm_text"
              className="mb-2 block font-sarabun text-label text-text-secondary"
            >
              {t("confirmTextLabel", { text: DELETE_CONFIRM_TEXT })}
            </label>
            <input
              id="confirm_text"
              type="text"
              autoComplete="off"
              placeholder={DELETE_CONFIRM_TEXT}
              className={inputClass(!!errors.confirm_text)}
              {...register("confirm_text")}
            />
            {errors.confirm_text && (
              <p className="mt-1 font-sarabun text-caption text-status-error">
                {errors.confirm_text.message}
              </p>
            )}
          </div>

          <div>
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded-radius-sm border-border-input text-primary focus:ring-primary-dark/20"
                {...register("confirm_checkbox")}
              />
              <span className="font-sarabun text-body-md text-text-primary">
                {t("confirmCheckboxLabel")}
              </span>
            </label>
            {errors.confirm_checkbox && (
              <p className="mt-1 font-sarabun text-caption text-status-error">
                {errors.confirm_checkbox.message}
              </p>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href={`${base}/profile`}
              className="inline-flex h-10 items-center justify-center rounded-radius-sm border border-border-default px-6 font-sarabun text-label font-medium text-text-primary transition-colors hover:bg-surface-container"
            >
              {t("cancel")}
            </Link>
            <button
              type="submit"
              disabled={!isValid || mutation.isPending}
              className="inline-flex h-10 items-center justify-center rounded-radius-sm bg-status-error px-6 font-sarabun text-label font-medium text-white transition-colors hover:bg-status-error/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {mutation.isPending ? t("submitting") : t("submit")}
            </button>
          </div>
        </form>
      </section>

      {toast && (
        <div
          role="alert"
          className={`fixed bottom-6 right-6 z-50 max-w-sm rounded-radius-md border-l-4 px-4 py-3 shadow-level-2 ${
            toast.type === "success"
              ? "border-status-success bg-status-success-bg"
              : "border-status-error bg-status-error-bg"
          }`}
        >
          <p
            className={`font-sarabun text-caption ${
              toast.type === "success"
                ? "text-status-success"
                : "text-status-error"
            }`}
          >
            {toast.message}
          </p>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="mt-2 font-sarabun text-caption text-text-secondary hover:text-text-primary"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
