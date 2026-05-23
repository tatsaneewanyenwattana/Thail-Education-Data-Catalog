"use client";

import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { type FormEvent, useState } from "react";

type SearchBarProps = {
  defaultValue?: string;
  size?: "default" | "large";
  className?: string;
};

export default function SearchBar({
  defaultValue = "",
  size = "default",
  className = "",
}: SearchBarProps) {
  const t = useTranslations("search");
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || "th";
  const [keyword, setKeyword] = useState(defaultValue);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const q = keyword.trim();
    if (q.length < 2) return;
    router.push(`/${locale}/search?q=${encodeURIComponent(q)}`);
  }

  const inputClass =
    size === "large"
      ? "h-12 text-body-lg"
      : "h-10 text-body-md";

  return (
    <form onSubmit={handleSubmit} className={`flex w-full gap-2 ${className}`}>
      <input
        type="search"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder={t("placeholder")}
        className={`flex-1 rounded-radius-sm border border-border-input bg-surface-card px-3 font-sarabun text-text-primary outline-none focus:border-border-focus focus:ring-2 focus:ring-primary-dark/20 ${inputClass}`}
        aria-label={t("keyword")}
      />
      <button
        type="submit"
        className="shrink-0 rounded-radius-sm bg-primary px-4 font-sarabun text-label font-medium text-white transition-colors hover:bg-primary-hover min-h-[44px] md:min-h-[40px]"
      >
        {t("submit", { defaultValue: "ค้นหา" })}
      </button>
    </form>
  );
}
