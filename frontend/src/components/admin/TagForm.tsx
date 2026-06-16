"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { AdminTag } from "@/data/mockData";
import { useCreateTag, useUpdateTag } from "@/hooks/useAdminTags";

type TagFormValues = {
  name: string;
};

type TagFormProps = {
  open: boolean;
  mode: "create" | "edit";
  tag?: AdminTag | null;
  onClose: () => void;
  onSuccess?: () => void;
  onError: (message: string) => void;
};

export default function TagForm({
  open,
  mode,
  tag,
  onClose,
  onSuccess,
  onError,
}: TagFormProps) {
  const t = useTranslations("admin.tags");
  const createMutation = useCreateTag();
  const updateMutation = useUpdateTag();

  const schema = z.object({
    name: z
      .string()
      .min(2, t("fieldNameError"))
      .max(100, t("fieldNameError")),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<TagFormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      name: tag?.name ?? "",
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }
    reset({ name: tag?.name ?? "" });
  }, [open, tag, reset]);

  if (!open) {
    return null;
  }

  const isPending = createMutation.isPending || updateMutation.isPending;
  const title = mode === "create" ? t("formTitleAdd") : t("formTitleEdit");

  const onSubmit = async (values: TagFormValues) => {
    try {
      if (mode === "create") {
        await createMutation.mutateAsync(values.name);
      } else if (tag) {
        await updateMutation.mutateAsync({ id: tag.id, name: values.name });
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      if (error instanceof Error && error.message === "TAG_NAME_EXISTS") {
        onError(t("nameExists"));
      } else {
        onError(t("saveError"));
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-tag-form-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-surface-navy/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label={t("cancel")}
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-radius-lg bg-surface-card shadow-level-3">
        <div className="flex items-center justify-between border-b border-border-default px-6 py-5">
          <h2
            id="admin-tag-form-title"
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
              htmlFor="admin-tag-name"
              className="mb-2 block font-kanit text-label font-semibold text-text-secondary"
            >
              {t("colName")}
            </label>
            <input
              id="admin-tag-name"
              type="text"
              className={`h-10 w-full rounded-radius-sm border bg-surface-card px-4 font-sarabun text-body-md outline-none transition-colors focus:ring-2 focus:ring-primary-dark/20 ${
                errors.name ? "border-status-error" : "border-border-input"
              }`}
              placeholder={t("fieldNamePlaceholder")}
              {...register("name")}
            />
            {errors.name && (
              <p className="mt-1 font-sarabun text-caption text-status-error">
                {errors.name.message}
              </p>
            )}
          </div>

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
