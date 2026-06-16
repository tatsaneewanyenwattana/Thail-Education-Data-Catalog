"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import apiClient from "@/services/api";
import { useAuthStore, type User } from "@/stores/useAuthStore";

type LoginFormValues = {
  email: string;
  password: string;
};

type LoginResponseData = {
  access_token: string;
  token_type: string;
};

type MeResponseData = {
  id: string;
  email: string;
  role: User["role"];
  status: User["status"];
  agency_name: string | null;
};

function MailIcon() {
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
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
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

export default function LoginForm() {
  const t = useTranslations("auth.login");
  const params = useParams();
  const locale = (params.locale as string) || "th";
  const login = useAuthStore((state) => state.login);

  const [showPassword, setShowPassword] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loginSchema = useMemo(
    () =>
      z.object({
        email: z
          .string()
          .min(1, t("emailRequired"))
          .email(t("emailInvalid")),
        password: z
          .string()
          .min(1, t("passwordRequired"))
          .min(8, t("passwordMin")),
      }),
    [t]
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: { email: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: async (values: LoginFormValues) => {
      const loginRes = await apiClient.post("/auth/login", values);
      const token = (loginRes.data as { data?: LoginResponseData }).data
        ?.access_token;
      if (!token) {
        throw new Error(t("errorInvalid"));
      }

      localStorage.setItem("token", token);
      const meRes = await apiClient.get("/auth/me");
      const me = (meRes.data as { data?: MeResponseData }).data;
      if (!me) {
        throw new Error(t("errorInvalid"));
      }

      return { token, user: me };
    },
    onSuccess: ({ token, user }) => {
      setToastMessage(null);
      const authUser = {
        id: String(user.id),
        email: user.email,
        role: user.role,
        status: user.status,
        agency_name: user.agency_name,
      };
      login(token, authUser);

      const targetPath =
        authUser.role === "admin"
          ? `/${locale}/admin`
          : `/${locale}/dashboard`;

      window.location.assign(targetPath);
    },
    onError: (error: Error) => {
      setToastMessage(error.message || t("errorInvalid"));
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    setToastMessage(null);
    mutation.mutate(values);
  };

  return (
    <>
      <div className="w-full max-sm:-mx-4 max-sm:w-[calc(100%+2rem)] max-sm:max-w-none max-sm:rounded-none max-sm:border-x-0 max-sm:p-spacing-6 bg-surface-card shadow-level-1 sm:max-w-[440px] sm:rounded-none sm:rounded-radius-lg sm:border sm:border-border-default sm:p-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-radius-md bg-primary-light">
            <span className="font-kanit text-heading-3 text-primary-dark">
              ED
            </span>
          </div>
          <h1 className="font-kanit text-heading-2 text-primary-dark">
            {t("title")}
          </h1>
          <p className="mt-2 font-sarabun text-body-md text-text-secondary">
            {t("subtitle")}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          <div>
            <label
              htmlFor="email"
              className="mb-2 block font-sarabun text-label text-text-secondary"
            >
              {t("emailLabel")}
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                <MailIcon />
              </span>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className={`h-10 w-full rounded-radius-sm border bg-surface-card pl-10 pr-3 font-sarabun text-body-md text-text-primary placeholder:text-text-muted focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-primary-dark/20 ${
                  errors.email ? "border-status-error" : "border-border-input"
                }`}
                {...register("email")}
              />
            </div>
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
              {t("passwordLabel")}
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                <LockIcon />
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                className={`h-10 w-full rounded-radius-sm border bg-surface-card pl-10 pr-10 font-sarabun text-body-md text-text-primary focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-primary-dark/20 ${
                  errors.password ? "border-status-error" : "border-border-input"
                }`}
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
            {errors.password && (
              <p className="mt-1 font-sarabun text-caption text-status-error">
                {errors.password.message}
              </p>
            )}
            <div className="mt-2 text-right">
              <Link
                href={`/${locale}/forgot-password`}
                className="font-sarabun text-caption font-medium text-primary-dark hover:underline"
              >
                {t("forgotPasswordLink")}
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={!isValid || mutation.isPending}
            className="flex h-10 w-full items-center justify-center rounded-radius-sm bg-primary font-sarabun text-label font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            {mutation.isPending ? (
              <span className="font-sarabun text-label">{t("submit")}...</span>
            ) : (
              t("submit")
            )}
          </button>
        </form>

        <p className="mt-8 text-center font-sarabun text-body-md text-text-secondary">
          {t("noAccount")}{" "}
          <Link
            href={`/${locale}/register`}
            className="font-medium text-primary-dark hover:underline"
          >
            {t("registerLink")}
          </Link>
        </p>
        <Link
          href={`/${locale}/register-status`}
          className="mt-4 flex h-10 w-full items-center justify-center rounded-radius-sm border border-border-default bg-surface-card font-sarabun text-label font-medium text-primary-dark transition-colors hover:bg-surface-container"
        >
          {t("checkStatusLink")}
        </Link>
      </div>

      {toastMessage && (
        <div
          role="alert"
          className="fixed bottom-6 right-6 z-50 max-w-sm rounded-radius-md border-l-4 border-status-error bg-status-error-bg px-4 py-3 shadow-level-2"
        >
          <p className="font-sarabun text-caption text-status-error">
            {toastMessage}
          </p>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="mt-2 font-sarabun text-caption text-text-secondary hover:text-text-primary"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}
