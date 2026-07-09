"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import CategoryTreePicker from "@/components/dataset/CategoryTreePicker";
import {
  datasetFormSchema,
  type DatasetFormValues,
} from "@/components/dataset/datasetFormSchema";
import FileUploadZone from "@/components/dataset/FileUploadZone";
import PIIWarning from "@/components/dataset/PIIWarning";
import TagInput from "@/components/dataset/TagInput";
import type { AgencyDatasetFormInitial } from "@/types/dataset";
import { THAI_PROVINCES } from "@/data/thaiProvinces";
import { useCategorySuggestedTags } from "@/hooks/useCategorySuggestedTags";
import { usePIIScan } from "@/hooks/usePIIScan";
import { useUpdateDataset } from "@/hooks/useUpdateDataset";
import { useUploadDataset } from "@/hooks/useUploadDataset";
import apiClient from "@/services/api";
import { useAuthStore } from "@/stores/useAuthStore";
import type { PIIFinding, PIIScanResult } from "@/types/pii";
import { fetchDatasetFormInitial } from "@/utils/datasetFormApi";

type DatasetFormProps = {
  mode: "create" | "edit";
  datasetId?: string;
  theme?: "agency";
};

const inputClassBase =
  "w-full rounded-xl border border-border-input bg-surface-page px-4 py-3 font-sarabun text-label text-text-primary outline-none transition-all";
const ALL_PROVINCES_VALUE = "all";

