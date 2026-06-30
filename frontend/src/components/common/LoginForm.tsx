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
import TurnstileField, {
  isTurnstileConfigured,
} from "@/components/common/TurnstileField";
import { MailIcon, LockIcon, EyeIcon } from "@/components/common/auth/AuthIcons";

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

export default function LoginForm() {
  const t = useTranslations("auth.login");
  const params = useParams();
  const locale = (params.locale as string) || "th";
  const login = useAuthStore((state) => state.login);

  const [showPassword, setShowPassword] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const turnstileEnabled = isTurnstileConfigured();

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
      const loginRes = await apiClient.post("/auth/login", {
        ...values,
        ...(turnstileEnabled ? { turnstile_token: turnstileToken } : {}),
      });
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
      setTurnstileToken("");
      setTurnstileResetKey((prev) => prev + 1);
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    if (turnstileEnabled && !turnstileToken) {
      setToastMessage(t("turnstileRequired"));
      return;
    }
    setToastMessage(null);
    mutation.mutate(values);
  };

  return (
    <>
      <div className="w-full max-sm:-mx-4 max-sm:w-[calc(100%+2rem)] max-sm:max-w-none max-sm:rounded-none max-sm:border-x-0 max-sm:p-spacing-6 rounded-2xl border border-white/80 bg-white shadow-md sm:max-w-[420px] sm:p-10">
        <div className="mb-5 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Thai EduData Insight" className="mx-auto mb-3 h-[60px] w-[60px] object-contain" />
          <h1 className="font-kanit text-[1.75rem] font-bold leading-tight text-primary-dark">
            {t("title")}
          </h1>
          <p className="mt-1 font-sarabun text-body-md text-text-secondary">
            {t("subtitle")}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
                className={`h-12 w-full rounded-2xl border-none bg-[#f5f5f5] pl-10 pr-4 font-sarabun text-body-md text-text-primary placeholder:text-text-muted focus:bg-[#eeeeee] focus:outline-none focus:ring-2 focus:ring-primary-dark/20 transition-all ${
                  errors.email ? "ring-2 ring-status-error" : ""
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
                className={`h-12 w-full rounded-2xl border-none bg-[#f5f5f5] pl-10 pr-10 font-sarabun text-body-md text-text-primary focus:bg-[#eeeeee] focus:outline-none focus:ring-2 focus:ring-primary-dark/20 transition-all ${
                  errors.password ? "ring-2 ring-status-error" : ""
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

          {turnstileEnabled && (
            <TurnstileField
              resetKey={turnstileResetKey}
              onSuccess={setTurnstileToken}
              onExpire={() => setTurnstileToken("")}
              onError={() => setTurnstileToken("")}
            />
          )}

          <button
            type="submit"
            disabled={
              !isValid ||
              mutation.isPending ||
              (turnstileEnabled && !turnstileToken)
            }
            className="flex h-12 w-full items-center justify-center rounded-2xl font-sarabun text-body-md font-semibold text-white shadow-md transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #0045bc 0%, #2979ff 100%)" }}
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
          className="mt-4 flex h-11 w-full items-center justify-center rounded-2xl border border-blue-200 bg-white font-sarabun text-label font-medium text-primary-dark transition-all hover:bg-blue-50 hover:shadow-md"
        >
          {t("checkStatusLink")}
        </Link>
      </div>

      {toastMessage && (
        <div
          role="alert"
          className="fixed bottom-6 right-6 z-50 max-w-sm rounded-xl border-l-4 border-status-error bg-status-error-bg px-4 py-3 shadow-md"
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
