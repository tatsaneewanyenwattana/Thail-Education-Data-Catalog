"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCreateCategory } from "@/hooks/useCreateCategory";
import { useUpdateCategory } from "@/hooks/useUpdateCategory";
import type { ApiCategory } from "@/utils/categoryApi";
import type { CategoryTreeNode } from "@/utils/categoryTreeUtils";

export type CategoryFormValues = {
  nameTh: string;
  nameEn: string;
  slug: string;
};

type CategoryFormProps = {
  open: boolean;
  mode: "create" | "edit";
  category?: CategoryTreeNode | null;
  parent?: CategoryTreeNode | null;
  onClose: () => void;
  onError: (message: string) => void;
  /** เรียกหลังสร้างหมวดหมู่สำเร็จ (ใช้ในหน้าอัปโหลด Dataset) */
  onCreated?: (category: ApiCategory) => void;
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function CategoryForm({
  open,
  mode,
  category,
  parent,
  onClose,
  onError,
  onCreated,
}: CategoryFormProps) {
  const t = useTranslations("agency.categories");
  const locale = useLocale();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const slugTouched = useRef(false);

  const schema = z.object({
    nameTh: z.string().min(2, t("fieldNameThError")),
    nameEn: z.string().min(2, t("fieldNameEnError")),
    slug: z
      .string()
      .min(1, t("fieldSlugError"))
      .regex(/^[a-z0-9-]+$/, t("fieldSlugError")),
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      nameTh: category?.nameTh ?? "",
      nameEn: category?.nameEn ?? "",
      slug: category?.slug ?? "",
    },
  });

  const nameEn = watch("nameEn");

  useEffect(() => {
    if (!open) {
      slugTouched.current = false;
      return;
    }

    reset({
      nameTh: category?.nameTh ?? "",
      nameEn: category?.nameEn ?? "",
      slug:
        category?.slug ||
        (category?.nameEn ? slugify(category.nameEn) : "") ||
        "category",
    });
    slugTouched.current = mode === "edit";
  }, [open, category, mode, reset]);

  useEffect(() => {
    if (!slugTouched.current && nameEn) {
      setValue("slug", slugify(nameEn), { shouldValidate: true });
    }
  }, [nameEn, setValue]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!open || !mounted) {
    return null;
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  const title =
    mode === "create"
      ? parent
        ? t("formTitleAddChild")
        : t("formTitleAddRoot")
      : t("formTitleEdit");

  const parentLabel = parent
    ? locale === "th"
      ? parent.nameTh
      : parent.nameEn
    : "";

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      if (mode === "create") {
        const created = await createMutation.mutateAsync({
          nameTh: values.nameTh,
          nameEn: values.nameEn,
          slug: values.slug,
          parentId: parent?.id,
        });
        onCreated?.(created);
      } else if (category) {
        await updateMutation.mutateAsync({
          id: category.id,
          nameTh: values.nameTh,
          nameEn: values.nameEn,
          slug: values.slug,
          originalNameTh: category.nameTh,
          originalNameEn: category.nameEn,
        });
      }
      onClose();
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : t("saveError");
      onError(message);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="category-form-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-surface-navy/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label={t("cancel")}
      />
      <div className="relative w-full max-w-[480px] rounded-radius-lg bg-surface-card p-8 shadow-level-3">
        <div className="mb-6 flex items-center justify-between">
          <h2
            id="category-form-title"
            className="font-kanit text-heading-3 font-semibold text-text-primary"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-radius-full p-2 text-text-muted transition-colors hover:bg-surface-container"
            aria-label={t("cancel")}
          >
            <CloseIcon />
          </button>
        </div>

        {parent && (
          <p className="mb-4 rounded-radius-sm bg-surface-container px-3 py-2 font-sarabun text-label text-text-secondary">
            {t("parentHint", { name: parentLabel })}
          </p>
        )}

        <form
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void handleSubmit(onSubmit)(event);
          }}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="nameTh"
              className="mb-2 block font-sarabun text-label text-text-secondary"
            >
              {t("fieldNameTh")}
            </label>
            <input
              id="nameTh"
              type="text"
              className={`h-10 w-full rounded-radius-sm border bg-surface-card px-3 font-sarabun text-body-md outline-none transition-colors focus:ring-2 focus:ring-primary-dark/20 ${
                errors.nameTh ? "border-status-error" : "border-border-input"
              }`}
              placeholder={t("fieldNameThPlaceholder")}
              {...register("nameTh")}
            />
            {errors.nameTh && (
              <p className="mt-1 font-sarabun text-caption text-status-error">
                {errors.nameTh.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="nameEn"
              className="mb-2 block font-sarabun text-label text-text-secondary"
            >
              {t("fieldNameEn")}
            </label>
            <input
              id="nameEn"
              type="text"
              className={`h-10 w-full rounded-radius-sm border bg-surface-card px-3 font-sarabun text-body-md outline-none transition-colors focus:ring-2 focus:ring-primary-dark/20 ${
                errors.nameEn ? "border-status-error" : "border-border-input"
              }`}
              placeholder={t("fieldNameEnPlaceholder")}
              {...register("nameEn")}
            />
            {errors.nameEn && (
              <p className="mt-1 font-sarabun text-caption text-status-error">
                {errors.nameEn.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="slug"
              className="mb-2 block font-sarabun text-label text-text-secondary"
            >
              {t("fieldSlug")}
            </label>
            <input
              id="slug"
              type="text"
              className={`h-10 w-full rounded-radius-sm border bg-surface-card px-3 font-mono text-code outline-none transition-colors focus:ring-2 focus:ring-primary-dark/20 ${
                errors.slug ? "border-status-error" : "border-border-input"
              }`}
              placeholder={t("fieldSlugPlaceholder")}
              {...register("slug", {
                onChange: () => {
                  slugTouched.current = true;
                },
              })}
            />
            <p className="mt-2 flex items-center gap-1 font-sarabun text-caption text-text-muted">
              <InfoIcon />
              {t("fieldSlugHint")}
            </p>
            {errors.slug && (
              <p className="mt-1 font-sarabun text-caption text-status-error">
                {errors.slug.message}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 rounded-radius-sm border border-primary-dark py-3 font-sarabun text-label font-bold text-primary-dark transition-colors hover:bg-primary-light disabled:opacity-50"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={!isValid || isPending}
              className="flex-1 rounded-radius-sm bg-primary py-3 font-sarabun text-label font-bold text-surface-card shadow-level-1 transition-opacity hover:bg-primary-hover disabled:opacity-50"
            >
              {isPending ? t("saving") : t("save")}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

function CloseIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.3 5.71 12 12.41 5.7 5.71 4.29 7.12 10.59 13.41 4.3 19.71 5.71 21.12 12 14.82 18.29 21.12 19.7 19.71 13.41 13.41 19.7 7.12 18.3 5.71Z" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg
      className="h-3.5 w-3.5 shrink-0"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
    </svg>
  );
}
