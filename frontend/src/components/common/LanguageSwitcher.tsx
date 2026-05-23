"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2 font-sarabun text-label">
      <button
        type="button"
        onClick={() => switchLocale("th")}
        className={
          currentLocale === "th"
            ? "font-semibold text-primary-dark"
            : "text-text-muted"
        }
        aria-current={currentLocale === "th" ? "true" : undefined}
      >
        TH
      </button>
      <span className="text-border-default" aria-hidden>
        |
      </span>
      <button
        type="button"
        onClick={() => switchLocale("en")}
        className={
          currentLocale === "en"
            ? "font-semibold text-primary-dark"
            : "text-text-muted"
        }
        aria-current={currentLocale === "en" ? "true" : undefined}
      >
        EN
      </button>
    </div>
  );
}
