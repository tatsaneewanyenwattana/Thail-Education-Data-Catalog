"use client";

import { useTranslations } from "next-intl";
import { KeyboardEvent, useState } from "react";

type TagInputProps = {
  value: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
  error?: string;
  /** แท็กที่เคยใช้ในหมวดหมู่ — คลิกเพื่อเพิ่ม */
  suggestions?: string[];
  suggestionsHint?: string;
};

export default function TagInput({
  value,
  onChange,
  maxTags = 10,
  error,
  suggestions = [],
  suggestionsHint,
}: TagInputProps) {
  const t = useTranslations("agency.upload");
  const [input, setInput] = useState("");
  const [limitError, setLimitError] = useState<string | null>(null);

  const addTag = (raw: string) => {
    const tag = raw.trim();
    if (!tag) {
      return;
    }
    if (value.includes(tag)) {
      setInput("");
      return;
    }
    if (value.length >= maxTags) {
      setLimitError(t("fieldTagsMax"));
      return;
    }
    setLimitError(null);
    onChange([...value, tag]);
    setInput("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag(input);
    }
  };

  const availableSuggestions = suggestions.filter(
    (tag) => !value.includes(tag)
  );

  return (
    <div>
      {availableSuggestions.length > 0 && (
        <div className="mb-3">
          {suggestionsHint && (
            <p className="mb-2 font-sarabun text-caption text-text-muted">
              {suggestionsHint}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {availableSuggestions.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => addTag(tag)}
                className="inline-flex items-center gap-1 rounded-radius-full border border-dashed border-primary-dark/40 bg-surface-page px-3 py-1 font-sarabun text-caption font-medium text-primary-dark transition-colors hover:border-primary-dark hover:bg-primary-light"
              >
                <PlusIcon />
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="mb-2 flex flex-wrap gap-2">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-radius-full bg-primary-light px-3 py-1 font-sarabun text-caption font-medium text-primary-dark"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((item) => item !== tag))}
              className="text-primary-dark hover:text-primary-hover"
              aria-label={t("removeTag", { tag })}
            >
              <CloseIcon />
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addTag(input)}
        placeholder={t("fieldTagsPlaceholder")}
        className="w-full rounded-radius-md border border-border-input bg-surface-page px-4 py-3 font-sarabun text-label text-text-primary outline-none transition-all focus:border-border-focus focus:ring-2 focus:ring-primary-dark/20"
      />
      <p className="mt-1 font-sarabun text-caption italic text-text-muted">
        {t("fieldTagsHint")}
      </p>
      {(error || limitError) && (
        <p className="mt-1 font-sarabun text-caption text-status-error">
          {error ?? limitError}
        </p>
      )}
    </div>
  );
}

function CloseIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.3 5.71 12 12.41 5.7 5.71 4.29 7.12 10.59 13.41 4.3 19.71 5.71 21.12 12 14.82 18.29 21.12 19.7 19.71 13.41 13.41 19.7 7.12 18.3 5.71Z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
    </svg>
  );
}
