"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import apiClient from "@/services/api";

type ResetPasswordValues = {
  new_password: string;
  confirm_password: string;
};

type PasswordChecks = {
  length: boolean;
  lower: boolean;
  upper: boolean;
  number: boolean;
  special: boolean;
};

type PageView = "missing" | "form" | "expired";

function getErrorCode(error: unknown): string | undefined {
  if (error instanceof Error && "code" in error) {
    return (error as Error & { code?: string }).code;
  }
  return undefined;
}

function getPasswordChecks(password: string): PasswordChecks {
  return {
    length: password.length >= 8,
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*]/.test(password),
  };
}

function getPasswordLevel(checks: PasswordChecks): number {
  return Object.values(checks).filter(Boolean).length;
}

function LockIcon() {
  return (
    <svg
      className="h-5 w-5 text-text-muted"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  );
}

function EyeIcon({ off }: { off?: boolean }) {
  if (off) {
    return (
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029M6.223 6.223A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.543 7a9.965 9.965 0 01-4.293 5.411M15 12a3 3 0 11-6 0 3 3 0 016 0zM3 3l18 18"
        />
      </svg>
    );
  }
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );
}

function PasswordStrengthIndicator({
  password,
  t,
}: {
  password: string;
  t: ReturnType<typeof useTranslations<"auth.resetPassword">>;
}) {
  if (!password) return null;

  const checks = getPasswordChecks(password);
  const level = getPasswordLevel(checks);

  const checklist = [
    { key: "passwordCheckLength", met: checks.length },
    { key: "passwordCheckLower", met: checks.lower },
    { key: "passwordCheckUpper", met: checks.upper },
    { key: "passwordCheckNumber", met: checks.number },
    { key: "passwordCheckSpecial", met: checks.special },
  ] as const;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className={`h-1 flex-1 rounded-radius-full transition-colors duration-300 ${
              index < level ? "bg-primary" : "bg-surface-container"
            }`}
          />
        ))}
      </div>
      <ul className="space-y-1">
        {checklist.map((item) => (
          <li
            key={item.key}
            className={`font-sarabun text-caption ${
              item.met ? "text-primary" : "text-text-muted"
            }`}
          >
            {item.met ? "✓" : "✗"} {t(item.key)}
          </li>
        ))}
      </ul>
    </div>
  );
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
    "w-full max-sm:-mx-4 max-sm:w-[calc(100%+2rem)] max-sm:max-w-none max-sm:rounded-none max-sm:border-x-0 max-sm:p-spacing-6 bg-surface-card shadow-level-1 sm:max-w-[440px] sm:rounded-none sm:rounded-radius-lg sm:border sm:border-border-default sm:p-10";

  const inputClass = (hasError: boolean) =>
    `h-10 w-full rounded-radius-sm border bg-surface-card font-sarabun text-body-md text-text-primary placeholder:text-text-muted focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-primary-dark/20 ${
      hasError ? "border-status-error" : "border-border-input"
    }`;

  return (
    <div className="relative w-full px-4 py-8">
      <div className="mx-auto flex justify-center">
        <div className={cardClass}>
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-radius-md bg-primary-light">
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
                className="inline-flex h-10 w-full items-center justify-center rounded-radius-sm bg-primary font-sarabun text-label font-medium text-white transition-colors hover:bg-primary-hover"
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
                className="inline-flex h-10 w-full items-center justify-center rounded-radius-sm bg-primary font-sarabun text-label font-medium text-white transition-colors hover:bg-primary-hover"
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
                  t={t}
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
                className="flex h-10 w-full items-center justify-center rounded-radius-sm bg-primary font-sarabun text-label font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
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
