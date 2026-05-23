"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";

type NavbarProps = {
  variant: "public" | "auth" | "agency" | "admin";
};

export default function Navbar({ variant }: NavbarProps) {
  const t = useTranslations("nav");
  const params = useParams();
  const locale = (params.locale as string) || "th";

  return (
    <header
      className="sticky top-0 z-50 flex h-16 items-center border-b border-white/60 px-4 md:px-10"
      style={{
        background: "rgba(255, 255, 255, 0.55)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="flex w-full items-center gap-4">
        <Link
          href={`/${locale}`}
          className="shrink-0 font-kanit text-label font-bold text-primary-dark md:text-body-lg"
        >
          Thai EduData Insight
        </Link>

        {variant === "public" && (
          <div className="mx-4 hidden flex-1 md:block">
            <div className="h-10 rounded-radius-sm border border-border-input bg-surface-card px-3 font-sarabun text-body-md text-text-muted">
              {t("search")}...
            </div>
          </div>
        )}

        <div className="ml-auto flex items-center gap-4">
          <LanguageSwitcher />

          {variant === "public" && (
            <Link
              href={`/${locale}/login`}
              className="font-sarabun text-label font-medium text-primary-dark hover:text-primary"
            >
              {t("login")}
            </Link>
          )}

          {(variant === "agency" || variant === "admin") && (
            <span className="font-sarabun text-label text-text-muted">
              User menu
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
