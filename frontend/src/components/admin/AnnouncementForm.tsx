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
    if (!open) return;
    reset({
      title: announcement?.title ?? "",
      content: announcement?.content ?? "",
      isActive: announcement?.isActive ?? true,
    });
  }, [open, announcement, reset]);

  if (!open) return null;

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

  const inputClass =
    "w-full rounded-full border border-gray-200 bg-gray-50 px-4 font-sarabun text-body-md text-text-primary shadow-sm transition-all hover:border-gray-300 focus:border-primary-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-dark/20";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="announcement-form-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label={t("cancel")}
      />
      <div className="relative w-full max-w-[560px] overflow-hidden rounded-2xl border border-white/80 bg-white shadow-xl">
        <div className="px-8 py-6">
          <h2
            id="announcement-form-title"
            className="font-kanit text-2xl font-bold text-text-primary"
          >
            {title}
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-8 pb-8">
          <div>
            <label
              htmlFor="announcement-title"
              className="mb-1.5 block font-sarabun text-body-sm font-semibold text-text-secondary"
            >
              {t("fieldTitle")}
            </label>
            <input
              id="announcement-title"
              type="text"
              className={`h-11 ${inputClass} ${
                errors.title ? "border-red-400" : ""
              }`}
              placeholder={t("fieldTitlePlaceholder")}
              {...register("title")}
            />
            {errors.title && (
              <p className="mt-1.5 font-sarabun text-caption text-error">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="announcement-content"
              className="mb-1.5 block font-sarabun text-body-sm font-semibold text-text-secondary"
            >
              {t("fieldContent")}
            </label>
            <textarea
              id="announcement-content"
              rows={4}
              className={`rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 font-sarabun text-body-md text-text-primary shadow-sm transition-all hover:border-gray-300 focus:border-primary-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-dark/20 w-full ${
                errors.content ? "border-red-400" : ""
              }`}
              placeholder={t("fieldContentPlaceholder")}
              {...register("content")}
            />
            {errors.content && (
              <p className="mt-1.5 font-sarabun text-caption text-error">
                {errors.content.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            <span className="font-sarabun text-body-md font-semibold text-text-secondary">
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

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-full border border-gray-200 bg-white px-5 py-2.5 font-sarabun text-body-md font-medium text-text-secondary shadow-sm transition-all hover:bg-gray-50 disabled:opacity-50"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={!isValid || isPending}
              className="rounded-full bg-primary-dark px-6 py-2.5 font-sarabun text-body-md font-bold text-white shadow-md transition-all hover:bg-primary-hover hover:shadow-lg disabled:opacity-50"
            >
              {isPending ? t("saving") : t("save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
