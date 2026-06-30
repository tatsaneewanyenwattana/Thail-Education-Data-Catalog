"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import apiClient from "@/services/api";
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
  redirectUrl?: string;
};

const inputClass =
  "w-full rounded-full border border-border-input bg-surface-page px-5 py-3 font-sarabun text-label text-text-primary outline-none transition-all focus:border-primary-dark focus:ring-2 focus:ring-primary-dark/20";

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

function SectionHeader({
  number,
  title,
}: {
  number: number;
  title: string;
}) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-dark font-sarabun text-label font-bold text-white">
        {number}
      </span>
      <h2 className="font-kanit text-body-lg font-semibold text-text-primary">
        {title}
      </h2>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 font-sarabun text-caption text-status-error">
      {message}
    </p>
  );
}

export default function ScholarshipForm({
  mode,
  scholarshipId,
  initialData,
  redirectUrl,
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

  const imageInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (initialData?.image_url) {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
      setExistingImageUrl(`${apiBase}${initialData.image_url}`);
    }
  }, [initialData]);

  const handleImageSelect = (file: File | null) => {
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.error("ไฟล์ไม่ใช่ JPEG, PNG หรือ WebP");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("ไฟล์ใหญ่เกิน 10MB");
      return;
    }
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setExistingImageUrl(null);
  };

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
      let id = scholarshipId;
      if (mode === "create") {
        const result = await createMutation.mutateAsync(payload);
        id = result.id;
        toast.success(tForm("createSuccess"));
      } else if (scholarshipId) {
        await updateMutation.mutateAsync({ id: scholarshipId, payload });
        toast.success(tForm("updateSuccess"));
      }

      if (selectedImage && id) {
        const formData = new FormData();
        formData.append("file", selectedImage);
        await apiClient.post(`/scholarship/${id}/image`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      router.push(redirectUrl ?? `${base}/manage/scholarships`);
    } catch {
      toast.error(tForm("saveError"));
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-24">
      {/* Header */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="font-kanit text-[28px] font-bold text-text-primary">
          {mode === "create" ? tForm("createTitle") : tForm("editTitle")}
        </h1>
        <Link
          href={redirectUrl ?? `${base}/manage/scholarships`}
          className="inline-flex items-center gap-2 font-sarabun text-label font-medium text-primary-dark transition-opacity hover:opacity-80"
        >
          <BackIcon />
          กลับไปที่หน้าจัดการ
        </Link>
      </header>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {/* Section 1 — ข้อมูลทั่วไปของทุน */}
        <section className="rounded-2xl border border-border-default/60 bg-surface-card p-6 shadow-level-1">
          <SectionHeader number={1} title="ข้อมูลทั่วไปของทุน" />

          <div className="space-y-5">
            <div>
              <label htmlFor="title" className={labelClass}>
                {tForm("title")} *
              </label>
              <input id="title" className={inputClass} {...register("title")} />
              <FieldError message={errors.title?.message} />
            </div>

            <div>
              <label htmlFor="description" className={labelClass}>
                {tForm("description")} *
              </label>
              <textarea
                id="description"
                rows={3}
                className={`${inputClass} !rounded-2xl`}
                {...register("description")}
              />
              <FieldError message={errors.description?.message} />
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
          </div>
        </section>

        {/* Section 2 — คุณสมบัติผู้สมัคร */}
        <section className="rounded-2xl border border-border-default/60 bg-surface-card p-6 shadow-level-1">
          <SectionHeader number={2} title="คุณสมบัติผู้สมัคร" />

          <div>
            <label htmlFor="eligibility" className={labelClass}>
              {tForm("eligibility")} *
            </label>
            <textarea
              id="eligibility"
              rows={6}
              className={`${inputClass} !rounded-2xl min-h-[160px] resize-y`}
              {...register("eligibility")}
            />
            <FieldError message={errors.eligibility?.message} />
          </div>
        </section>

        {/* Section 3 — ระยะเวลาและงบประมาณ */}
        <section className="rounded-2xl border border-border-default/60 bg-surface-card p-6 shadow-level-1">
          <SectionHeader number={3} title="ระยะเวลาและงบประมาณ" />

          <div className="space-y-5">
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
                <FieldError message={errors.open_date?.message} />
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
                <FieldError message={errors.close_date?.message} />
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
                <FieldError message={errors.amount_note?.message} />
              </div>
            </div>
          </div>
        </section>

        {/* Section 4 — ข้อมูลการติดต่อ */}
        <section className="rounded-2xl border border-border-default/60 bg-surface-card p-6 shadow-level-1">
          <SectionHeader number={4} title="ข้อมูลการติดต่อ" />

          <div className="space-y-5">
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
                <FieldError message={errors.contact_email?.message} />
              </div>
            </div>
          </div>
        </section>

        {/* Section 5 — รูปภาพทุน */}
        <section className="rounded-2xl border border-border-default/60 bg-surface-card p-6 shadow-level-1">
          <SectionHeader number={5} title="รูปภาพทุน" />

          <div>
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
                  className="font-sarabun text-label text-primary-dark hover:underline"
                >
                  เปลี่ยนรูป
                </button>
              </div>
            ) : (
              <div
                onClick={() => imageInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border-input bg-surface-page px-6 py-10 text-center transition-colors hover:border-primary-dark/40 hover:bg-surface-container"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary-dark">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                  </svg>
                </div>
                <p className="font-sarabun text-label font-medium text-text-primary">
                  คลิกเพื่อเลือกรูปภาพ
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
          </div>
        </section>

        {/* Section 6 — สถานะเริ่มต้น */}
        <section className="rounded-2xl border border-border-default/60 bg-surface-card p-6 shadow-level-1">
          <SectionHeader number={6} title="สถานะเริ่มต้น" />

          <div>
            <label htmlFor="status" className={labelClass}>
              {tForm("status")} *
            </label>
            <select id="status" className={inputClass} {...register("status")}>
              {!isPublished && <option value="draft">{tForm("draft")}</option>}
              <option value="published">{tForm("published")}</option>
            </select>
          </div>
        </section>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            href={redirectUrl ?? `${base}/manage/scholarships`}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-border-input px-8 font-sarabun text-label font-medium text-text-primary transition-colors hover:bg-surface-container"
          >
            {tForm("cancel")}
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-primary-dark px-8 font-sarabun text-label font-semibold text-white shadow-level-1 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <SaveIcon />
            {tForm("save")}
          </button>
        </div>
      </form>
    </div>
  );
}

function BackIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z" />
    </svg>
  );
}
