"use client";

import { useState } from "react";
import DatasetForm from "@/components/dataset/DatasetForm";
import MultiFileUpload from "@/components/dataset/MultiFileUpload";

export default function CreateDatasetPage() {
  const [mode, setMode] = useState<"single" | "multi">("single");

  return (
    <div>
      {/* Mode toggle */}
      <div className="mx-auto mb-6 flex max-w-[800px] items-center gap-1.5 rounded-full bg-surface-container p-1.5">
        <button
          type="button"
          onClick={() => setMode("single")}
          className={`flex-1 rounded-full px-5 py-2.5 font-sarabun text-label font-medium transition-all ${
            mode === "single"
              ? "bg-surface-card text-primary-dark shadow-level-1"
              : "text-text-muted hover:text-text-secondary"
          }`}
        >
          ไฟล์เดียว
        </button>
        <button
          type="button"
          onClick={() => setMode("multi")}
          className={`flex-1 rounded-full px-5 py-2.5 font-sarabun text-label font-medium transition-all ${
            mode === "multi"
              ? "bg-surface-card text-primary-dark shadow-level-1"
              : "text-text-muted hover:text-text-secondary"
          }`}
        >
          หลายไฟล์
        </button>
      </div>

      {mode === "single" ? <DatasetForm mode="create" /> : <MultiFileUpload />}
    </div>
  );
}
