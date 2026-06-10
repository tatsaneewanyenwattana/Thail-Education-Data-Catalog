"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import apiClient from "@/services/api";

type VerifyStatus = "loading" | "success" | "expired" | "error" | "missing";

function getErrorCode(error: unknown): string | undefined {
  if (error instanceof Error && "code" in error) {
    return (error as Error & { code?: string }).code;
  }
  return undefined;
}

export default function VerifyEmailPage() {
  const t = useTranslations("auth.verifyEmail");
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params.locale as string) || "th";
  const token = searchParams.get("token");

  const [status, setStatus] = useState<VerifyStatus>("loading");

  useEffect(() => {
    if (!token) {
      setStatus("missing");
      return;
    }

    let cancelled = false;

    const verify = async () => {
      try {
        await apiClient.post("/auth/verify-email", { token });
        if (!cancelled) setStatus("success");
      } catch (error) {
        if (cancelled) return;
        const code = getErrorCode(error);
        if (code === "AUTH_TOKEN_EXPIRED") {
          setStatus("expired");
        } else {
          setStatus("error");
        }
      }
    };

    void verify();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const cardClass =
    "w-full max-w-md rounded-xl border border-border-default bg-surface-card p-8 shadow-level-1 text-center";

  if (status === "loading") {
    return (
      <div className="relative w-full px-4 py-8">
        <div className={cardClass}>
          <p className="font-sarabun text-body-md text-text-secondary">
            {t("loading")}
          </p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="relative w-full px-4 py-8">
        <div className={cardClass}>
          <p className="font-kanit text-heading-3 text-primary-dark">
            ✓ {t("successTitle")}
          </p>
          <p className="mt-3 font-sarabun text-body-md text-text-secondary">
            {t("successMessage")}
          </p>
          <Link
            href={`/${locale}/register-status`}
            className="mt-6 inline-flex h-10 items-center justify-center rounded-radius-sm bg-primary px-6 font-sarabun text-label font-medium text-white transition-colors hover:bg-primary-hover"
          >
            {t("checkStatus")}
          </Link>
        </div>
      </div>
    );
  }

  if (status === "expired") {
    return (
      <div className="relative w-full px-4 py-8">
        <div className={cardClass}>
          <p className="font-kanit text-heading-3 text-status-error">
            {t("expiredTitle")}
          </p>
          <p className="mt-3 font-sarabun text-body-md text-text-secondary">
            {t("expiredMessage")}
          </p>
          <Link
            href={`/${locale}/resend-verification`}
            className="mt-6 inline-flex h-10 items-center justify-center rounded-radius-sm bg-primary px-6 font-sarabun text-label font-medium text-white transition-colors hover:bg-primary-hover"
          >
            {t("resendLink")}
          </Link>
        </div>
      </div>
    );
  }

  const errorMessage =
    status === "missing" ? t("missingToken") : t("errorMessage");

  return (
    <div className="relative w-full px-4 py-8">
      <div className={cardClass}>
        <p className="font-kanit text-heading-3 text-status-error">
          {t("errorTitle")}
        </p>
        <p className="mt-3 font-sarabun text-body-md text-text-secondary">
          {errorMessage}
        </p>
        <Link
          href={`/${locale}`}
          className="mt-6 inline-flex h-10 items-center justify-center rounded-radius-sm bg-primary px-6 font-sarabun text-label font-medium text-white transition-colors hover:bg-primary-hover"
        >
          {t("homeLink")}
        </Link>
      </div>
    </div>
  );
}
