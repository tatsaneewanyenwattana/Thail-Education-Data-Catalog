"use client";

import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";

export default function LanguageSwitcher({ variant = "default" }: { variant?: "default" | "admin" }) {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
  };

  const isAdmin = variant === "admin";
  const activeClass = isAdmin ? "font-semibold text-white" : "font-semibold text-primary-dark";
  const inactiveClass = isAdmin ? "text-white/60 hover:text-white" : "text-text-muted hover:text-primary-dark";
  const dividerClass = isAdmin ? "text-white/30" : "text-border-default";

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => switchLocale("th")}
        className={currentLocale === "th" ? activeClass : inactiveClass}
      >
        TH
      </button>
      <span className={dividerClass}>|</span>
      <button
        type="button"
        onClick={() => switchLocale("en")}
        className={currentLocale === "en" ? activeClass : inactiveClass}
      >
        EN
      </button>
    </div>
  );
}
