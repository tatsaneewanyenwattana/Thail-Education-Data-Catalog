"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import CreatePageModal from "@/components/admin/CreatePageModal";
import HeroImageUpload from "@/components/admin/HeroImageUpload";
import StaticPageCard from "@/components/admin/StaticPageCard";
import { useAdminStaticPages, useCreatePage } from "@/hooks/useAdminPageContent";

export default function AdminPagesPage() {
  const t = useTranslations("admin.pages");
  const locale = useLocale();
  const base = `/${locale}`;
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
    <div className="space-y-8 pb-24">
      {/* Header + Breadcrumb */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <nav className="mb-2 flex font-sarabun text-body-sm text-text-muted">
            <Link href={`${base}/admin`} className="hover:text-primary-dark">
              {t("breadcrumbAdmin")}
            </Link>
            <span className="mx-2">&gt;</span>
            <span>{t("breadcrumbContent")}</span>
            <span className="mx-2">&gt;</span>
            <span className="font-medium text-primary-dark">{t("breadcrumbPages")}</span>
          </nav>
          <h1 className="font-kanit text-[32px] font-bold leading-tight text-text-primary">
            {t("title")}
          </h1>
          <p className="mt-1 font-sarabun text-body-md text-text-muted">
            {t("subtitle")}
          </p>
        </div>
      </header>

      {/* Hero Section */}
      <section>
        <div className="mb-5 flex items-center gap-3">
          <ImageIcon />
          <h2 className="font-kanit text-2xl font-bold text-text-primary">
            {t("heroSectionTitle")}
          </h2>
        </div>
        <HeroImageUpload onSuccess={showToast} onError={showError} />
      </section>

      {/* Documents Directory */}
      <section>
        <div className="mb-6 flex items-center gap-3">
          <DocIcon />
          <h2 className="font-kanit text-2xl font-bold text-text-primary">
            {t("documentsTitle")}
          </h2>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-gray-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {pages.map((page) => (
              <StaticPageCard key={page.slug} page={page} />
            ))}
            {/* Add New Page card */}
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="group flex min-h-[280px] flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-8 transition-all hover:border-primary-dark/30 hover:bg-blue-50/30 hover:shadow-md"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-text-muted transition-colors group-hover:bg-primary-dark/10 group-hover:text-primary-dark">
                <PlusIcon />
              </span>
              <span className="font-sarabun text-lg font-bold text-text-muted group-hover:text-primary-dark">
                {t("addNewPage")}
              </span>
              <span className="text-center font-sarabun text-body-md text-text-muted">
                {t("addNewPageDesc")}
              </span>
            </button>
          </div>
        )}
      </section>

      <CreatePageModal
        open={createOpen}
        isSubmitting={createPageMutation.isPending}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreatePage}
      />

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[110] rounded-2xl bg-primary-dark px-4 py-3 font-sarabun text-label text-white shadow-lg">
          {toastMessage}
        </div>
      )}
      {toastError && (
        <div className="fixed bottom-6 right-6 z-[110] rounded-2xl bg-status-error px-4 py-3 font-sarabun text-label text-white shadow-lg">
          {toastError}
        </div>
      )}
    </div>
  );
}

function PlusIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg className="h-7 w-7 text-primary-dark" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg className="h-7 w-7 text-primary-dark" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 15h8v2H8v-2zm0-4h8v2H8v-2z" />
    </svg>
  );
}
