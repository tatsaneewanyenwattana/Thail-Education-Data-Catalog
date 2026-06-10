"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import apiClient from "@/services/api";

type MeProfile = {
  id: string;
  email: string;
  role: string;
  status: string;
  agency_name: string | null;
  agency_type: string | null;
  contact_name: string | null;
  contact_phone: string | null;
};

function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="h-12 rounded-radius-sm bg-surface-container" />
      ))}
    </div>
  );
}

export default function ProfilePage() {
  const t = useTranslations("agency.profile");
  const locale = useLocale();
  const base = `/${locale}`;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["auth", "me", "profile"],
    queryFn: async () => {
      const response = await apiClient.get("/auth/me");
      const me = (response.data as { data?: MeProfile }).data;
      if (!me) {
        throw new Error(t("loadError"));
      }
      return me;
    },
  });

  const getAgencyTypeLabel = (agencyType: string | null) => {
    if (!agencyType) return "—";
    const key = `agencyType_${agencyType}` as
      | "agencyType_central"
      | "agencyType_regional"
      | "agencyType_local"
      | "agencyType_educational"
      | "agencyType_other";
    if (
      key === "agencyType_central" ||
      key === "agencyType_regional" ||
      key === "agencyType_local" ||
      key === "agencyType_educational" ||
      key === "agencyType_other"
    ) {
      return t(key);
    }
    return agencyType;
  };

  const getStatusLabel = (status: string) => {
    const statusLabels: Record<string, string> = {
      email_unverified: t("status_email_unverified"),
      pending: t("status_pending"),
      active: t("status_active"),
      rejected: t("status_rejected"),
      suspended: t("status_suspended"),
    };
    return statusLabels[status] ?? status;
  };

  const fields = data
    ? [
        { label: t("email"), value: data.email },
        { label: t("agencyName"), value: data.agency_name ?? "—" },
        {
          label: t("agencyType"),
          value: getAgencyTypeLabel(data.agency_type),
        },
        { label: t("contactName"), value: data.contact_name ?? "—" },
        { label: t("contactPhone"), value: data.contact_phone ?? "—" },
        { label: t("status"), value: getStatusLabel(data.status) },
      ]
    : [];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="font-kanit text-[28px] font-bold text-text-primary">
          {t("title")}
        </h1>
        <p className="mt-1 font-sarabun text-body-md text-text-muted">
          {t("subtitle")}
        </p>
      </header>

      <section className="rounded-radius-lg border border-border-default bg-surface-card p-6 shadow-level-1 sm:p-8">
        {isLoading ? (
          <ProfileSkeleton />
        ) : isError ? (
          <p className="font-sarabun text-body-md text-status-error">
            {error instanceof Error ? error.message : t("loadError")}
          </p>
        ) : (
          <dl className="divide-y divide-border-default/40">
            {fields.map((field) => (
              <div
                key={field.label}
                className="grid gap-1 py-4 sm:grid-cols-[200px_1fr] sm:gap-4"
              >
                <dt className="font-sarabun text-label font-medium text-text-secondary">
                  {field.label}
                </dt>
                <dd className="font-sarabun text-body-md text-text-primary">
                  {field.value}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      <div className="flex justify-end">
        <Link
          href={`${base}/profile/delete`}
          className="inline-flex h-10 items-center justify-center rounded-radius-sm border border-status-error px-6 font-sarabun text-label font-medium text-status-error transition-colors hover:bg-status-error-bg"
        >
          {t("deleteAccount")}
        </Link>
      </div>
    </div>
  );
}
