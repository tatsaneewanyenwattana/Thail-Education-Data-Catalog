"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  useCreateCategory,
  useUpdateCategory,
  type AdminCategoryTreeNode,
} from "@/hooks/useAdminCategories";

export type CategoryFormValues = {
  nameTh: string;
  nameEn: string;
  slug: string;
};

type CategoryFormProps = {
  open: boolean;
  mode: "create" | "edit";
  category?: AdminCategoryTreeNode | null;
  parent?: AdminCategoryTreeNode | null;
  onClose: () => void;
  onError: (message: string) => void;
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
}: CategoryFormProps) {
  const t = useTranslations("admin.categories");
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
      slug: category?.slug ?? "",
    });
    slugTouched.current = mode === "edit";
  }, [open, category, mode, reset]);

  useEffect(() => {
    if (!slugTouched.current && nameEn) {
      setValue("slug", slugify(nameEn), { shouldValidate: true });
    }
  }, [nameEn, setValue]);

  if (!open) {
    return null;
  }

  const isPending = createMutation.isPending || updateMutation.isPending;
  const parentLabel = parent
    ? locale === "th"
      ? parent.nameTh
      : parent.nameEn
    : null;

  const title =
    mode === "create"
      ? parent
        ? t("formTitleAddChild", { parent: parentLabel ?? "" })
        : t("formTitleAddRoot")
      : t("formTitleEdit");

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      if (mode === "create") {
        await createMutation.mutateAsync({
          ...values,
          parentId: parent?.id,
        });
      } else if (category) {
        await updateMutation.mutateAsync({
          id: category.id,
          ...values,
        });
      }
      onClose();
    } catch {
      onError(t("saveError"));
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-category-form-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-surface-navy/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label={t("cancel")}
      />
      <div className="relative w-full max-w-lg overflow-hidden rounded-radius-lg bg-surface-card shadow-level-3">
        <div className="flex items-center justify-between border-b border-border-default bg-surface-container-low/50 px-6 py-5">
          <h2
            id="admin-category-form-title"
            className="font-kanit text-heading-3 font-bold text-text-primary"
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-6">
          <div>
            <label
              htmlFor="admin-nameTh"
              className="mb-2 block font-kanit text-label font-semibold text-text-secondary"
            >
              {t("fieldNameTh")}
            </label>
            <input
              id="admin-nameTh"
              type="text"
              className={`h-10 w-full rounded-radius-sm border bg-surface-card px-4 font-sarabun text-body-md outline-none transition-colors focus:ring-2 focus:ring-primary-dark/20 ${
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
              htmlFor="admin-nameEn"
              className="mb-2 block font-kanit text-label font-semibold text-text-secondary"
            >
              {t("fieldNameEn")}
            </label>
            <input
              id="admin-nameEn"
              type="text"
              className={`h-10 w-full rounded-radius-sm border bg-surface-card px-4 font-sarabun text-body-md outline-none transition-colors focus:ring-2 focus:ring-primary-dark/20 ${
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

          {mode === "edit" && (
            <div>
              <label
                htmlFor="admin-slug"
                className="mb-2 block font-kanit text-label font-semibold text-text-secondary"
              >
                {t("fieldSlug")}
              </label>
              <input
                id="admin-slug"
                type="text"
                className={`h-10 w-full rounded-radius-sm border bg-surface-card px-4 font-mono text-code outline-none transition-colors focus:ring-2 focus:ring-primary-dark/20 ${
                  errors.slug ? "border-status-error" : "border-border-input"
                }`}
                placeholder={t("fieldSlugPlaceholder")}
                {...register("slug", {
                  onChange: () => {
                    slugTouched.current = true;
                  },
                })}
              />
              {errors.slug && (
                <p className="mt-1 font-sarabun text-caption text-status-error">
                  {errors.slug.message}
                </p>
              )}
            </div>
          )}

          {mode === "create" && (
            <div className="flex items-center gap-3 rounded-radius-lg border border-primary/20 bg-surface-container-lowest p-4">
              <InfoIcon />
              <p className="font-sarabun text-body-sm text-text-secondary">
                {parent ? t("formInfoChild") : t("formInfoRoot")}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-border-default pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-radius-sm border border-border-default px-5 py-2 font-kanit text-label font-medium text-text-secondary transition-colors hover:bg-surface-container-high disabled:opacity-50"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={!isValid || isPending}
              className="rounded-radius-sm bg-primary px-8 py-2 font-kanit text-label font-bold text-surface-card shadow-level-1 transition-opacity hover:bg-primary-hover disabled:opacity-50"
            >
              {isPending ? t("saving") : t("save")}
            </button>
          </div>
        </form>
      </div>
    </div>
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
      className="h-5 w-5 shrink-0 text-primary"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
    </svg>
  );
}
