"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  useDeleteHeroImage,
  useHeroImage,
  useUploadHeroImage,
} from "@/hooks/useHeroImage";

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
    if (!file) return;

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
    <div className="group relative overflow-hidden rounded-2xl shadow-lg">
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
        disabled={isBusy}
      />

      <div
        className={`relative flex h-[340px] w-full items-end overflow-hidden ${
          imageUrl ? "bg-gray-900" : "bg-gradient-to-r from-primary to-primary-container"
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
          <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
            <div>
              <h2 className="font-kanit text-4xl font-bold text-white drop-shadow-md">
                {tHome("heading")}
              </h2>
              <p className="mt-3 font-sarabun text-body-md text-white/80">
                {tHome("subheading")}
              </p>
            </div>
          </div>
        )}

        {/* Bottom overlay with info + buttons */}
        <div className="relative z-10 flex w-full items-end justify-between bg-gradient-to-t from-black/70 to-transparent px-8 pb-6 pt-16">
          <div>
            <span className="mb-2 inline-block rounded-md bg-emerald-500 px-3 py-1 font-sarabun text-body-sm font-bold uppercase tracking-wider text-white">
              {t("activeBackground")}
            </span>
            <p className="font-sarabun text-lg font-semibold text-white">
              {t("defaultHeroLabel")}
            </p>
            <p className="font-sarabun text-body-sm text-white/70">
              {t("lastModified", { date: "Oct 24, 2023" })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isBusy}
              className="inline-flex items-center gap-2 rounded-full border-2 border-white/80 bg-white/10 px-5 py-2 font-sarabun text-body-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 disabled:opacity-50"
            >
              <UploadIcon />
              {t("uploadNew")}
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={isBusy || !imageUrl}
              className="rounded-full border border-white/40 bg-white/10 px-5 py-2 font-sarabun text-body-sm font-medium text-white/80 backdrop-blur-sm transition-all hover:bg-white/20 disabled:opacity-40"
            >
              {t("heroReset")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function UploadIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  );
}
