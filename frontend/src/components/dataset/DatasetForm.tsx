"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import CascadingCategorySelect from "@/components/dataset/CascadingCategorySelect";
import {
  datasetFormSchema,
  type DatasetFormValues,
} from "@/components/dataset/datasetFormSchema";
import FileUploadZone from "@/components/dataset/FileUploadZone";
import PIIWarning from "@/components/dataset/PIIWarning";
import QualityScoreCard from "@/components/dataset/QualityScoreCard";
import TagInput from "@/components/dataset/TagInput";
import {
  fetchMockFileAnalysis,
  getAgencyDatasetFormInitial,
  mockFileAnalysisResult,
  mockProvinces,
  type AgencyDatasetFormInitial,
  type FileAnalysisResult,
} from "@/data/mockData";
import { useUpdateDataset } from "@/hooks/useUpdateDataset";
import { useUploadDataset } from "@/hooks/useUploadDataset";

type DatasetFormProps = {
  mode: "create" | "edit";
  datasetId?: string;
};

const inputClass =
  "w-full rounded-radius-md border border-border-input bg-surface-page px-4 py-3 font-sarabun text-label text-text-primary outline-none transition-all focus:border-border-focus focus:ring-2 focus:ring-primary-dark/20";

export default function DatasetForm({ mode, datasetId }: DatasetFormProps) {
  const t = useTranslations("agency.upload");
  const locale = useLocale();
  const router = useRouter();
  const base = `/${locale}`;

  const initialData = useMemo(() => {
    if (mode === "edit" && datasetId) {
      return getAgencyDatasetFormInitial(datasetId);
    }
    return null;
  }, [mode, datasetId]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<FileAnalysisResult | null>(
    mode === "edit" ? mockFileAnalysisResult : null
  );
  const [fileError, setFileError] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<"draft" | "submitted" | null>(
    null
  );

  const uploadMutation = useUploadDataset();
  const updateMutation = useUpdateDataset();
  const isSubmitting = uploadMutation.isPending || updateMutation.isPending;

  const emptyDefaults: DatasetFormValues = {
    title: "",
    description: "",
    categoryLevel1: "",
    categoryLevel2: "",
    license: "open",
    tags: [],
    year: 2567,
    province: "all",
  };

  const {
    register,
    control,
    handleSubmit,
    setValue,
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

  const piiColumns =
    locale === "th"
      ? (analysis?.piiColumnsTh ?? [])
      : (analysis?.piiColumnsEn ?? []);

  const buildFormData = (
    values: DatasetFormValues,
    status: "draft" | "submitted"
  ) => {
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("description", values.description);
    formData.append("categoryLevel1", values.categoryLevel1);
    formData.append("categoryLevel2", values.categoryLevel2);
    formData.append("license", values.license);
    formData.append("status", status);
    values.tags.forEach((tag) => formData.append("tags[]", tag));
    if (values.year !== undefined) {
      formData.append("year", String(values.year));
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
    status: "draft" | "submitted"
  ) => {
    if (mode === "create" && !selectedFile && !analysis) {
      setFileError(t("fileRequired"));
      return;
    }
    setFileError(null);
    setSubmitStatus(status);
    const formData = buildFormData(values, status);

    if (mode === "create") {
      await uploadMutation.mutateAsync(formData);
      return;
    }

    if (datasetId) {
      await updateMutation.mutateAsync({ id: datasetId, formData });
    }
  };

  const handleAnalyzed = (result: FileAnalysisResult, file: File) => {
    setAnalysis(result);
    setSelectedFile(file);
    setFileError(null);
  };

  const handleEditFileReanalyze = async () => {
    const result = await fetchMockFileAnalysis();
    setAnalysis(result);
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
            onClick={() => void handleEditFileReanalyze()}
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
        {analysis && (
          <div className="mt-spacing-6 grid grid-cols-1 gap-spacing-6 md:grid-cols-2">
            <QualityScoreCard score={analysis.qualityScore} />
            <PIIWarning columns={piiColumns} />
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

            <CascadingCategorySelect
              control={control}
              setValue={setValue}
              errors={{
                categoryLevel1: errors.categoryLevel1,
                categoryLevel2: errors.categoryLevel2,
              }}
            />

            <div>
              <label className="mb-2 block font-sarabun text-label text-text-secondary">
                {t("fieldLicense")} *
              </label>
              <select className={inputClass} {...register("license")}>
                <option value="open">{t("licenseOpen")}</option>
                <option value="conditional">{t("licenseConditional")}</option>
                <option value="cc">{t("licenseCc")}</option>
              </select>
              {errors.license && (
                <p className="mt-1 font-sarabun text-caption text-status-error">
                  {t("fieldLicenseError")}
                </p>
              )}
            </div>

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
                  />
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-spacing-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-sarabun text-label text-text-secondary">
                  {t("fieldYear")}
                </label>
                <input
                  type="number"
                  className={inputClass}
                  {...register("year")}
                />
              </div>
              <div>
                <label className="mb-2 block font-sarabun text-label text-text-secondary">
                  {t("fieldProvince")}
                </label>
                <select className={inputClass} {...register("province")}>
                  {mockProvinces.map((province) => (
                    <option key={province.value} value={province.value}>
                      {locale === "th" ? province.labelTh : province.labelEn}
                    </option>
                  ))}
                </select>
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
          <button
            type="submit"
            disabled={isSubmitting}
            onClick={() => setSubmitStatus("submitted")}
            className="inline-flex items-center justify-center gap-2 rounded-radius-xl bg-primary px-10 py-2.5 font-sarabun text-label font-medium text-surface-card shadow-level-1 transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting && submitStatus === "submitted" && <Spinner />}
            {t("submitForApproval")}
          </button>
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
