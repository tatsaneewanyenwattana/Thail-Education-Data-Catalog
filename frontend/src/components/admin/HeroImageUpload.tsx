"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  useDeleteHeroImage,
  useHeroImage,
  useUploadHeroImage,
} from "@/hooks/useHeroImage";

function UploadIcon() {
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
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
      />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  );
}

type HeroImageUploadProps = {
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
};

export default function HeroImageUpload({
  onSuccess,
  onError,
}: HeroImageUploadProps) {
  const t = useTranslations("admin.pages");
  const tHome = useTranslations("home.hero");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const { data: heroData } = useHeroImage();
  const uploadMutation = useUploadHeroImage();
  const deleteMutation = useDeleteHeroImage();

  const imageUrl = localPreview ?? heroData?.imageUrl ?? null;
  const isBusy = uploadMutation.isPending || deleteMutation.isPending;

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setLocalPreview(previewUrl);

    try {
      await uploadMutation.mutateAsync(file);
      URL.revokeObjectURL(previewUrl);
      setLocalPreview(null);
      onSuccess?.(t("uploadSuccess"));
    } catch {
      URL.revokeObjectURL(previewUrl);
      setLocalPreview(null);
      onError?.(t("uploadError"));
    }
  };

  const handleReset = async () => {
    try {
      await deleteMutation.mutateAsync();
      setLocalPreview(null);
      onSuccess?.(t("resetSuccess"));
    } catch {
      onError?.(t("uploadError"));
    }
  };

  return (
    <div className="rounded-radius-lg border border-border-default bg-surface-card p-6 shadow-[0px_4px_12px_rgba(5,59,80,0.05)]">
      <div>
        <h3 className="font-kanit text-lg font-bold text-text-primary">
          {t("heroTitle")}
        </h3>
        <p className="mt-1 font-sarabun text-body-sm text-text-muted">
          {t("heroSubtitle")}
        </p>
      </div>

      <div
        className={`group relative mt-6 flex h-[200px] w-full items-center justify-center overflow-hidden rounded-radius-lg shadow-inner ${
          imageUrl
            ? "bg-surface-container"
            : "bg-gradient-to-r from-primary to-primary-container"
        }`}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="relative z-10 px-4 text-center">
            <h2 className="font-kanit text-3xl font-bold text-white drop-shadow-md">
              {tHome("heading")}
            </h2>
            <p className="mt-2 font-sarabun text-body-sm text-white/80">
              {tHome("subheading")}
            </p>
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="rounded-radius-full bg-black/40 px-3 py-1.5 font-sarabun text-caption font-semibold text-white backdrop-blur-sm">
            {t("heroPreview")}
          </span>
        </div>
      </div>

      <div className="mt-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
            disabled={isBusy}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isBusy}
            className="inline-flex items-center justify-center gap-2 rounded-radius-md border-2 border-primary px-6 py-2 font-sarabun text-label font-semibold text-primary transition-colors hover:bg-primary/5 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <UploadIcon />
            {t("heroUpload")}
          </button>
          <span className="max-w-xs font-sarabun text-caption text-text-muted">
            {t("heroHint")}
          </span>
        </div>

        <button
          type="button"
          onClick={handleReset}
          disabled={isBusy || !imageUrl}
          className="inline-flex items-center gap-1 font-sarabun text-body-sm font-semibold text-error transition-all hover:underline disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshIcon />
          {t("heroReset")}
        </button>
      </div>
    </div>
  );
}
