"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  SCHOLARSHIP_TYPE_VALUES,
  TARGET_LEVEL_VALUES,
} from "@/components/scholarship/ScholarshipFilter";
import type { Scholarship } from "@/hooks/useScholarships";
import {
  useCreateScholarship,
  useUpdateScholarship,
} from "@/hooks/useManageScholarships";
import { toast } from "@/stores/toastStore";

export type ScholarshipFormValues = {
  title: string;
  description: string;
  scholarship_type: (typeof SCHOLARSHIP_TYPE_VALUES)[number];
  target_level: (typeof TARGET_LEVEL_VALUES)[number];
  eligibility: string;
  open_date: string;
  close_date: string;
  amount: number | null;
  amount_note?: string | null;
  application_url?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  status: "draft" | "published";
};

type ScholarshipFormProps = {
  mode: "create" | "edit";
  scholarshipId?: string;
  initialData?: Scholarship;
};

const inputClass =
  "w-full rounded-radius-md border border-border-input bg-surface-page px-4 py-3 font-sarabun text-label text-text-primary outline-none transition-all focus:border-border-focus focus:ring-2 focus:ring-primary-dark/20";

const labelClass =
  "mb-2 block font-sarabun text-label font-medium text-text-primary";

function toDateInputValue(value: string | null | undefined): string {
  if (!value) return "";
  return value.slice(0, 10);
}

