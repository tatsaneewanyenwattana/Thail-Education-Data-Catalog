"use client";

import { useHeroImage } from "@/hooks/useHeroImage";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { type FormEvent, useState } from "react";
import StatsOverview from "@/components/common/StatsOverview";

function SearchIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

export default function HeroSearch() {
  const t = useTranslations("home.hero");
  const locale = useLocale();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const { data: heroImage } = useHeroImage();
  const heroUrl = heroImage?.imageUrl ?? null;

  const handleSearch = (e?: FormEvent) => {
    e?.preventDefault();
    const q = query.trim();
    const params = new URLSearchParams();
    if (q) {
      params.set("q", q);
    }
    const qs = params.toString();
    router.push(`/${locale}/search${qs ? `?${qs}` : ""}`);
  };

  return (
    <section
      className={`relative overflow-hidden py-16 text-white md:py-24 ${
        heroUrl ? "" : "bg-gradient-to-br from-primary-dark to-primary"
      }`}
    >
      {heroUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-gradient-to-br from-primary-dark/80 to-primary/70"
            aria-hidden
          />
        </>
      ) : (
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          aria-hidden
        >
          <div className="absolute -left-20 -top-20 h-96 w-96 rounded-radius-full bg-surface-card blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-96 w-96 rounded-radius-full bg-surface-card blur-3xl" />
        </div>
      )}

      <div className="relative z-10 mx-auto flex max-w-container-max flex-col items-center px-4 text-center md:px-10">
        <h1 className="font-kanit text-heading-1 text-white md:text-display md:leading-[60px]">
          {t("heading")}
        </h1>
        <p className="mt-4 max-w-2xl font-sarabun text-body-lg text-white/85">
          {t("subheading")}
        </p>

        <form
          onSubmit={handleSearch}
          className="mt-8 flex w-full max-w-2xl flex-col gap-2 rounded-radius-lg bg-surface-card p-2 shadow-level-3 sm:flex-row"
        >
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="min-h-[44px] flex-1 rounded-radius-sm border-0 bg-transparent px-4 font-sarabun text-body-md text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-dark/20"
            aria-label={t("searchPlaceholder")}
          />
          <button
            type="submit"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-radius-sm bg-primary-dark px-8 font-sarabun text-label font-bold text-white transition-colors hover:bg-primary-hover"
          >
            <SearchIcon />
            {t("searchButton")}
          </button>
        </form>

        <StatsOverview />
      </div>
    </section>
  );
}
