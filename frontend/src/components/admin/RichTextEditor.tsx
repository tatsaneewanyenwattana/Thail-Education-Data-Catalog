"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type RichTextEditorProps = {
  contentTh: string;
  contentEn: string;
  onChangeTh: (value: string) => void;
  onChangeEn: (value: string) => void;
  disabled?: boolean;
};

type EditorTab = "th" | "en";

export default function RichTextEditor({
  contentTh,
  contentEn,
  onChangeTh,
  onChangeEn,
  disabled = false,
}: RichTextEditorProps) {
  const t = useTranslations("admin.pages");
  const [activeTab, setActiveTab] = useState<EditorTab>("th");

  const value = activeTab === "th" ? contentTh : contentEn;
  const onChange = activeTab === "th" ? onChangeTh : onChangeEn;

  return (
    <div className="rounded-radius-lg border border-border-default bg-surface-card">
      <div className="flex border-b border-border-default">
        <button
          type="button"
          onClick={() => setActiveTab("th")}
          className={`px-6 py-3 font-sarabun text-label font-semibold transition-colors ${
            activeTab === "th"
              ? "border-b-2 border-primary text-primary"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          {t("editTab.th")}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("en")}
          className={`px-6 py-3 font-sarabun text-label font-semibold transition-colors ${
            activeTab === "en"
              ? "border-b-2 border-primary text-primary"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          {t("editTab.en")}
        </button>
      </div>

      <div className="p-4">
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          rows={18}
          placeholder={t("contentPlaceholder")}
          className="min-h-[360px] w-full resize-y rounded-radius-md border border-border-default bg-surface-container/30 px-4 py-3 font-sarabun text-body-md text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>
    </div>
  );
}