export default function DatasetForm({ mode, datasetId, theme }: DatasetFormProps) {
  const t = useTranslations("agency.upload");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const base = `/${locale}`;
  const isThai = locale === "th";
  const userRole = useAuthStore((s) => s.user?.role);
  const isGreen = theme === "agency";
  const cPrimary = isGreen ? "#01579b" : "#053F5C";
  const cAccent = isGreen ? "#0277bd" : "#0081A7";
  const inputClass = isGreen
    ? `${inputClassBase} focus:border-[#0277bd] focus:ring-2 focus:ring-[#0277bd]/20`
    : `${inputClassBase} focus:border-[#0081A7] focus:ring-2 focus:ring-[#0081A7]/20`;
  const { scanFile } = usePIIScan();

  const { data: initialFromApi, isLoading: isLoadingInitial } = useQuery({
    queryKey: ["datasets", datasetId, "form"],
    queryFn: () => fetchDatasetFormInitial(datasetId!),
    enabled: mode === "edit" && !!datasetId,
    retry: 1,
  });

  const initialData = useMemo((): AgencyDatasetFormInitial | null => {
    if (mode !== "edit") {
      return null;
    }
    return initialFromApi ?? null;
  }, [mode, initialFromApi]);

  const [selectedFiles, setSelectedFiles] = useState<{ file: File; analysis: PIIScanResult }[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [provinceQuery, setProvinceQuery] = useState("");
  const [provinceDropdownOpen, setProvinceDropdownOpen] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"draft" | "published" | null>(
    null
  );
  const submitStatusRef = useRef<"draft" | "published" | null>(null);
  const provinceWrapperRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (initialData?.image_url) {
      setExistingImageUrl(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? ""}${initialData.image_url}`);
    }
  }, [initialData]);

  const handleImageSelect = (file: File | null) => {
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) return;
    if (file.size > 10 * 1024 * 1024) return;
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setExistingImageUrl(null);
  };

  const uploadImageForDataset = async (id: string) => {
    if (!selectedImage) return;
    const formData = new FormData();
    formData.append("file", selectedImage);
    await apiClient.post(`/datasets/${id}/image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  };

  const uploadMutation = useUploadDataset();
  const updateMutation = useUpdateDataset();
  const isSubmitting =
    uploadMutation.isPending ||
    updateMutation.isPending;

  const emptyDefaults: DatasetFormValues = {
    title: "",
    description: "",
    categoryId: "",
    license: "open",
    tags: [],
    yearStart: new Date().getFullYear() + 543,
    yearEnd: undefined,
    province: ALL_PROVINCES_VALUE,
  };

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    reset,
    formState: { errors },
  } = useForm<DatasetFormValues>({
    resolver: zodResolver(datasetFormSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: initialData ?? emptyDefaults,
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const selectedProvince = watch("province");
  const categoryId = watch("categoryId");

  const { data: suggestedTags = [] } = useCategorySuggestedTags(
    mode === "create" ? categoryId || undefined : undefined
  );

  useEffect(() => {
    if (mode !== "create" || !categoryId) {
      return;
    }
    const existingTags = getValues("tags") ?? [];
    if (existingTags.length > 0) {
      return;
    }
    setValue("tags", suggestedTags.slice(0, 10), { shouldDirty: true });
  }, [categoryId, suggestedTags, mode, setValue, getValues]);

  useEffect(() => {
    const selected = THAI_PROVINCES.find(
      (item) => item.value === selectedProvince
    );
    if (selectedProvince === ALL_PROVINCES_VALUE) {
      setProvinceQuery(
        isThai ? t("provinceAllLabelTh") : t("provinceAllLabelEn")
      );
      return;
    }
    if (selected) {
      setProvinceQuery(isThai ? selected.labelTh : selected.labelEn);
    }
  }, [isThai, selectedProvince, t]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        provinceWrapperRef.current &&
        !provinceWrapperRef.current.contains(event.target as Node)
      ) {
        setProvinceDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fiscalYears = useMemo(() => {
    const currentBuddhistYear = new Date().getFullYear() + 543;
    return Array.from({ length: 101 }, (_, index) => 2500 + index);
  }, []);

  const provinceOptions = useMemo(
    () =>
      THAI_PROVINCES.map((province) => ({
        value: province.value,
        label: isThai ? province.labelTh : province.labelEn,
      })),
    [isThai]
  );

  const filteredProvinceOptions = useMemo(() => {
    const query = provinceQuery.trim().toLowerCase();
    const options = provinceOptions.filter((province) => {
      const label = province.label.toLowerCase();
      if (!query) {
        return true;
      }
      if (query.length <= 1) {
        return label.startsWith(query);
      }
      return label.includes(query);
    });
    return options.slice(0, 5);
  }, [provinceOptions, provinceQuery]);

  const [yearStartOpen, setYearStartOpen] = useState(false);
  const [yearEndOpen, setYearEndOpen] = useState(false);
  const watchedYearStart = watch("yearStart");
  const watchedYearEnd = watch("yearEnd");

  if (mode === "edit" && datasetId && isLoadingInitial) {
    return (
      <div className="rounded-2xl border border-border-default bg-surface-card p-8 text-center">
        <p className="font-sarabun text-body-md text-text-secondary">
          {tCommon("loading")}
        </p>
      </div>
    );
  }

  if (mode === "edit" && datasetId && !initialData) {
    return (
      <div className="rounded-2xl border border-border-default bg-surface-card p-8 text-center">
        <p className="font-sarabun text-body-md text-text-secondary">
          {t("notFound")}
        </p>
        <Link
          href={`${base}/datasets`}
          className={`mt-4 inline-block font-sarabun text-label hover:underline ${isGreen ? "text-[#0277bd]" : "text-[#0081A7]"}`}
        >
          {t("backToList")}
        </Link>
      </div>
    );
  }

  const allPiiFindings: PIIFinding[] = selectedFiles.flatMap((f) => f.analysis?.findings ?? []);
  const hasPii = allPiiFindings.length > 0;

  const handleSelectProvince = (value: string) => {
    setValue("province", value, { shouldValidate: true, shouldDirty: true });
    const selected = THAI_PROVINCES.find((item) => item.value === value);
    if (value === ALL_PROVINCES_VALUE) {
      setProvinceQuery(
        isThai ? t("provinceAllLabelTh") : t("provinceAllLabelEn")
      );
    } else if (selected) {
      setProvinceQuery(isThai ? selected.labelTh : selected.labelEn);
    }
    setProvinceDropdownOpen(false);
  };

  const clearProvince = () => {
    setValue("province", ALL_PROVINCES_VALUE, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setProvinceQuery("");
    setProvinceDropdownOpen(false);
  };

  const buildFormData = (
    values: DatasetFormValues,
    status: "draft" | "published"
  ) => {
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("description", values.description);
    formData.append("categoryId", values.categoryId);
    formData.append("license", values.license);
    formData.append("status", status);
    values.tags.forEach((tag) => formData.append("tags[]", tag));
    if (values.yearStart !== undefined) {
      formData.append("year_start", String(values.yearStart));
    }
    if (values.yearEnd !== undefined) {
      formData.append("year_end", String(values.yearEnd));
    }
    if (values.province) {
      formData.append("province", values.province);
    }
    for (const { file } of selectedFiles) {
      formData.append("file", file);
    }
    return formData;
  };

  const onSubmit = async (
    values: DatasetFormValues,
    status: "draft" | "published"
  ) => {
    if (mode === "create" && selectedFiles.length === 0) {
      setFileError(t("fileRequired"));
      return;
    }
    setFileError(null);
    setSubmitStatus(status);
    const formData = buildFormData(values, status);

    try {
      let id = datasetId;
      if (mode === "create") {
        const result = await uploadMutation.mutateAsync(formData);
        id = result.id;
      } else if (datasetId) {
        await updateMutation.mutateAsync({ id: datasetId, formData });
        if (selectedFiles.length > 0) {
          const fileForm = new FormData();
          for (const { file } of selectedFiles) {
            fileForm.append("file", file);
          }
          await apiClient.post(`/datasets/${datasetId}/files`, fileForm, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }
      }
      if (id) await uploadImageForDataset(id);
      if (userRole === "admin") {
        router.push(`${base}/admin/datasets`);
      } else {
        router.push(`${base}/datasets`);
      }
    } catch {
      // Errors surfaced via mutation state / API interceptor
    }
  };

  const handleAnalyzed = (result: PIIScanResult, file: File) => {
    setSelectedFiles((prev) => {
      if (prev.some((f) => f.file.name === file.name && f.file.size === file.size)) {
        return prev;
      }
      return [...prev, { file, analysis: result }];
    });
    setFileError(null);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="mx-auto max-w-[800px] space-y-8 pb-24">
      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-2 font-sarabun text-caption uppercase tracking-wider text-text-muted">
        <Link href={`${base}/dashboard`} className={isGreen ? "hover:text-[#0277bd]" : "hover:text-[#0081A7]"}>
          {t("breadcrumbDashboard")}
        </Link>
        <span>›</span>
        <Link href={`${base}/datasets`} className={isGreen ? "hover:text-[#0277bd]" : "hover:text-[#0081A7]"}>
          {t("breadcrumbDatasets")}
        </Link>
        <span>›</span>
        <span className={`font-semibold ${isGreen ? "text-[#01579b]" : "text-[#053F5C]"}`}>
          {mode === "create" ? t("breadcrumbCurrent") : t("breadcrumbEdit")}
        </span>
      </nav>

      <h1 className={`font-kanit text-[32px] font-bold ${isGreen ? "text-[#01579b]" : "text-[#053F5C]"}`}>
        {mode === "create" ? t("title") : t("editTitle")}
      </h1>

      {/* Step 1 — File Upload */}
      <section className={`rounded-2xl border ${isGreen ? "border-[#0277bd]/8" : "border-[#0081A7]/8"} bg-white/95 p-8 shadow-xl shadow-black/5 backdrop-blur-sm`}>
        <div className="mb-6 flex items-center gap-3">
          <span className={`flex h-8 w-8 items-center justify-center rounded-full font-sarabun text-label font-bold text-white ${isGreen ? "bg-[#01579b]" : "bg-[#053F5C]"}`}>
            1
          </span>
          <h2 className={`font-kanit text-heading-3-mobile font-semibold ${isGreen ? "text-[#01579b]" : "text-[#053F5C]"}`}>
            {t("fileSection")}
          </h2>
        </div>
        {selectedFiles.length > 0 && (
          <div className="mb-4 space-y-3">
            {selectedFiles.map((entry, index) => {
              const filePii = entry.analysis?.findings ?? [];
              const fileHasPii = filePii.length > 0;
              const qs = entry.analysis?.quality_score;
              return (
                <div key={`${entry.file.name}-${index}`} className={`rounded-xl border ${isGreen ? "border-[#0277bd]/10" : "border-[#0081A7]/10"} bg-slate-50 p-4 transition-colors hover:bg-slate-100/80`}>
                  <div className="flex items-center gap-3">
                    <svg className={`h-5 w-5 shrink-0 ${isGreen ? "text-[#0277bd]" : "text-[#0081A7]"}`} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                    </svg>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-sarabun text-label font-medium text-text-primary">
                        {entry.file.name}
                      </p>
                      <p className="font-sarabun text-caption text-text-muted">
                        {(entry.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    {fileHasPii ? (
                      <span className="rounded-full bg-red-100 px-2.5 py-0.5 font-sarabun text-caption font-bold text-status-error">
                        PII
                      </span>
                    ) : (
                      <span className="rounded-full bg-green-100 px-2.5 py-0.5 font-sarabun text-caption font-bold text-status-success">
                        ✓
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="shrink-0 rounded-full p-1 text-text-muted hover:bg-red-50 hover:text-status-error"
                      aria-label="ลบไฟล์"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                      </svg>
                    </button>
                  </div>
                  {qs !== null && qs !== undefined && (
                    <div className="mt-3 flex items-center gap-3">
                      <div className="h-2 flex-1 rounded-full bg-surface-container">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            qs >= 80 ? "bg-status-success" : qs >= 50 ? "bg-[#f57c00]" : "bg-status-error"
                          }`}
                          style={{ width: `${Math.min(100, Math.max(0, qs))}%` }}
                        />
                      </div>
                      <span className={`font-sarabun text-caption font-bold ${
                        qs >= 80 ? "text-status-success" : qs >= 50 ? "text-[#f57c00]" : "text-status-error"
                      }`}>
                        {qs}%
                      </span>
                    </div>
                  )}
                  {fileHasPii && (
                    <div className="mt-2">
                      <PIIWarning findings={filePii} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {mode === "edit" && initialData?.fileInfo && selectedFiles.length === 0 ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
              <svg className="h-5 w-5 shrink-0 text-text-muted" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
              </svg>
              <div className="min-w-0 flex-1">
                <p className="truncate font-sarabun text-label font-medium text-text-primary">
                  {initialData.fileInfo.file_name}
                </p>
                <p className="font-sarabun text-caption text-text-muted">
                  {(initialData.fileInfo.file_size / 1024 / 1024).toFixed(2)} MB · {initialData.fileInfo.file_format.toUpperCase()}
                </p>
              </div>
              <span className="rounded-full bg-gray-200 px-2.5 py-0.5 font-sarabun text-caption text-text-muted">
                ไฟล์ปัจจุบัน
              </span>
            </div>
            <FileUploadZone onAnalyzed={handleAnalyzed} disabled={isSubmitting} multiple theme={theme} />
            <p className="font-sarabun text-caption text-text-muted">อัปโหลดไฟล์ใหม่เพื่อแทนที่ไฟล์เดิม</p>
          </div>
        ) : (
          <FileUploadZone onAnalyzed={handleAnalyzed} disabled={isSubmitting} multiple theme={theme} />
        )}
        {fileError && (
          <p className="mt-2 font-sarabun text-caption text-status-error">
            {fileError}
          </p>
        )}
      </section>

      {/* Step 2 — Dataset Info */}
      <form
        onSubmit={handleSubmit((values) => {
          const status = submitStatusRef.current;
          if (!status) {
            return;
          }
          void onSubmit(values, status);
        })}
        className="space-y-8"
      >
        <section className={`rounded-2xl border ${isGreen ? "border-[#0277bd]/8" : "border-[#0081A7]/8"} bg-white/95 p-8 shadow-xl shadow-black/5 backdrop-blur-sm`}>
          <div className="mb-6 flex items-center gap-3">
            <span className={`flex h-8 w-8 items-center justify-center rounded-full font-sarabun text-label font-bold text-white ${isGreen ? "bg-[#01579b]" : "bg-[#053F5C]"}`}>
              2
            </span>
            <h2 className={`font-kanit text-heading-3-mobile font-semibold ${isGreen ? "text-[#01579b]" : "text-[#053F5C]"}`}>
              {t("dataSection")}
            </h2>
          </div>
          <div className="space-y-6">
            <div>
              <label className="mb-2 block font-sarabun text-label font-medium text-text-secondary">
                {t("fieldTitle")} *
              </label>
              <input
                type="text"
                className={inputClass}
                placeholder={t("fieldTitlePlaceholder")}
                {...register("title")}
              />
              {errors.title && (
                <p className="mt-1 font-sarabun text-caption text-status-error">
                  {t("fieldTitleError")}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block font-sarabun text-label font-medium text-text-secondary">
                {t("fieldDescription")} *
              </label>
              <textarea
                rows={4}
                className={`${inputClass} resize-y min-h-[120px]`}
                placeholder={t("fieldDescriptionPlaceholder")}
                {...register("description")}
              />
              {errors.description && (
                <p className="mt-1 font-sarabun text-caption text-status-error">
                  {t("fieldDescriptionError")}
                </p>
              )}
            </div>

            <CategoryTreePicker
              control={control}
              errors={{
                categoryId: errors.categoryId,
              }}
            />

            <div>
              <label className="mb-2 block font-sarabun text-label font-medium text-text-secondary">
                {t("fieldTags")}
              </label>
              <Controller
                name="tags"
                control={control}
                render={({ field }) => (
                  <TagInput
                    value={field.value ?? []}
                    onChange={field.onChange}
                    error={errors.tags?.message ? t("fieldTagsMax") : undefined}
                    suggestions={suggestedTags}
                    suggestionsHint={
                      suggestedTags.length > 0 ? t("fieldTagsCategoryHint") : undefined
                    }
                  />
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-sarabun text-label font-medium text-text-secondary">
                  {t("fieldYearStart")} *
                </label>
                <div className="relative">
                  <input type="hidden" {...register("yearStart")} />
                  <button
                    type="button"
                    onClick={() => { setYearStartOpen((v) => !v); setYearEndOpen(false); }}
                    onBlur={() => setTimeout(() => setYearStartOpen(false), 150)}
                    className={`${inputClass} flex cursor-pointer items-center justify-between pr-10 text-left`}
                  >
                    <span>{watchedYearStart || fiscalYears[0]}</span>
                    <svg className={`absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted transition-transform ${yearStartOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" /></svg>
                  </button>
                  {yearStartOpen && (
                    <div className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-border-default/60 bg-white py-1 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                      {fiscalYears.map((year) => (
                        <button
                          key={year}
                          type="button"
                          onMouseDown={() => {
                            setValue("yearStart", year, { shouldValidate: true, shouldDirty: true });
                            setYearStartOpen(false);
                          }}
                          className={`flex w-full items-center px-4 py-2 font-sarabun text-label transition-colors hover:bg-primary-light/50 ${
                            Number(watchedYearStart) === year ? "font-semibold text-primary-dark" : "text-text-primary"
                          }`}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {errors.yearStart && (
                  <p className="mt-1 font-sarabun text-caption text-status-error">
                    {t("fieldYearStartError")}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-2 block font-sarabun text-label font-medium text-text-secondary">
                  {t("fieldYearEnd")}
                </label>
                <div className="relative">
                  <input type="hidden" {...register("yearEnd")} />
                  <button
                    type="button"
                    onClick={() => { setYearEndOpen((v) => !v); setYearStartOpen(false); }}
                    onBlur={() => setTimeout(() => setYearEndOpen(false), 150)}
                    className={`${inputClass} flex cursor-pointer items-center justify-between pr-10 text-left`}
                  >
                    <span>{watchedYearEnd ? watchedYearEnd : t("fieldYearEndOptional")}</span>
                    <svg className={`absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted transition-transform ${yearEndOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" /></svg>
                  </button>
                  {yearEndOpen && (
                    <div className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-border-default/60 bg-white py-1 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                      <button
                        type="button"
                        onMouseDown={() => {
                          setValue("yearEnd", undefined as unknown as number, { shouldValidate: true, shouldDirty: true });
                          setYearEndOpen(false);
                        }}
                        className={`flex w-full items-center px-4 py-2 font-sarabun text-label transition-colors hover:bg-primary-light/50 ${
                          !watchedYearEnd ? "font-semibold text-primary-dark" : "text-text-primary"
                        }`}
                      >
                        {t("fieldYearEndOptional")}
                      </button>
                      {fiscalYears.map((year) => (
                        <button
                          key={year}
                          type="button"
                          onMouseDown={() => {
                            setValue("yearEnd", year, { shouldValidate: true, shouldDirty: true });
                            setYearEndOpen(false);
                          }}
                          className={`flex w-full items-center px-4 py-2 font-sarabun text-label transition-colors hover:bg-primary-light/50 ${
                            Number(watchedYearEnd) === year ? "font-semibold text-primary-dark" : "text-text-primary"
                          }`}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {errors.yearEnd && (
                  <p className="mt-1 font-sarabun text-caption text-status-error">
                    {errors.yearEnd.message === "yearEndBeforeStart"
                      ? t("fieldYearEndBeforeStartError")
                      : t("fieldYearRangeError")}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-2 block font-sarabun text-label font-medium text-text-secondary">
                {t("fieldProvince")}
              </label>
              <div ref={provinceWrapperRef} className="relative">
                <input type="hidden" {...register("province")} />
                <input
                  type="text"
                  className={inputClass}
                  placeholder={t("fieldProvinceSearchPlaceholder")}
                  value={provinceQuery}
                  onFocus={() => setProvinceDropdownOpen(true)}
                  onChange={(event) => {
                    setProvinceQuery(event.target.value);
                    setProvinceDropdownOpen(true);
                  }}
                />
                {provinceQuery ? (
                  <button
                    type="button"
                    onClick={clearProvince}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-text-muted/15 text-text-muted transition-colors hover:bg-text-muted/30 hover:text-text-primary"
                    aria-label={t("fieldProvinceClear")}
                  >
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
                  </button>
                ) : null}
                {provinceDropdownOpen ? (
                  <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-border-default bg-surface-card shadow-level-2">
                    <button
                      type="button"
                      onClick={() => handleSelectProvince(ALL_PROVINCES_VALUE)}
                      className="block w-full px-4 py-2.5 text-left font-sarabun text-label text-text-primary hover:bg-surface-container"
                    >
                      {isThai ? t("provinceAllLabelTh") : t("provinceAllLabelEn")}
                    </button>
                    {filteredProvinceOptions.map((province) => (
                      <button
                        key={province.value}
                        type="button"
                        onClick={() => handleSelectProvince(province.value)}
                        className="block w-full px-4 py-2.5 text-left font-sarabun text-label text-text-primary hover:bg-surface-container"
                      >
                        {province.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        {/* Image upload (optional) */}
        <section className={`rounded-2xl border ${isGreen ? "border-[#0277bd]/8" : "border-[#0081A7]/8"} bg-white/95 p-6 shadow-xl shadow-black/5 backdrop-blur-sm`}>
          <h3 className={`mb-4 flex items-center gap-2 font-kanit text-heading-3-mobile font-bold ${isGreen ? "text-[#01579b]" : "text-[#053F5C]"}`}>
            <svg className={`h-5 w-5 ${isGreen ? "text-[#0277bd]" : "text-[#0081A7]"}`} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
            </svg>
            รูปภาพปก
            <span className="font-sarabun text-caption font-normal text-text-muted">(ไม่บังคับ)</span>
          </h3>

          {imagePreview || existingImageUrl ? (
            <div className="space-y-3">
              <div className="relative overflow-hidden rounded-2xl border border-border-default/40">
                <img
                  src={imagePreview ?? existingImageUrl!}
                  alt="preview"
                  className="h-48 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview(null);
                    setExistingImageUrl(null);
                  }}
                  className="absolute right-3 top-3 rounded-full bg-black/50 p-1.5 text-white transition-colors hover:bg-black/70"
                  aria-label="ลบรูป"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                </button>
              </div>
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className={`font-sarabun text-label hover:underline ${isGreen ? "text-[#0277bd]" : "text-[#0081A7]"}`}
              >
                เปลี่ยนรูป
              </button>
            </div>
          ) : (
            <div
              onClick={() => imageInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-surface-page px-6 py-10 text-center transition-colors ${isGreen ? "border-[#0277bd]/30 hover:border-[#0277bd]/50 hover:bg-[#0277bd]/5" : "border-[#0081A7]/30 hover:border-[#0081A7]/50 hover:bg-[#0081A7]/5"}`}
            >
              <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full ${isGreen ? "bg-[#0277bd]/10 text-[#0277bd]" : "bg-[#0081A7]/10 text-[#0081A7]"}`}>
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                </svg>
              </div>
              <p className="font-sarabun text-label font-medium text-text-primary">
                คลิกเพื่อเลือกรูปภาพปก
              </p>
              <p className="mt-1 font-sarabun text-caption text-text-muted">
                JPG, PNG, WebP · สูงสุด 10MB
              </p>
            </div>
          )}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              handleImageSelect(e.target.files?.[0] ?? null);
              e.target.value = "";
            }}
          />
        </section>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-end gap-4 border-t border-border-default/30 pt-6">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="rounded-full border-2 border-red-200 px-8 py-2.5 font-sarabun text-label font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
          >
            {t("cancel")}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            onClick={() => { submitStatusRef.current = "draft"; setSubmitStatus("draft"); }}
            className={`rounded-full border-2 px-8 py-2.5 font-sarabun text-label font-semibold transition-colors disabled:opacity-50 ${isGreen ? "border-[#0277bd]/30 text-[#01579b] hover:bg-[#0277bd]/5" : "border-[#0081A7]/30 text-[#053F5C] hover:bg-[#0081A7]/5"}`}
          >
            {isSubmitting && submitStatus === "draft" && <Spinner />}
            {t("saveDraft")}
          </button>
          <div className="flex flex-col items-end gap-1">
            <button
              type="submit"
              disabled={isSubmitting || hasPii}
              onClick={() => { submitStatusRef.current = "published"; setSubmitStatus("published"); }}
              className={`inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r px-10 py-2.5 font-sarabun text-label font-bold text-white shadow-lg transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 ${isGreen ? "from-[#01579b] to-[#0277bd]" : "from-[#053F5C] to-[#0081A7]"}`}
            >
              {isSubmitting && submitStatus === "published" && <Spinner />}
              {t("publish")}
            </button>
            {hasPii && (
              <p className="font-sarabun text-caption text-status-error">
                {t("piiBlockPublish")}
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin text-current"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
