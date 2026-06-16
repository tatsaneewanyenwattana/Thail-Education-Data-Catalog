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

type FileUploadZoneProps = {
  onAnalyzed: (result: PIIScanResult, file: File) => void;
  disabled?: boolean;
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
}: FileUploadZoneProps) {
  const t = useTranslations("agency.upload");
  const { scanFile } = usePIIScan();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
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
    setFileName(file.name);
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
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (disabled || isUploading) {
      return;
    }
    const file = event.dataTransfer.files[0];
    if (file) {
      void processFile(file);
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
        className={`mb-spacing-6 flex flex-col items-center justify-center rounded-radius-md border-2 border-dashed border-border-input bg-surface-page p-spacing-12 text-center transition-colors ${
          disabled || isUploading
            ? "cursor-not-allowed opacity-60"
            : "cursor-pointer hover:bg-surface-container"
        }`}
        onClick={() => {
          if (!disabled && !isUploading) {
            inputRef.current?.click();
          }
        }}
      >
        <UploadIcon />
        <p className="mb-4 font-sarabun text-body-md text-text-muted">
          {t("dropzone")}
        </p>
        <button
          type="button"
          disabled={disabled || isUploading}
          className="rounded-radius-xl border-2 border-primary-dark px-6 py-2 font-sarabun text-label text-primary-dark transition-colors hover:bg-primary-light disabled:opacity-50"
          onClick={(event) => {
            event.stopPropagation();
            inputRef.current?.click();
          }}
        >
          {t("dropzoneClick")}
        </button>
        <p className="mt-3 font-sarabun text-caption text-text-muted">
          {t("dropzoneHint")}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls,.json,.pdf,.sql"
          className="hidden"
          disabled={disabled || isUploading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              void processFile(file);
            }
          }}
        />
      </div>

      {fileName && (
        <p className="mb-2 font-sarabun text-label text-text-secondary">
          {fileName}
        </p>
      )}

      {isUploading && (
        <div className="mb-4">
          <div className="mb-1 flex justify-between font-sarabun text-caption text-text-muted">
            <span>{t("uploading")}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full rounded-radius-full bg-surface-container">
            <div
              className="h-2 rounded-radius-full bg-primary transition-all"
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
      className="mb-3 h-12 w-12 text-text-muted"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-3.96ZM12 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.66-3.73 3.71-3.98l.49-.05.43-.07.08-.49C8.83 7.69 10.22 6 12 6c2.76 0 5 2.24 5 5h1c1.66 0 3 1.34 3 3s-1.34 3-3 3h-6v-2h4.5c.83 0 1.5-.67 1.5-1.5S17.33 12 16.5 12H12v6Z" />
    </svg>
  );
}
