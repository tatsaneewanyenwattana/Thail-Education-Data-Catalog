"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

function UploadIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M9 16h6v-6h4l-7-7-7 7h4v6Zm-4 2h14v2H5v-2Z" />
    </svg>
  );
}

function SchoolIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
    </svg>
  );
}

function CategoryIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="m12 2 2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7l2-7Z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );
}

export default function QuickActions() {
  const t = useTranslations("agency.dashboard");
  const locale = useLocale();
  const base = `/${locale}`;

  const actions = [
    {
      href: `${base}/datasets/create`,
      label: "อัปโหลด Dataset",
      icon: UploadIcon,
    },
    {
      href: `${base}/manage/scholarships`,
      label: "จัดการทุนการศึกษา",
      icon: SchoolIcon,
    },
    {
      href: `${base}/manage/categories`,
      label: "จัดการหมวดหมู่",
      icon: CategoryIcon,
    },
    {
      href: `${base}/profile`,
      label: "โปรไฟล์",
      icon: UserIcon,
    },
  ];

  return (
    <div className="rounded-2xl border border-border-default/60 bg-surface-card p-6 shadow-level-1">
      <h3 className="font-kanit text-heading-3-mobile font-semibold text-text-primary mb-4">
        Quick actions
      </h3>
      <div className="flex flex-col gap-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center gap-3 rounded-xl border border-border-default/60 px-4 py-3 text-text-primary transition-colors hover:bg-surface-1"
            >
              <Icon />
              <span className="font-sarabun text-label">{action.label}</span>
              <svg
                className="ml-auto h-4 w-4 text-text-muted"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
