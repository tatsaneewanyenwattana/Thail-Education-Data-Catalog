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
import { type AgencyDatasetFormInitial } from "@/data/mockData";
import { THAI_PROVINCES } from "@/data/thaiProvinces";
import { useCategorySuggestedTags } from "@/hooks/useCategorySuggestedTags";
import { usePIIScan } from "@/hooks/usePIIScan";
import { useUpdateDataset } from "@/hooks/useUpdateDataset";
import { useUploadDataset } from "@/hooks/useUploadDataset";
import { useAuthStore } from "@/stores/useAuthStore";
import type { PIIFinding, PIIScanResult } from "@/types/pii";
import { fetchDatasetFormInitial } from "@/utils/datasetFormApi";

type DatasetFormProps = {
  mode: "create" | "edit";
  datasetId?: string;
};

const inputClass =
  "w-full rounded-radius-md border border-border-input bg-surface-page px-4 py-3 font-sarabun text-label text-text-primary outline-none transition-all focus:border-border-focus focus:ring-2 focus:ring-primary-dark/20";
const ALL_PROVINCES_VALUE = "all";

export default function DatasetForm({ mode, datasetId }: DatasetFormProps) {
  const t = useTranslations("agency.upload");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const base = `/${locale}`;
  const isThai = locale === "th";
  const userRole = useAuthStore((s) => s.user?.role);
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

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<PIIScanResult | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [provinceQuery, setProvinceQuery] = useState("");
  const [provinceDropdownOpen, setProvinceDropdownOpen] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"draft" | "published" | null>(
    null
  );
  const provinceWrapperRef = useRef<HTMLDivElement>(null);

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

  if (mode === "edit" && datasetId && isLoadingInitial) {
    return (
      <div className="rounded-radius-lg border border-border-default bg-surface-card p-8 text-center">
        <p className="font-sarabun text-body-md text-text-secondary">
          {tCommon("loading")}
        </p>
      </div>
    );
  }

  if (mode === "edit" && datasetId && !initialData) {
    return (
      <div className="rounded-radius-lg border border-border-default bg-surface-card p-8 text-center">
        <p className="font-sarabun text-body-md text-text-secondary">
          {t("notFound")}
        </p>
        <Link
          href={`${base}/datasets`}
          className="mt-4 inline-block font-sarabun text-label text-primary-dark hover:underline"
        >
          {t("backToList")}
        </Link>
      </div>
    );
  }

  const piiFindings: PIIFinding[] = analysis?.findings ?? [];
  const hasPii = piiFindings.length > 0;

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
    if (selectedFile) {
      formData.append("file", selectedFile);
    }
    return formData;
  };

  const onSubmit = async (
    values: DatasetFormValues,
    status: "draft" | "published"
  ) => {
    if (mode === "create" && !selectedFile && !analysis) {
      setFileError(t("fileRequired"));
      return;
    }
    setFileError(null);
    setSubmitStatus(status);
    const formData = buildFormData(values, status);

    try {
      if (mode === "create") {
        await uploadMutation.mutateAsync(formData);
      } else if (datasetId) {
        await updateMutation.mutateAsync({ id: datasetId, formData });
      }
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
    setAnalysis(result);
    setSelectedFile(file);
    setFileError(null);
  };

  const handleEditFileReanalyze = () => {
    setAnalysis(null);
  };

  return (
    <div className="mx-auto max-w-[800px] space-y-spacing-6 pb-24">
      <header className="border-b border-border-default/30 pb-spacing-6">
        <nav className="mb-2 flex flex-wrap items-center gap-2 font-sarabun text-label text-text-muted">
          <Link href={`${base}/dashboard`} className="hover:text-primary-dark">
            {t("breadcrumbDashboard")}
          </Link>
          <ChevronIcon />
          <Link href={`${base}/datasets`} className="hover:text-primary-dark">
            {t("breadcrumbDatasets")}
          </Link>
          <ChevronIcon />
          <span className="font-medium text-primary-dark">
            {mode === "create" ? t("breadcrumbCurrent") : t("breadcrumbEdit")}
          </span>
        </nav>
        <h1 className="font-kanit text-[28px] font-bold text-text-primary">
          {mode === "create" ? t("title") : t("editTitle")}
        </h1>
      </header>

      <section className="rounded-radius-lg border border-border-default bg-surface-card p-spacing-6 shadow-level-1">
        <h2 className="mb-spacing-6 font-kanit text-heading-3 font-semibold text-text-primary">
          {t("fileSection")}
        </h2>
        <FileUploadZone onAnalyzed={handleAnalyzed} disabled={isSubmitting} />
        {mode === "edit" && !selectedFile && (
          <button
            type="button"
            onClick={handleEditFileReanalyze}
            className="mt-2 font-sarabun text-label text-primary-dark hover:underline"
          >
            {t("replaceFile")}
          </button>
        )}
        {fileError && (
          <p className="mt-2 font-sarabun text-caption text-status-error">
            {fileError}
          </p>
        )}
        {analysis && hasPii && (
          <div className="-mx-spacing-6 mt-spacing-6">
            <PIIWarning findings={piiFindings} />
          </div>
        )}
      </section>

      <form
        onSubmit={handleSubmit((values) => {
          if (!submitStatus) {
            return;
          }
          void onSubmit(values, submitStatus);
        })}
        className="space-y-spacing-6"
      >
        <section className="rounded-radius-lg border border-border-default bg-surface-card p-spacing-6 shadow-level-1">
          <h2 className="mb-spacing-6 font-kanit text-heading-3 font-semibold text-text-primary">
            {t("dataSection")}
          </h2>
          <div className="space-y-6">
            <div>
              <label className="mb-2 block font-sarabun text-label text-text-secondary">
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
              <label className="mb-2 block font-sarabun text-label text-text-secondary">
                {t("fieldDescription")} *
              </label>
              <textarea
                rows={4}
                className={inputClass}
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
              <label className="mb-2 block font-sarabun text-label text-text-secondary">
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

            <div className="grid grid-cols-1 gap-spacing-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-sarabun text-label text-text-secondary">
                  {t("fieldYearStart")} *
                </label>
                <select className={inputClass} {...register("yearStart")}>
                  {fiscalYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                {errors.yearStart && (
                  <p className="mt-1 font-sarabun text-caption text-status-error">
                    {t("fieldYearStartError")}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-2 block font-sarabun text-label text-text-secondary">
                  {t("fieldYearEnd")}
                </label>
                <select className={inputClass} {...register("yearEnd")}>
                  <option value="">{t("fieldYearEndOptional")}</option>
                  {fiscalYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
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
              <label className="mb-2 block font-sarabun text-label text-text-secondary">
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 font-sarabun text-label text-text-muted hover:text-text-primary"
                    aria-label={t("fieldProvinceClear")}
                  >
                    x
                  </button>
                ) : null}
                {provinceDropdownOpen ? (
                  <div className="absolute z-20 mt-1 w-full rounded-radius-md border border-border-default bg-surface-card shadow-level-2">
                    <button
                      type="button"
                      onClick={() => handleSelectProvince(ALL_PROVINCES_VALUE)}
                      className="block w-full px-4 py-2 text-left font-sarabun text-label text-text-primary hover:bg-surface-container"
                    >
                      {isThai ? t("provinceAllLabelTh") : t("provinceAllLabelEn")}
                    </button>
                    {filteredProvinceOptions.map((province) => (
                      <button
                        key={province.value}
                        type="button"
                        onClick={() => handleSelectProvince(province.value)}
                        className="block w-full px-4 py-2 text-left font-sarabun text-label text-text-primary hover:bg-surface-container"
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

        <div className="flex flex-wrap justify-end gap-4 py-spacing-6">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="rounded-radius-xl border-2 border-primary-dark px-8 py-2.5 font-sarabun text-label font-medium text-primary-dark transition-colors hover:bg-primary-light disabled:opacity-50"
          >
            {t("cancel")}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            onClick={() => setSubmitStatus("draft")}
            className="inline-flex items-center justify-center gap-2 rounded-radius-xl border-2 border-primary-dark px-8 py-2.5 font-sarabun text-label font-medium text-primary-dark transition-colors hover:bg-primary-light disabled:opacity-50"
          >
            {isSubmitting && submitStatus === "draft" && <Spinner />}
            {t("saveDraft")}
          </button>
          <div className="flex flex-col items-end gap-1">
            <button
              type="submit"
              disabled={isSubmitting || hasPii}
              onClick={() => setSubmitStatus("published")}
              className="inline-flex items-center justify-center gap-2 rounded-radius-xl bg-primary px-10 py-2.5 font-sarabun text-label font-medium text-surface-card shadow-level-1 transition-opacity hover:opacity-90 disabled:opacity-50"
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

function ChevronIcon() {
  return (
    <svg className="h-4 w-4 text-text-muted" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
    </svg>
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
