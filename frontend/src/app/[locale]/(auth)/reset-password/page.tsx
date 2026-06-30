"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { LockIcon, EyeIcon } from "@/components/common/auth/AuthIcons";
import PasswordStrengthIndicator from "@/components/common/auth/PasswordStrength";
import apiClient from "@/services/api";

type ResetPasswordValues = {
  new_password: string;
  confirm_password: string;
};

type PageView = "missing" | "form" | "expired";

function getErrorCode(error: unknown): string | undefined {
  if (error instanceof Error && "code" in error) {
    return (error as Error & { code?: string }).code;
  }
  return undefined;
}


export default function ResetPasswordPage() {
  const t = useTranslations("auth.resetPassword");
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params.locale as string) || "th";
  const token = searchParams.get("token");

  const [view, setView] = useState<PageView>(token ? "form" : "missing");
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const resetPasswordSchema = useMemo(
    () =>
      z
        .object({
          new_password: z
            .string()
            .min(1, t("newPasswordRequired"))
            .min(8, t("passwordMin"))
            .regex(/[a-z]/, t("passwordLowercase"))
            .regex(/[A-Z]/, t("passwordUppercase"))
            .regex(/[0-9]/, t("passwordNumber"))
            .regex(/[!@#$%^&*]/, t("passwordSpecial")),
          confirm_password: z.string().min(1, t("confirmPasswordRequired")),
        })
        .refine((data) => data.new_password === data.confirm_password, {
          message: t("confirmPasswordMismatch"),
          path: ["confirm_password"],
        }),
    [t]
  );

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
    defaultValues: { new_password: "", confirm_password: "" },
  });

  const newPasswordValue = watch("new_password");

  const mutation = useMutation({
    mutationFn: async (values: ResetPasswordValues) => {
      if (!token) {
        throw new Error(t("invalidLinkMessage"));
      }
      await apiClient.post("/auth/reset-password", {
        token,
        new_password: values.new_password,
      });
    },
    onSuccess: () => {
      setToast({ type: "success", message: t("successToast") });
      window.setTimeout(() => {
        router.push(`/${locale}/login`);
      }, 1500);
    },
    onError: (error: Error) => {
      const code = getErrorCode(error);
      if (code === "AUTH_TOKEN_EXPIRED") {
        setView("expired");
        return;
      }
      setToast({
        type: "error",
        message: error.message || t("errorDefault"),
      });
    },
  });

  const onSubmit = (values: ResetPasswordValues) => {
    setToast(null);
    mutation.mutate(values);
  };

  const cardClass =
    "w-full max-sm:-mx-4 max-sm:w-[calc(100%+2rem)] max-sm:max-w-none max-sm:rounded-none max-sm:border-x-0 max-sm:p-spacing-6 rounded-2xl border border-white/80 bg-white shadow-md sm:max-w-[440px] sm:p-10";

  const inputClass = (hasError: boolean) =>
    `h-11 w-full rounded-xl border bg-gray-50 font-sarabun text-body-md text-text-primary placeholder:text-text-muted focus:border-primary-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-dark/20 transition-all ${
      hasError ? "border-status-error" : "border-gray-200"
    }`;

  return (
    <div className="relative w-full px-4 py-8">
      <div className="mx-auto flex justify-center">
        <div className={cardClass}>
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-light">
              <span className="font-kanit text-heading-3 text-primary-dark">
                ED
              </span>
            </div>
            <h1 className="font-kanit text-heading-2 text-primary-dark">
              {view === "expired" ? t("expiredTitle") : t("title")}
            </h1>
            {view === "form" && (
              <p className="mt-2 font-sarabun text-body-md text-text-secondary">
                {t("subtitle")}
              </p>
            )}
          </div>

          {view === "missing" && (
            <div className="space-y-6 text-center">
              <p className="font-kanit text-heading-3 text-status-error">
                {t("invalidLink")}
              </p>
              <p className="font-sarabun text-body-md text-text-secondary">
                {t("invalidLinkMessage")}
              </p>
              <Link
                href={`/${locale}/forgot-password`}
                className="inline-flex h-11 w-full items-center justify-center rounded-full bg-primary-dark font-sarabun text-label font-medium text-white shadow-md transition-all hover:bg-primary-hover hover:shadow-lg"
              >
                {t("requestNewLink")}
              </Link>
            </div>
          )}

          {view === "expired" && (
            <div className="space-y-6 text-center">
              <p className="font-sarabun text-body-md text-text-secondary">
                {t("expiredMessage")}
              </p>
              <Link
                href={`/${locale}/forgot-password`}
                className="inline-flex h-11 w-full items-center justify-center rounded-full bg-primary-dark font-sarabun text-label font-medium text-white shadow-md transition-all hover:bg-primary-hover hover:shadow-lg"
              >
                {t("requestNewLink")}
              </Link>
            </div>
          )}

          {view === "form" && (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
              noValidate
            >
              <div>
                <label
                  htmlFor="new_password"
                  className="mb-2 block font-sarabun text-label text-text-secondary"
                >
                  {t("newPasswordLabel")}
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                    <LockIcon />
                  </span>
                  <input
                    id="new_password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className={`${inputClass(!!errors.new_password)} pl-10 pr-10`}
                    {...register("new_password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary-dark"
                    aria-label={
                      showPassword ? t("hidePassword") : t("showPassword")
                    }
                  >
                    <EyeIcon off={showPassword} />
                  </button>
                </div>
                <PasswordStrengthIndicator
                  password={newPasswordValue}
                  labels={{
                    length: t("passwordCheckLength"),
                    lower: t("passwordCheckLower"),
                    upper: t("passwordCheckUpper"),
                    number: t("passwordCheckNumber"),
                    special: t("passwordCheckSpecial"),
                  }}
                />
                {errors.new_password && (
                  <p className="mt-1 font-sarabun text-caption text-status-error">
                    {errors.new_password.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirm_password"
                  className="mb-2 block font-sarabun text-label text-text-secondary"
                >
                  {t("confirmPasswordLabel")}
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                    <LockIcon />
                  </span>
                  <input
                    id="confirm_password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className={`${inputClass(!!errors.confirm_password)} pl-10 pr-3`}
                    {...register("confirm_password")}
                  />
                </div>
                {errors.confirm_password && (
                  <p className="mt-1 font-sarabun text-caption text-status-error">
                    {errors.confirm_password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={!isValid || mutation.isPending}
                className="flex h-11 w-full items-center justify-center rounded-full bg-primary-dark font-sarabun text-label font-medium text-white shadow-md transition-all hover:bg-primary-hover hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
              >
                {mutation.isPending ? t("submitting") : t("submit")}
              </button>

              <p className="text-center">
                <Link
                  href={`/${locale}/login`}
                  className="font-sarabun text-body-md font-medium text-primary-dark hover:underline"
                >
                  {t("backToLogin")}
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>

      {toast && (
        <div
          role="alert"
          className={`fixed bottom-6 right-6 z-50 max-w-sm rounded-xl border-l-4 px-4 py-3 shadow-md ${
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
