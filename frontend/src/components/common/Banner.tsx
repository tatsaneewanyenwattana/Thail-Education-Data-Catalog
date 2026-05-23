"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

function CampaignIcon() {
  return (
    <svg
      className="h-5 w-5 shrink-0 text-primary"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

export default function Banner() {
  const t = useTranslations("home.banner");
  const [visible, setVisible] = useState(true);

  if (!visible) {
    return null;
  }

  return (
    <div
      className="border-l-4 border-primary bg-primary-light px-4 py-3 md:px-10"
      role="region"
      aria-label={t("label")}
    >
      <div className="mx-auto flex max-w-container-max items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <CampaignIcon />
          <p className="font-sarabun text-label font-medium text-status-published">
            {t("message")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="shrink-0 rounded-radius-full p-1 text-status-published transition-colors hover:bg-surface-card/50"
          aria-label={t("close")}
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}
