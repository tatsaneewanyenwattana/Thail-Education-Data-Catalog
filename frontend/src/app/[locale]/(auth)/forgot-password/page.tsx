"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import TurnstileField, {
  isTurnstileConfigured,
} from "@/components/common/TurnstileField";
import apiClient from "@/services/api";
import { toast } from "@/stores/toastStore";

type ForgotPasswordValues = {
  email: string;
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

export default function ForgotPasswordPage() {
  const t = useTranslations("auth.forgotPassword");
  const params = useParams();
  const locale = (params.locale as string) || "th";
  const [submitted, setSubmitted] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const turnstileEnabled = isTurnstileConfigured();

  const forgotPasswordSchema = useMemo(
    () =>
      z.object({
        email: z
          .string()
          .min(1, t("emailRequired"))
          .email(t("emailInvalid")),
      }),
    [t]
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
    defaultValues: { email: "" },
  });

  const mutation = useMutation({
    mutationFn: async (values: ForgotPasswordValues) => {
      try {
        await apiClient.post("/auth/forgot-password", {
          email: values.email.trim(),
          ...(turnstileEnabled ? { turnstile_token: turnstileToken } : {}),
        });
      } catch (error) {
        const code = (error as Error & { code?: string }).code;
        if (code === "TURNSTILE_REQUIRED" || code === "TURNSTILE_FAILED") {
          throw error;
        }
      }
    },
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: (error) => {
      setTurnstileToken("");
      setTurnstileResetKey((prev) => prev + 1);
      toast.error(error instanceof Error ? error.message : t("turnstileFailed"));
    },
  });

  const onSubmit = (values: ForgotPasswordValues) => {
    if (turnstileEnabled && !turnstileToken) {
      toast.error(t("turnstileRequired"));
      return;
    }
    mutation.mutate(values);
  };

  const cardClass =
    "w-full max-sm:-mx-4 max-sm:w-[calc(100%+2rem)] max-sm:max-w-none max-sm:rounded-none max-sm:border-x-0 max-sm:p-spacing-6 bg-surface-card shadow-level-1 sm:max-w-[440px] sm:rounded-none sm:rounded-radius-lg sm:border sm:border-border-default sm:p-10";

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
              {t("title")}
            </h1>
            {!submitted && (
              <p className="mt-2 font-sarabun text-body-md text-text-secondary">
                {t("subtitle")}
              </p>
            )}
          </div>

          {submitted ? (
            <div className="space-y-6 text-center">
              <p className="font-sarabun text-body-md text-text-secondary">
                {t("successMessage")}
              </p>
              <Link
                href={`/${locale}/login`}
                className="inline-flex h-10 w-full items-center justify-center rounded-radius-sm bg-primary font-sarabun text-label font-medium text-white transition-colors hover:bg-primary-hover"
              >
                {t("backToLogin")}
              </Link>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
              noValidate
            >
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
                    placeholder={t("emailPlaceholder")}
                    className={`h-10 w-full rounded-radius-sm border bg-surface-card pl-10 pr-3 font-sarabun text-body-md text-text-primary placeholder:text-text-muted focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-primary-dark/20 ${
                      errors.email
                        ? "border-status-error"
                        : "border-border-input"
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

              <TurnstileField
                resetKey={turnstileResetKey}
                onSuccess={setTurnstileToken}
                onExpire={() => setTurnstileToken("")}
                onError={() => setTurnstileToken("")}
              />

              <button
                type="submit"
                disabled={
                  !isValid ||
                  mutation.isPending ||
                  (turnstileEnabled && !turnstileToken)
                }
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
    </div>
  );
}
