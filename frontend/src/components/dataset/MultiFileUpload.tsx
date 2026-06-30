"use client";

import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DragEvent, useRef, useState } from "react";
import { useCategories } from "@/hooks/useCategories";
import { useUploadDataset } from "@/hooks/useUploadDataset";

const MAX_FILE_SIZE = 100 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = [".csv", ".xlsx", ".xls", ".json", ".pdf", ".sql"];

type FileRow = {
  file: File;
  title: string;
  categoryId: string;
  status: "idle" | "uploading" | "success" | "error";
  errorMsg?: string;
};

function isAccepted(file: File): boolean {
  return ACCEPTED_EXTENSIONS.some((ext) =>
    file.name.toLowerCase().endsWith(ext)
  );
}

function stripExtension(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(0, dot) : name;
}

export default function MultiFileUpload() {
  const t = useTranslations("agency.upload");
  const locale = useLocale();
  const base = `/${locale}`;
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<FileRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: categories = [] } = useCategories();
  const uploadMutation = useUploadDataset();

  const addFiles = (files: FileList | File[]) => {
    const newRows: FileRow[] = [];
    for (const file of Array.from(files)) {
      if (!isAccepted(file)) continue;
      if (file.size > MAX_FILE_SIZE) continue;
      if (rows.some((r) => r.file.name === file.name && r.file.size === file.size)) continue;
      newRows.push({
        file,
        title: stripExtension(file.name),
        categoryId: "",
        status: "idle",
      });
    }
    if (newRows.length > 0) {
      setRows((prev) => [...prev, ...newRows]);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    addFiles(e.dataTransfer.files);
  };

  const updateRow = (index: number, patch: Partial<FileRow>) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };

  const removeRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitAll = async () => {
    const pending = rows.filter((r) => r.status !== "success");
    if (pending.length === 0) return;

    setIsSubmitting(true);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row.status === "success") continue;

      updateRow(i, { status: "uploading", errorMsg: undefined });

      const formData = new FormData();
      formData.append("file", row.file);
      formData.append("title", row.title || stripExtension(row.file.name));
      formData.append("license", "open");
      if (row.categoryId) {
        formData.append("categoryId", row.categoryId);
      }
      formData.append("status", "draft");

      try {
        await uploadMutation.mutateAsync(formData);
        updateRow(i, { status: "success" });
      } catch {
        updateRow(i, { status: "error", errorMsg: "อัปโหลดไม่สำเร็จ" });
      }
    }

    setIsSubmitting(false);
  };

  const successCount = rows.filter((r) => r.status === "success").length;
  const allDone = rows.length > 0 && successCount === rows.length;

  return (
    <div className="mx-auto max-w-[800px] space-y-8 pb-24">
      <nav className="flex flex-wrap items-center gap-2 font-sarabun text-caption uppercase tracking-wider text-text-muted">
        <Link href={`${base}/dashboard`} className="hover:text-primary-dark">
          {t("breadcrumbDashboard")}
        </Link>
        <span>›</span>
        <Link href={`${base}/datasets`} className="hover:text-primary-dark">
          {t("breadcrumbDatasets")}
        </Link>
        <span>›</span>
        <span className="font-semibold text-text-primary">{t("breadcrumbCurrent")}</span>
      </nav>

      <h1 className="font-kanit text-[28px] font-bold text-text-primary">
        อัปโหลดหลายไฟล์
      </h1>

      {/* Drop zone */}
      <section className="rounded-2xl border border-border-default/60 bg-surface-card p-8 shadow-level-1">
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => !isSubmitting && inputRef.current?.click()}
          className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border-input bg-surface-page px-6 py-12 text-center transition-colors ${
            isSubmitting
              ? "cursor-not-allowed opacity-60"
              : "cursor-pointer hover:border-primary-dark/40 hover:bg-surface-container"
          }`}
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-light text-primary-dark">
            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M9 16h6v-6h4l-7-7-7 7h4v6Zm-4 2h14v2H5v-2Z" />
            </svg>
          </div>
          <p className="mb-2 font-kanit text-body-lg font-semibold text-text-primary">
            ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกหลายไฟล์
          </p>
          <p className="font-sarabun text-caption text-text-muted">
            CSV, XLSX, JSON, PDF, SQL · สูงสุด 100MB ต่อไฟล์
          </p>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".csv,.xlsx,.xls,.json,.pdf,.sql"
            className="hidden"
            disabled={isSubmitting}
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      </section>

      {/* File list table */}
      {rows.length > 0 && (
        <section className="rounded-2xl border border-border-default/60 bg-surface-card p-6 shadow-level-1">
          <h2 className="mb-4 font-kanit text-body-lg font-semibold text-text-primary">
            รายการไฟล์ ({rows.length} ไฟล์)
          </h2>
          <div className="space-y-3">
            {rows.map((row, i) => (
              <div
                key={`${row.file.name}-${i}`}
                className={`flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center ${
                  row.status === "success"
                    ? "border-status-success/40 bg-[#e8f5e9]"
                    : row.status === "error"
                      ? "border-status-error/40 bg-status-error-bg"
                      : "border-border-default/60 bg-surface-page"
                }`}
              >
                {/* File info */}
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <svg className="h-5 w-5 shrink-0 text-text-muted" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                  </svg>
                  <div className="min-w-0">
                    <p className="truncate font-sarabun text-label font-medium text-text-primary">
                      {row.file.name}
                    </p>
                    <p className="font-sarabun text-caption text-text-muted">
                      {(row.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                {/* Title input */}
                <input
                  type="text"
                  value={row.title}
                  onChange={(e) => updateRow(i, { title: e.target.value })}
                  placeholder="ชื่อ Dataset"
                  disabled={row.status === "success" || isSubmitting}
                  className="w-full rounded-full border border-border-input bg-white px-4 py-2 font-sarabun text-label text-text-primary outline-none focus:border-primary-dark focus:ring-2 focus:ring-primary-dark/20 sm:w-48"
                />

                {/* Category dropdown */}
                <select
                  value={row.categoryId}
                  onChange={(e) => updateRow(i, { categoryId: e.target.value })}
                  disabled={row.status === "success" || isSubmitting}
                  className="w-full rounded-full border border-border-input bg-white px-4 py-2 font-sarabun text-label text-text-muted outline-none focus:border-primary-dark focus:ring-2 focus:ring-primary-dark/20 sm:w-44"
                >
                  <option value="">-- หมวดหมู่ --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name_th || c.name_en}
                    </option>
                  ))}
                </select>

                {/* Status / remove */}
                <div className="flex shrink-0 items-center gap-2">
                  {row.status === "success" && (
                    <span className="font-sarabun text-caption font-medium text-status-success">✓ สำเร็จ</span>
                  )}
                  {row.status === "uploading" && (
                    <span className="font-sarabun text-caption text-text-muted">กำลังอัปโหลด...</span>
                  )}
                  {row.status === "error" && (
                    <span className="font-sarabun text-caption text-status-error">{row.errorMsg}</span>
                  )}
                  {row.status !== "success" && !isSubmitting && (
                    <button
                      type="button"
                      onClick={() => removeRow(i)}
                      className="rounded-full p-1 text-text-muted hover:bg-red-50 hover:text-status-error"
                      aria-label="ลบ"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-between">
            <p className="font-sarabun text-caption text-text-muted">
              {successCount > 0 && `สำเร็จ ${successCount}/${rows.length}`}
            </p>
            <div className="flex gap-3">
              {allDone ? (
                <button
                  type="button"
                  onClick={() => router.push(`${base}/datasets`)}
                  className="rounded-full bg-primary-dark px-6 py-2.5 font-sarabun text-label font-medium text-white shadow-level-1 hover:opacity-90"
                >
                  ไปหน้า Dataset ของฉัน
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void handleSubmitAll()}
                  disabled={isSubmitting || rows.filter((r) => r.status !== "success").length === 0}
                  className="rounded-full bg-primary-dark px-6 py-2.5 font-sarabun text-label font-medium text-white shadow-level-1 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? "กำลังอัปโหลด..." : `อัปโหลดทั้งหมด (${rows.filter((r) => r.status !== "success").length} ไฟล์)`}
                </button>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
