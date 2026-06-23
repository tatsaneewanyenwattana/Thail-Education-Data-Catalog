"use client";

import { useCallback, useRef, useState } from "react";
import { useTranslations } from "next-intl";

type RichTextEditorProps = {
  contentTh: string;
  contentEn: string;
  onChangeTh: (value: string) => void;
  onChangeEn: (value: string) => void;
  disabled?: boolean;
};

type EditorTab = "th" | "en";

const TOOLBAR_ITEMS = [
  { label: "B", style: "font-bold", insert: "**", wrap: true },
  { label: "I", style: "italic", insert: "*", wrap: true },
  { label: "🔗", style: "", insert: "[text](url)", wrap: false },
  { label: "H1", style: "font-bold", insert: "# ", wrap: false },
  { label: "H2", style: "font-bold", insert: "## ", wrap: false },
  { label: "⋮≡", style: "", insert: "- ", wrap: false },
  { label: "1.", style: "", insert: "1. ", wrap: false },
  { label: "</>", style: "font-mono", insert: "`", wrap: true },
  { label: "🖼", style: "", insert: "![alt](url)", wrap: false },
];

export default function RichTextEditor({
  contentTh,
  contentEn,
  onChangeTh,
  onChangeEn,
  disabled = false,
}: RichTextEditorProps) {
  const t = useTranslations("admin.pages");
  const [activeTab, setActiveTab] = useState<EditorTab>("th");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const value = activeTab === "th" ? contentTh : contentEn;
  const onChange = activeTab === "th" ? onChangeTh : onChangeEn;

  const handleToolbarClick = useCallback(
    (insert: string, wrap: boolean) => {
      const el = textareaRef.current;
      if (!el) return;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const selected = value.substring(start, end);

      let newText: string;
      let cursorPos: number;

      if (wrap && selected.length > 0) {
        newText =
          value.substring(0, start) +
          insert +
          selected +
          insert +
          value.substring(end);
        cursorPos = end + insert.length * 2;
      } else {
        newText = value.substring(0, start) + insert + value.substring(end);
        cursorPos = start + insert.length;
      }

      onChange(newText);
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(cursorPos, cursorPos);
      });
    },
    [value, onChange]
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-white/80 bg-white shadow-md">
      {/* Tabs */}
      <div className="flex items-center border-b border-gray-100 px-8 pt-5">
        <button
          type="button"
          onClick={() => setActiveTab("th")}
          className={`relative px-6 pb-4 font-sarabun text-lg font-semibold transition-colors ${
            activeTab === "th"
              ? "text-primary-dark after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:rounded-full after:bg-primary-dark"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          TH (ภาษาไทย)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("en")}
          className={`relative px-6 pb-4 font-sarabun text-lg font-semibold transition-colors ${
            activeTab === "en"
              ? "text-primary-dark after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:rounded-full after:bg-primary-dark"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          EN (English)
        </button>
      </div>

      {/* Toolbar */}
      <div className="border-b border-gray-100 px-8 py-3">
        <div className="flex items-center gap-2">
          {TOOLBAR_ITEMS.map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleToolbarClick(item.insert, item.wrap)}
              disabled={disabled}
              className={`flex h-10 w-10 items-center justify-center rounded-lg text-base text-text-secondary transition-colors hover:bg-gray-100 hover:text-text-primary disabled:opacity-40 ${item.style}`}
              title={item.label}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content area */}
      <div className="p-8">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          rows={24}
          placeholder={t("contentPlaceholder")}
          className="min-h-[500px] w-full resize-y border-0 bg-transparent px-0 py-0 font-sarabun text-lg leading-relaxed text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>
    </div>
  );
}
