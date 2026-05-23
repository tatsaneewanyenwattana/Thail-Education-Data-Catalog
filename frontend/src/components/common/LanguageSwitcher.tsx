"use client";

import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
  };

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => switchLocale("th")}
        className={
          currentLocale === "th"
            ? "font-semibold text-primary-dark"
            : "text-text-muted hover:text-primary-dark"
        }
      >
        TH
      </button>
      <span className="text-border-default">|</span>
      <button
        type="button"
        onClick={() => switchLocale("en")}
        className={
          currentLocale === "en"
            ? "font-semibold text-primary-dark"
            : "text-text-muted hover:text-primary-dark"
        }
      >
        EN
      </button>
    </div>
  );
}
