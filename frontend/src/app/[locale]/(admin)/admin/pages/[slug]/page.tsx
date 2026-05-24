"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import RichTextEditor from "@/components/admin/RichTextEditor";
import {
  useAdminPageContent,
  useUpdatePageContent,
} from "@/hooks/useAdminPageContent";

export default function AdminPageEditorPage() {
  const t = useTranslations("admin.pages");
  const locale = useLocale();
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const { data: page, isLoading, isError } = useAdminPageContent(slug);
  const updateMutation = useUpdatePageContent();

  const [contentTh, setContentTh] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);

  useEffect(() => {
    if (page) {
      setContentTh(page.contentTh);
      setContentEn(page.contentEn);
    }
  }, [page]);

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

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        slug,
        data: { contentTh, contentEn },
      });
      showToast(t("savedSuccess"));
    } catch {
      showError(t("saveError"));
    }
  };

  const handleCancel = () => {
    router.push(`/${locale}/admin/pages`);
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-container-max pb-24">
        <p className="font-sarabun text-body-md text-text-muted">
          {t("loading")}
        </p>
      </div>
    );
  }

  if (isError || !page) {
    return (
      <div className="mx-auto max-w-container-max pb-24">
        <p className="font-sarabun text-body-md text-error">{t("notFound")}</p>
        <button
          type="button"
          onClick={handleCancel}
          className="mt-4 font-sarabun text-label font-semibold text-primary hover:underline"
        >
          {t("cancel")}
        </button>
      </div>
    );
  }

  const pageTitle = locale === "th" ? page.titleTh : page.titleEn;

  return (
    <div className="mx-auto max-w-container-max space-y-6 pb-24">
      <header className="rounded-radius-lg border border-border-default bg-surface-card px-6 py-5 shadow-sm">
        <p className="font-mono text-body-sm text-text-muted">/{slug}</p>
        <h1 className="mt-1 font-kanit text-[28px] font-bold text-text-primary">
          {t("editTitle", { title: pageTitle })}
        </h1>
      </header>

      <RichTextEditor
        contentTh={contentTh}
        contentEn={contentEn}
        onChangeTh={setContentTh}
        onChangeEn={setContentEn}
        disabled={updateMutation.isPending}
      />

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={handleCancel}
          disabled={updateMutation.isPending}
          className="inline-flex min-h-[44px] items-center justify-center rounded-radius-md border border-border-default px-6 py-2 font-sarabun text-label font-semibold text-text-secondary transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-60"
        >
          {t("cancel")}
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="inline-flex min-h-[44px] items-center justify-center rounded-radius-md bg-primary px-6 py-2 font-sarabun text-label font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {updateMutation.isPending ? t("saving") : t("save")}
        </button>
      </div>

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
