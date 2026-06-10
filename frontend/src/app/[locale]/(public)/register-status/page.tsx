"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import apiClient from "@/services/api";

type RegisterStatusFormValues = {
  email: string;
};

type RegisterStatusData = {
  status: string;
  created_at?: string;
};

type StatusView = RegisterStatusData | null;

function getErrorCode(error: unknown): string | undefined {
  if (error instanceof Error && "code" in error) {
    return (error as Error & { code?: string }).code;
  }
  return undefined;
}

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

export default function RegisterStatusPage() {
  const t = useTranslations("auth.registerStatus");
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params.locale as string) || "th";
  const initialEmail = searchParams.get("email") ?? "";

  const [statusView, setStatusView] = useState<StatusView>(null);
  const [checkedEmail, setCheckedEmail] = useState("");
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const registerStatusSchema = useMemo(
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
  } = useForm<RegisterStatusFormValues>({
    resolver: zodResolver(registerStatusSchema),
    mode: "onChange",
    defaultValues: { email: initialEmail },
  });

  const checkMutation = useMutation({
    mutationFn: async (values: RegisterStatusFormValues) => {
      const email = values.email.trim();
      const response = await apiClient.get("/auth/register-status", {
        params: { email },
      });
      const data = (response.data as { data?: RegisterStatusData }).data;
      if (!data) {
        throw new Error(t("errorDefault"));
      }
      return { email, data };
    },
    onMutate: () => {
      setResendMessage(null);
    },
    onSuccess: ({ email, data }) => {
      setCheckedEmail(email);
      setStatusView(data);
    },
    onError: (error: Error) => {
      setStatusView(null);
      setCheckedEmail("");
      setResendMessage(error.message || t("errorDefault"));
    },
  });

  const resendMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post("/auth/resend-verification", {
        email: checkedEmail,
      });
    },
    onSuccess: () => {
      setResendMessage(t("resendSuccess"));
    },
    onError: (error: Error) => {
      const code = getErrorCode(error);
      if (code === "AUTH_RESEND_COOLDOWN") {
        setResendMessage(t("resendCooldown"));
        return;
      }
      setResendMessage(error.message || t("errorDefault"));
    },
  });

  const onSubmit = (values: RegisterStatusFormValues) => {
    setResendMessage(null);
    checkMutation.mutate(values);
  };

  const cardClass =
    "w-full max-w-lg rounded-radius-lg border border-border-default bg-surface-card p-8 shadow-level-1 sm:p-10";

  const buttonPrimaryClass =
    "inline-flex h-10 items-center justify-center rounded-radius-sm bg-primary px-6 font-sarabun text-label font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40";

  const renderStatusResult = () => {
    if (!statusView) return null;

    const { status } = statusView;

    if (status === "not_found") {
      return (
        <p className="font-sarabun text-body-md text-status-error">
          {t("notFound")}
        </p>
      );
    }

    if (status === "email_unverified") {
      return (
        <div className="space-y-4">
          <p className="font-sarabun text-body-md text-text-primary">
            {t("emailUnverified")}
          </p>
          {resendMessage ? (
            <p className="font-sarabun text-body-md text-primary">
              {resendMessage}
            </p>
          ) : (
            <button
              type="button"
              onClick={() => resendMutation.mutate()}
              disabled={resendMutation.isPending}
              className={buttonPrimaryClass}
            >
              {resendMutation.isPending
                ? t("resending")
                : t("resendVerification")}
            </button>
          )}
        </div>
      );
    }

    if (status === "pending") {
      return (
        <p className="font-sarabun text-body-md text-text-primary">
          {t("pending")}
        </p>
      );
    }

    if (status === "active") {
      return (
        <div className="space-y-4">
          <p className="font-sarabun text-body-md text-status-success">
            {t("active")}
          </p>
          <Link href={`/${locale}/login`} className={buttonPrimaryClass}>
            {t("loginLink")}
          </Link>
        </div>
      );
    }

    if (status === "rejected") {
      return (
        <p className="font-sarabun text-body-md text-status-error">
          {t("rejected")}
        </p>
      );
    }

    if (status === "suspended") {
      return (
        <p className="font-sarabun text-body-md text-status-error">
          {t("suspended")}
        </p>
      );
    }

    return (
      <p className="font-sarabun text-body-md text-text-secondary">
        {t("errorDefault")}
      </p>
    );
  };

  return (
    <div className="mx-auto max-w-container-max px-4 py-spacing-12 md:px-spacing-10">
      <div className="flex justify-center">
        <div className={cardClass}>
          <div className="mb-8 text-center">
            <h1 className="font-kanit text-heading-2 text-primary-dark">
              {t("title")}
            </h1>
            <p className="mt-2 font-sarabun text-body-md text-text-secondary">
              {t("description")}
            </p>
          </div>

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
                {t("email")}
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

            <button
              type="submit"
              disabled={!isValid || checkMutation.isPending}
              className={`${buttonPrimaryClass} w-full`}
            >
              {checkMutation.isPending ? t("checking") : t("checkButton")}
            </button>
          </form>

          {checkMutation.isError && !statusView && (
            <p className="mt-4 font-sarabun text-caption text-status-error">
              {checkMutation.error.message || t("errorDefault")}
            </p>
          )}

          {statusView && (
            <div className="mt-8 border-t border-border-default pt-6">
              {renderStatusResult()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