function createScholarshipFormSchema(
  tValidation: (key: string) => string
) {
  return z
    .object({
      title: z.string().min(5, tValidation("titleMin")).max(500),
      description: z.string().min(1, tValidation("descriptionRequired")),
      scholarship_type: z.enum(SCHOLARSHIP_TYPE_VALUES),
      target_level: z.enum(TARGET_LEVEL_VALUES),
      eligibility: z.string().min(1, tValidation("eligibilityRequired")),
      open_date: z.string().min(1, tValidation("openDateRequired")),
      close_date: z.string().min(1, tValidation("closeDateRequired")),
      amount: z
        .union([z.coerce.number().nonnegative(), z.literal(""), z.null()])
        .optional()
        .transform((value) => (value === "" || value == null ? null : value)),
      amount_note: z.string().max(500).optional().nullable(),
      application_url: z.string().max(500).optional().nullable(),
      contact_phone: z.string().max(50).optional().nullable(),
      contact_email: z
        .string()
        .max(255)
        .optional()
        .nullable()
        .refine(
          (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
          tValidation("emailInvalid")
        ),
      status: z.enum(["draft", "published"]),
    })
    .refine((data) => data.close_date >= data.open_date, {
      message: tValidation("closeDateAfterOpen"),
      path: ["close_date"],
    });
}

export default function ScholarshipForm({
  mode,
  scholarshipId,
  initialData,
}: ScholarshipFormProps) {
  const locale = useLocale();
  const router = useRouter();
  const base = `/${locale}`;
  const tForm = useTranslations("scholarship.form");
  const tValidation = useTranslations("scholarship.form.validation");
  const tTypes = useTranslations("scholarship.types");
  const tLevels = useTranslations("scholarship.levels");

  const schema = useMemo(
    () => createScholarshipFormSchema(tValidation),
    [tValidation]
  );

  const createMutation = useCreateScholarship();
  const updateMutation = useUpdateScholarship();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isPublished = initialData?.status === "published";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ScholarshipFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      scholarship_type: "government",
      target_level: "bachelor",
      eligibility: "",
      open_date: "",
      close_date: "",
      amount: null,
      amount_note: "",
      application_url: "",
      contact_phone: "",
      contact_email: "",
      status: "draft",
    },
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      reset({
        title: initialData.title,
        description: initialData.description ?? "",
        scholarship_type: initialData.scholarship_type,
        target_level: initialData.target_level,
        eligibility: initialData.eligibility,
        open_date: toDateInputValue(initialData.open_date),
        close_date: toDateInputValue(initialData.close_date),
        amount: initialData.amount,
        amount_note: initialData.amount_note ?? "",
        application_url: initialData.application_url ?? "",
        contact_phone: initialData.contact_phone ?? "",
        contact_email: initialData.contact_email ?? "",
        status: initialData.status,
      });
    }
  }, [mode, initialData, reset]);

  const onSubmit = async (values: ScholarshipFormValues) => {
    const payload = {
      ...values,
      amount_note: values.amount_note || null,
      application_url: values.application_url || null,
      contact_phone: values.contact_phone || null,
      contact_email: values.contact_email || null,
    };

    try {
      if (mode === "create") {
        await createMutation.mutateAsync(payload);
        toast.success(tForm("createSuccess"));
      } else if (scholarshipId) {
        await updateMutation.mutateAsync({ id: scholarshipId, payload });
        toast.success(tForm("updateSuccess"));
      }
      router.push(`${base}/manage/scholarships`);
    } catch {
      toast.error(tForm("saveError"));
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="border-b border-border-default/20 pb-6">
        <h1 className="font-kanit text-[28px] font-bold text-text-primary">
          {mode === "create" ? tForm("createTitle") : tForm("editTitle")}
        </h1>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label htmlFor="title" className={labelClass}>
            {tForm("title")} *
          </label>
          <input id="title" className={inputClass} {...register("title")} />
          {errors.title && (
            <p className="mt-1 font-sarabun text-caption text-status-error">
              {errors.title.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="description" className={labelClass}>
            {tForm("description")} *
          </label>
          <textarea
            id="description"
            rows={4}
            className={inputClass}
            {...register("description")}
          />
          {errors.description && (
            <p className="mt-1 font-sarabun text-caption text-status-error">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="scholarship_type" className={labelClass}>
              {tForm("type")} *
            </label>
            <select
              id="scholarship_type"
              className={inputClass}
              {...register("scholarship_type")}
            >
              {SCHOLARSHIP_TYPE_VALUES.map((value) => (
                <option key={value} value={value}>
                  {tTypes(value)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="target_level" className={labelClass}>
              {tForm("level")} *
            </label>
            <select
              id="target_level"
              className={inputClass}
              {...register("target_level")}
            >
              {TARGET_LEVEL_VALUES.map((value) => (
                <option key={value} value={value}>
                  {tLevels(value)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="eligibility" className={labelClass}>
            {tForm("eligibility")} *
          </label>
          <textarea
            id="eligibility"
            rows={10}
            className={`${inputClass} min-h-[240px] resize-y`}
            {...register("eligibility")}
          />
          {errors.eligibility && (
            <p className="mt-1 font-sarabun text-caption text-status-error">
              {errors.eligibility.message}
            </p>
          )}
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="open_date" className={labelClass}>
              {tForm("openDate")} *
            </label>
            <input
              id="open_date"
              type="date"
              className={inputClass}
              {...register("open_date")}
            />
            {errors.open_date && (
              <p className="mt-1 font-sarabun text-caption text-status-error">
                {errors.open_date.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="close_date" className={labelClass}>
              {tForm("closeDate")} *
            </label>
            <input
              id="close_date"
              type="date"
              className={inputClass}
              {...register("close_date")}
            />
            {errors.close_date && (
              <p className="mt-1 font-sarabun text-caption text-status-error">
                {errors.close_date.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="amount" className={labelClass}>
              {tForm("amount")}
            </label>
            <input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              className={inputClass}
              {...register("amount")}
            />
          </div>

          <div>
            <label htmlFor="amount_note" className={labelClass}>
              {tForm("amountNote")}
            </label>
            <input
              id="amount_note"
              className={inputClass}
              {...register("amount_note")}
            />
            {errors.amount_note && (
              <p className="mt-1 font-sarabun text-caption text-status-error">
                {errors.amount_note.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="application_url" className={labelClass}>
            {tForm("applicationUrl")}
          </label>
          <input
            id="application_url"
            type="url"
            className={inputClass}
            {...register("application_url")}
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="contact_phone" className={labelClass}>
              {tForm("contactPhone")}
            </label>
            <input
              id="contact_phone"
              className={inputClass}
              {...register("contact_phone")}
            />
          </div>

          <div>
            <label htmlFor="contact_email" className={labelClass}>
              {tForm("contactEmail")}
            </label>
            <input
              id="contact_email"
              type="email"
              className={inputClass}
              {...register("contact_email")}
            />
            {errors.contact_email && (
              <p className="mt-1 font-sarabun text-caption text-status-error">
                {errors.contact_email.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="status" className={labelClass}>
            {tForm("status")} *
          </label>
          <select id="status" className={inputClass} {...register("status")}>
            {!isPublished && <option value="draft">{tForm("draft")}</option>}
            <option value="published">{tForm("published")}</option>
          </select>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-border-default/20 pt-6 sm:flex-row sm:justify-end">
          <Link
            href={`${base}/manage/scholarships`}
            className="inline-flex min-h-[44px] items-center justify-center rounded-radius-md border border-border-input px-6 font-sarabun text-label font-medium text-text-primary transition-colors hover:bg-surface-container"
          >
            {tForm("cancel")}
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex min-h-[44px] items-center justify-center rounded-radius-md bg-primary px-6 font-sarabun text-label font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {tForm("save")}
          </button>
        </div>
      </form>
    </div>
  );
}
