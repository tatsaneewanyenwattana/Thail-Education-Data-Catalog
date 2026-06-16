"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import CreatePageModal from "@/components/admin/CreatePageModal";
import HeroImageUpload from "@/components/admin/HeroImageUpload";
import StaticPageCard from "@/components/admin/StaticPageCard";
import { useAdminStaticPages, useCreatePage } from "@/hooks/useAdminPageContent";

function InfoIcon() {
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
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

export default function AdminPagesPage() {
  const t = useTranslations("admin.pages");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const { data: pages = [], isLoading } = useAdminStaticPages();
  const createPageMutation = useCreatePage();

  useEffect(() => {
    if (searchParams.get("saved") === "1") {
      setToastMessage(t("savedSuccess"));
      setToastError(null);
      router.replace(`/${locale}/admin/pages`);
      window.setTimeout(() => setToastMessage(null), 3000);
    }
  }, [searchParams, router, t]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastError(null);
    window.setTimeout(() => setToastMessage(null), 3000);
  };

  const showError = (message: string) => {
    setToastError(message);
    setToastMessage(null);
    window.setTimeout(() => setToastError(null), 3000);
  };

  const handleCreatePage = async (input: {
    slug: string;
    titleTh: string;
    titleEn: string;
    status: "draft" | "published";
  }) => {
    try {
      const created = await createPageMutation.mutateAsync(input);
      setCreateOpen(false);
      showToast(t("create.success"));
      router.push(`/${locale}/admin/pages/${created.slug}`);
    } catch {
      showError(t("create.error"));
    }
  };

  return (
    <div className="mx-auto max-w-container-max space-y-8 pb-24">
      <header className="rounded-radius-lg border border-border-default bg-surface-card px-6 py-5 shadow-sm">
        <h1 className="font-kanit text-[28px] font-bold text-text-primary">
          {t("title")}
        </h1>
        <p className="mt-1 font-sarabun text-caption text-text-muted">
          {t("subtitle")}
        </p>
      </header>

      <HeroImageUpload onSuccess={showToast} onError={showError} />

      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="font-kanit text-lg font-bold text-text-primary">
            {t("pagesTitle")}
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 font-sarabun text-caption text-text-muted">
              <InfoIcon />
              {t("pagesHint")}
            </div>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-2 rounded-radius-md bg-primary-dark px-4 py-2 font-sarabun text-label font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              {t("create.button")}
            </button>
          </div>
        </div>

        {isLoading ? (
          <p className="font-sarabun text-body-md text-text-muted">
            {t("loading")}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {pages.map((page) => (
              <StaticPageCard key={page.slug} page={page} />
            ))}
          </div>
        )}
      </section>

      <CreatePageModal
        open={createOpen}
        isSubmitting={createPageMutation.isPending}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreatePage}
      />

      {toastMessage ? <Toast message={toastMessage} variant="success" /> : null}
      {toastError ? <Toast message={toastError} variant="error" /> : null}
    </div>
  );
}

function Toast({
  message,
  variant,
}: {
  message: string;
  variant: "success" | "error";
}) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-[110] rounded-radius-lg px-5 py-3 font-sarabun text-body-md shadow-level-2 ${
        variant === "success"
          ? "bg-status-published text-surface-card"
          : "bg-status-error text-surface-card"
      }`}
      role="status"
    >
      {message}
    </div>
  );
}
