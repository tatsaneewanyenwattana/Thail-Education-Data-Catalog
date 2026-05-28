"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import { Control, Controller, UseFormSetValue, useWatch } from "react-hook-form";
import type { DatasetFormValues } from "@/components/dataset/datasetFormSchema";
import { useCategories } from "@/hooks/useCategories";
import { useAuthStore } from "@/stores/useAuthStore";

type CascadingCategorySelectProps = {
  control: Control<DatasetFormValues>;
  setValue: UseFormSetValue<DatasetFormValues>;
  errors: {
    categoryLevel1?: { message?: string };
    categoryLevel2?: { message?: string };
  };
};

export default function CascadingCategorySelect({
  control,
  setValue,
  errors,
}: CascadingCategorySelectProps) {
  const t = useTranslations("agency.upload");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const level1Slug = useWatch({ control, name: "categoryLevel1" });
  const userId = useAuthStore((s) => s.user?.id);

  const userRole = useAuthStore((s) => s.user?.role);
  const { data: categories = [], isLoading, isError } = useCategories();

  const isAdmin = userRole === "admin";

  const level1Options = useMemo(() => {
    return categories.filter(
      (c) =>
        c.level === 1 &&
        (isAdmin || !userId || String(c.created_by) === String(userId))
    );
  }, [categories, userId, isAdmin]);

  const level2Options = useMemo(() => {
    if (!level1Slug) {
      return [];
    }
    const parent = level1Options.find((c) => c.slug === level1Slug);
    if (!parent) {
      return [];
    }
    return categories.filter(
      (c) =>
        c.level === 2 &&
        String(c.parent_id) === String(parent.id) &&
        (isAdmin || !userId || String(c.created_by) === String(userId))
    );
  }, [categories, level1Slug, level1Options, userId, isAdmin]);

  const selectClass =
    "w-full rounded-radius-md border border-border-input bg-surface-page px-4 py-3 font-sarabun text-label text-text-primary outline-none transition-all focus:border-border-focus focus:ring-2 focus:ring-primary-dark/20 disabled:cursor-not-allowed disabled:opacity-60";

  const label = (c: { name_th: string; name_en: string }) =>
    locale === "th" ? c.name_th : c.name_en;

  return (
    <div className="grid grid-cols-1 gap-spacing-6 md:grid-cols-2">
      <div>
        <label className="mb-2 block font-sarabun text-label text-text-secondary">
          {t("fieldCategoryL1")} *
        </label>
        <Controller
          name="categoryLevel1"
          control={control}
          render={({ field }) => (
            <select
              {...field}
              className={selectClass}
              disabled={isLoading || isError}
              onChange={(event) => {
                field.onChange(event.target.value);
                setValue("categoryLevel2", "", { shouldValidate: false });
              }}
            >
              <option value="">
                {isLoading
                  ? tCommon("loading")
                  : isError
                    ? t("fieldCategoryLoadError")
                    : t("fieldCategoryL1Placeholder")}
              </option>
              {level1Options.map((category) => (
                <option key={category.id} value={category.slug}>
                  {label(category)}
                </option>
              ))}
            </select>
          )}
        />
        {errors.categoryLevel1?.message && (
          <p className="mt-1 font-sarabun text-caption text-status-error">
            {errors.categoryLevel1.message}
          </p>
        )}
      </div>
      <div>
        <label className="mb-2 block font-sarabun text-label text-text-secondary">
          {t("fieldCategoryL2")} *
        </label>
        <Controller
          name="categoryLevel2"
          control={control}
          render={({ field }) => (
            <select
              {...field}
              className={selectClass}
              disabled={!level1Slug || isLoading || isError}
            >
              <option value="">
                {isLoading
                  ? tCommon("loading")
                  : !level1Slug
                    ? t("fieldCategoryL2Placeholder")
                    : level2Options.length === 0
                      ? t("fieldCategoryL2Empty")
                      : t("fieldCategoryL2Placeholder")}
              </option>
              {level2Options.map((subcategory) => (
                <option key={subcategory.id} value={subcategory.slug}>
                  {label(subcategory)}
                </option>
              ))}
            </select>
          )}
        />
        {errors.categoryLevel2?.message && (
          <p className="mt-1 font-sarabun text-caption text-status-error">
            {errors.categoryLevel2.message}
          </p>
        )}
      </div>
    </div>
  );
}
