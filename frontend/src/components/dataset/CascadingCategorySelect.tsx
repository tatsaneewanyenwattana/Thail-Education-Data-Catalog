"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import { Control, Controller, UseFormSetValue, useWatch } from "react-hook-form";
import type { DatasetFormValues } from "@/components/dataset/datasetFormSchema";
import { mockCategories } from "@/data/mockData";

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
  const locale = useLocale();
  const level1 = useWatch({ control, name: "categoryLevel1" });

  const subcategories = useMemo(() => {
    const category = mockCategories.find((item) => item.slug === level1);
    return category?.subcategories ?? [];
  }, [level1]);

  const selectClass =
    "w-full rounded-radius-md border border-border-input bg-surface-page px-4 py-3 font-sarabun text-label text-text-primary outline-none transition-all focus:border-border-focus focus:ring-2 focus:ring-primary-dark/20";

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
              onChange={(event) => {
                field.onChange(event.target.value);
                setValue("categoryLevel2", "", { shouldValidate: false });
              }}
            >
              <option value="">{t("fieldCategoryL1Placeholder")}</option>
              {mockCategories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {locale === "th" ? category.nameTh : category.nameEn}
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
            <select {...field} className={selectClass} disabled={!level1}>
              <option value="">{t("fieldCategoryL2Placeholder")}</option>
              {subcategories.map((subcategory) => (
                <option key={subcategory.slug} value={subcategory.slug}>
                  {locale === "th" ? subcategory.nameTh : subcategory.nameEn}
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
