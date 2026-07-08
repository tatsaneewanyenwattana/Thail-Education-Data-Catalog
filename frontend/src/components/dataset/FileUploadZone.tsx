"use client";

import { useTranslations } from "next-intl";
import { DragEvent, useRef, useState } from "react";
import { usePIIScan } from "@/hooks/usePIIScan";
import type { PIIScanResult } from "@/types/pii";

const MAX_FILE_SIZE = 100 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = [
  ".csv",
  ".xlsx",
  ".xls",
  ".json",
  ".pdf",
  ".sql",
];
const ACCEPTED_MIME_TYPES = [
  "text/csv",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "application/json",
  "application/pdf",
  "text/plain",
  "application/octet-stream",
  "application/sql",
  "text/x-sql",
];

const FILE_TYPE_BADGES = ["CSV", "XLSX", "JSON", "PDF", "SQL"];

type FileUploadZoneProps = {
  onAnalyzed: (result: PIIScanResult, file: File) => void;
  disabled?: boolean;
  multiple?: boolean;
  theme?: "agency";
};

function isAcceptedFile(file: File): boolean {
  const lowerName = file.name.toLowerCase();
  const hasValidExtension = ACCEPTED_EXTENSIONS.some((ext) =>
    lowerName.endsWith(ext)
  );
  const hasValidMime =
    file.type === "" || ACCEPTED_MIME_TYPES.includes(file.type);
  return hasValidExtension && hasValidMime;
}

export default function FileUploadZone({
  onAnalyzed,
  disabled = false,
  multiple = false,
  theme,
}: FileUploadZoneProps) {
  const isGreen = theme === "agency";
  const t = useTranslations("agency.upload");
  const { scanFile } = usePIIScan();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [processingName, setProcessingName] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const processFile = async (file: File) => {
    if (!isAcceptedFile(file)) {
      setError(t("fileInvalidType"));
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError(t("fileTooLarge"));
      return;
    }

    setError(null);
    setProcessingName(file.name);
    setIsUploading(true);
    setProgress(0);

    const progressInterval = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 95) {
          return current;
        }
        return current + 5;
      });
    }, 100);

    try {
      const result = await scanFile(file);
      setProgress(100);
      onAnalyzed(result, file);
    } catch {
      setError(t("fileUploadFailed"));
      return;
    } finally {
      window.clearInterval(progressInterval);
      setIsUploading(false);
      setProcessingName(null);
    }
  };

  const processFiles = async (fileList: FileList) => {
    const filesToProcess = Array.from(fileList);
    for (const file of filesToProcess) {
      await processFile(file);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (disabled || isUploading) {
      return;
    }
    if (multiple) {
      void processFiles(event.dataTransfer.files);
    } else {
      const file = event.dataTransfer.files[0];
      if (file) {
        void processFile(file);
      }
    }
  };

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            inputRef.current?.click();
          }
        }}
        className={`mb-6 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-surface-page px-6 py-12 text-center transition-colors ${
          isGreen ? "border-[#0277bd]/30" : "border-[#0081A7]/30"
        } ${
          disabled || isUploading
            ? "cursor-not-allowed opacity-60"
            : isGreen
              ? "cursor-pointer hover:border-[#0277bd]/50 hover:bg-[#0277bd]/5"
              : "cursor-pointer hover:border-[#0081A7]/50 hover:bg-[#0081A7]/5"
        }`}
        onClick={() => {
          if (!disabled && !isUploading) {
            inputRef.current?.click();
          }
        }}
      >
        <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full ${isGreen ? "bg-[#0277bd]/10 text-[#0277bd]" : "bg-[#0081A7]/10 text-[#0081A7]"}`}>
          <UploadIcon />
        </div>
        <p className="mb-4 font-kanit text-body-lg font-semibold text-text-primary">
          {t("dropzone")}
        </p>
        <button
          type="button"
          disabled={disabled || isUploading}
          className={`rounded-full px-8 py-2.5 font-sarabun text-label font-medium text-white shadow-md transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 ${isGreen ? "bg-[#01579b]" : "bg-[#0081A7]"}`}
          onClick={(event) => {
            event.stopPropagation();
            inputRef.current?.click();
          }}
        >
          {t("dropzoneClick")}
        </button>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {FILE_TYPE_BADGES.map((ext) => (
            <span
              key={ext}
              className="rounded-lg border border-border-default bg-surface-card px-3 py-1 font-sarabun text-caption font-medium text-text-muted"
            >
              {ext}
            </span>
          ))}
          <span className="font-sarabun text-caption text-text-muted">
            สูงสุด 100MB · สามารถอัปโหลดได้หลายไฟล์
          </span>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls,.json,.pdf,.sql"
          multiple={multiple}
          className="hidden"
          disabled={disabled || isUploading}
          onChange={(event) => {
            const fileList = event.target.files;
            if (!fileList || fileList.length === 0) return;
            if (multiple) {
              void processFiles(fileList);
            } else {
              void processFile(fileList[0]);
            }
            event.target.value = "";
          }}
        />
      </div>

      {processingName && (
        <p className="mb-2 font-sarabun text-label text-text-secondary">
          {processingName}
        </p>
      )}

      {isUploading && (
        <div className="mb-4">
          <div className="mb-1 flex justify-between font-sarabun text-caption text-text-muted">
            <span>{t("uploading")}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-surface-container">
            <div
              className={`h-2 rounded-full transition-all ${isGreen ? "bg-[#0277bd]" : "bg-[#0081A7]"}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <p className="font-sarabun text-caption text-status-error">{error}</p>
      )}
    </div>
  );
}

function UploadIcon() {
  return (
    <svg
      className="h-8 w-8"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M9 16h6v-6h4l-7-7-7 7h4v6Zm-4 2h14v2H5v-2Z" />
    </svg>
  );
}
