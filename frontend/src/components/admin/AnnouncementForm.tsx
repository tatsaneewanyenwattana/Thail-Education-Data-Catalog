"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import ToggleSwitch from "@/components/admin/ToggleSwitch";
import type { Announcement } from "@/data/mockData";
import { useCreateAnnouncement } from "@/hooks/useCreateAnnouncement";
import { useUpdateAnnouncement } from "@/hooks/useUpdateAnnouncement";

export type AnnouncementFormValues = {
  title: string;
  content: string;
  isActive: boolean;
};

type AnnouncementFormProps = {
  open: boolean;
  mode: "create" | "edit";
  announcement?: Announcement | null;
  onClose: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
};

export default function AnnouncementForm({
  open,
  mode,
  announcement,
  onClose,
  onSuccess,
  onError,
}: AnnouncementFormProps) {
  const t = useTranslations("admin.announcements");
  const createMutation = useCreateAnnouncement();
  const updateMutation = useUpdateAnnouncement();

  const schema = z.object({
    title: z.string().min(3, t("fieldTitleError")),
    content: z.string().min(10, t("fieldContentError")),
    isActive: z.boolean(),
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isValid },
  } = useForm<AnnouncementFormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      title: announcement?.title ?? "",
      content: announcement?.content ?? "",
      isActive: announcement?.isActive ?? true,
    },
  });

  useEffect(() => {
    if (!open) {
      return;
    }
    reset({
      title: announcement?.title ?? "",
      content: announcement?.content ?? "",
      isActive: announcement?.isActive ?? true,
    });
  }, [open, announcement, reset]);

  if (!open) {
    return null;
  }

  const isPending = createMutation.isPending || updateMutation.isPending;
  const title = mode === "create" ? t("formTitleAdd") : t("formTitleEdit");

  const onSubmit = async (values: AnnouncementFormValues) => {
    try {
      if (mode === "create") {
        await createMutation.mutateAsync(values);
      } else if (announcement) {
        await updateMutation.mutateAsync({
          id: announcement.id,
          data: values,
        });
      }
      onSuccess();
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
      aria-labelledby="announcement-form-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-surface-navy/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label={t("cancel")}
      />
      <div className="relative w-full max-w-[560px] overflow-hidden rounded-radius-lg bg-surface-card shadow-level-3">
        <div className="border-b border-border-default px-8 py-6">
          <h2
            id="announcement-form-title"
            className="font-kanit text-heading-3 font-semibold text-text-primary"
          >
            {title}
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 px-8 py-6">
          <div>
            <label
              htmlFor="announcement-title"
              className="mb-2 block font-kanit text-label font-semibold text-text-secondary"
            >
              {t("fieldTitle")}
            </label>
            <input
              id="announcement-title"
              type="text"
              className={`h-11 w-full rounded-radius-sm border bg-surface-card px-4 font-sarabun text-body-md outline-none transition-colors focus:ring-2 focus:ring-primary-dark/20 ${
                errors.title ? "border-status-error" : "border-border-input"
              }`}
              placeholder={t("fieldTitlePlaceholder")}
              {...register("title")}
            />
            {errors.title && (
              <p className="mt-1 font-sarabun text-caption text-status-error">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="announcement-content"
              className="mb-2 block font-kanit text-label font-semibold text-text-secondary"
            >
              {t("fieldContent")}
            </label>
            <textarea
              id="announcement-content"
              rows={4}
              className={`w-full rounded-radius-sm border bg-surface-card px-4 py-3 font-sarabun text-body-md outline-none transition-colors focus:ring-2 focus:ring-primary-dark/20 ${
                errors.content ? "border-status-error" : "border-border-input"
              }`}
              placeholder={t("fieldContentPlaceholder")}
              {...register("content")}
            />
            {errors.content && (
              <p className="mt-1 font-sarabun text-caption text-status-error">
                {errors.content.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-dashed border-border-default py-2">
            <span className="font-kanit text-label font-semibold text-text-secondary">
              {t("fieldActive")}
            </span>
            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <ToggleSwitch
                  checked={field.value}
                  onChange={field.onChange}
                  label={t("fieldActive")}
                />
              )}
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-border-default pt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-radius-sm px-6 py-2.5 font-kanit text-label font-medium text-text-secondary transition-colors hover:bg-surface-container disabled:opacity-50"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={!isValid || isPending}
              className="rounded-radius-sm bg-primary px-8 py-2.5 font-kanit text-label font-bold text-surface-card shadow-level-1 transition-opacity hover:bg-primary-hover disabled:opacity-50"
            >
              {isPending ? t("saving") : t("save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
