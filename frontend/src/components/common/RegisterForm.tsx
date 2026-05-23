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

const PDPA_VERSION = "1.0";

type RegisterFormValues = {
  agency_name: string;
  email: string;
  password: string;
  confirm_password: string;
  pdpa_consent: boolean;
};

type PasswordStrength = "none" | "weak" | "medium" | "strong";

function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return "none";

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (hasMinLength && hasUppercase && hasNumber) return "strong";
  if (hasMinLength) return "medium";
  return "weak";
}

function AgencyIcon() {
  return (
    <svg
      className="h-8 w-8 text-primary-dark"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"
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

export default function RegisterForm() {
  const t = useTranslations("auth.register");
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || "th";

  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const registerSchema = useMemo(
    () =>
      z
        .object({
          agency_name: z
            .string()
            .min(1, t("agencyNameRequired"))
            .min(3, t("agencyNameMin")),
          email: z
            .string()
            .min(1, t("emailRequired"))
            .email(t("emailInvalid")),
          password: z
            .string()
            .min(1, t("passwordRequired"))
            .min(8, t("passwordMin"))
            .regex(/[A-Z]/, t("passwordUppercase"))
            .regex(/[0-9]/, t("passwordNumber")),
          confirm_password: z.string().min(1, t("confirmPasswordRequired")),
          pdpa_consent: z.boolean().refine((value) => value === true, {
            message: t("pdpaRequired"),
          }),
        })
        .refine((data) => data.password === data.confirm_password, {
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
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      agency_name: "",
      email: "",
      password: "",
      confirm_password: "",
      pdpa_consent: false,
    },
  });

  const passwordValue = watch("password");
  const passwordStrength = getPasswordStrength(passwordValue);

  const strengthBarClass =
    passwordStrength === "weak"
      ? "w-1/3 bg-status-error"
      : passwordStrength === "medium"
        ? "w-2/3 bg-status-warning"
        : passwordStrength === "strong"
          ? "w-full bg-primary"
          : "w-0";

  const strengthLabel =
    passwordStrength === "weak"
      ? t("passwordWeak")
      : passwordStrength === "medium"
        ? t("passwordMedium")
        : passwordStrength === "strong"
          ? t("passwordStrong")
          : "";

  const mutation = useMutation({
    mutationFn: async (values: RegisterFormValues) => {
      await apiClient.post("/auth/register", {
        agency_name: values.agency_name,
        email: values.email,
        password: values.password,
        pdpa_version: PDPA_VERSION,
      });
    },
    onSuccess: () => {
      setToast({ type: "success", message: t("success") });
      window.setTimeout(() => {
        router.push(`/${locale}/login`);
      }, 1500);
    },
    onError: (error: Error) => {
      setToast({
        type: "error",
        message: error.message || t("errorDefault"),
      });
    },
  });

  const onSubmit = (values: RegisterFormValues) => {
    setToast(null);
    mutation.mutate(values);
  };

  const inputClass = (hasError: boolean) =>
    `h-10 w-full rounded-radius-sm border bg-surface-container px-3 font-sarabun text-body-md text-text-primary placeholder:text-text-muted focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-primary-dark/20 ${
      hasError ? "border-status-error" : "border-border-input"
    }`;

  return (
    <>
      <div className="w-full max-sm:-mx-4 max-sm:w-[calc(100%+2rem)] max-sm:max-w-none max-sm:rounded-none max-sm:border-x-0 max-sm:p-spacing-6 rounded-xl border border-border-default bg-surface-card shadow-level-1 sm:max-w-[440px] sm:p-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-radius-md bg-primary-light">
            <AgencyIcon />
          </div>
          <h1 className="font-kanit text-heading-2 text-primary-dark">
            {t("title")}
          </h1>
          <p className="mt-2 font-sarabun text-body-md text-text-secondary">
            {t("subtitle")}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div>
            <label
              htmlFor="agency_name"
              className="mb-2 block font-sarabun text-label text-text-secondary"
            >
              {t("agencyName")}
            </label>
            <input
              id="agency_name"
              type="text"
              autoComplete="organization"
              placeholder={t("agencyNamePlaceholder")}
              className={inputClass(!!errors.agency_name)}
              {...register("agency_name")}
            />
            {errors.agency_name && (
              <p className="mt-1 font-sarabun text-caption text-status-error">
                {errors.agency_name.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block font-sarabun text-label text-text-secondary"
            >
              {t("email")}
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder={t("emailPlaceholder")}
              className={inputClass(!!errors.email)}
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1 font-sarabun text-caption text-status-error">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block font-sarabun text-label text-text-secondary"
            >
              {t("password")}
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                className={`${inputClass(!!errors.password)} pr-10`}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary-dark"
                aria-label={showPassword ? t("hidePassword") : t("showPassword")}
              >
                <EyeIcon off={showPassword} />
              </button>
            </div>
            {passwordValue.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="h-1 w-full overflow-hidden rounded-radius-full bg-surface-container">
                  <div
                    className={`h-full rounded-radius-full transition-all duration-300 ${strengthBarClass}`}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className={`font-sarabun text-caption font-medium ${
                      passwordStrength === "weak"
                        ? "text-status-error"
                        : passwordStrength === "medium"
                          ? "text-status-warning"
                          : "text-primary"
                    }`}
                  >
                    {strengthLabel}
                  </span>
                  {passwordStrength === "strong" && (
                    <span className="font-sarabun text-caption text-text-muted">
                      {t("passwordSecureHint")}
                    </span>
                  )}
                </div>
              </div>
            )}
            {errors.password && (
              <p className="mt-1 font-sarabun text-caption text-status-error">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirm_password"
              className="mb-2 block font-sarabun text-label text-text-secondary"
            >
              {t("confirmPassword")}
            </label>
            <input
              id="confirm_password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              className={inputClass(!!errors.confirm_password)}
              {...register("confirm_password")}
            />
            {errors.confirm_password && (
              <p className="mt-1 font-sarabun text-caption text-status-error">
                {errors.confirm_password.message}
              </p>
            )}
          </div>

          <div className="flex items-start gap-3 py-1">
            <input
              id="pdpa_consent"
              type="checkbox"
              className="mt-1 h-4 w-4 rounded-radius-sm border-border-input text-primary focus:ring-primary-dark/20"
              {...register("pdpa_consent")}
            />
            <label
              htmlFor="pdpa_consent"
              className="font-sarabun text-caption leading-snug text-text-secondary"
            >
              {t("pdpa")}{" "}
              <Link
                href={`/${locale}/privacy-policy`}
                className="text-primary-dark hover:underline"
              >
                {t("pdpaPolicy")}
              </Link>{" "}
              {t("pdpaAnd")}{" "}
              <Link
                href={`/${locale}/privacy-policy`}
                className="text-primary-dark hover:underline"
              >
                {t("pdpaLink")}
              </Link>
            </label>
          </div>
          {errors.pdpa_consent && (
            <p className="-mt-3 font-sarabun text-caption text-status-error">
              {errors.pdpa_consent.message}
            </p>
          )}

          <div className="pt-1">
            <button
              type="submit"
              disabled={!isValid || mutation.isPending}
              className="flex h-10 w-full items-center justify-center rounded-radius-sm bg-primary font-sarabun text-label font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              {mutation.isPending ? `${t("submit")}...` : t("submit")}
            </button>
            <p className="mt-3 text-center font-sarabun text-caption italic text-text-muted">
              {t("pendingNote")}
            </p>
          </div>
        </form>

        <div className="mt-8 border-t border-border-default pt-6 text-center">
          <p className="font-sarabun text-body-md text-text-secondary">
            {t("hasAccount")}{" "}
            <Link
              href={`/${locale}/login`}
              className="font-medium text-primary-dark hover:underline"
            >
              {t("loginLink")}
            </Link>
          </p>
        </div>
      </div>

      {toast && (
        <div
          role="alert"
          className={`fixed bottom-6 right-6 z-50 max-w-sm rounded-radius-md border-l-4 px-4 py-3 shadow-level-2 ${
            toast.type === "success"
              ? "border-primary bg-primary-light"
              : "border-status-error bg-status-error-bg"
          }`}
        >
          <p
            className={`font-sarabun text-caption ${
              toast.type === "success" ? "text-primary-dark" : "text-status-error"
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
    </>
  );
}
