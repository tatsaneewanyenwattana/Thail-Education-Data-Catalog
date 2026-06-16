"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

type SidebarProps = {
  variant: "agency" | "admin";
};

type NavItem = {
  href: string;
  labelKey: string;
  icon: string;
  match: (path: string) => boolean;
  dividerBefore?: boolean;
};

function NavIcon({ name }: { name: string }) {
  const className = "h-5 w-5 shrink-0";

  switch (name) {
    case "dashboard":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M3 13h8V3H3v10Zm10 8h8V11h-8v10ZM3 21h8v-6H3v6Zm10-8h8V3h-8v10Z" />
        </svg>
      );
    case "datasets":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M4 4h16v4H4V4Zm0 6h10v4H4v-4Zm0 6h16v4H4v-4Z" />
        </svg>
      );
    case "upload":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M9 16h6v-6h4l-7-7-7 7h4v6Zm-4 2h14v2H5v-2Z" />
        </svg>
      );
    case "bulk":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z" />
        </svg>
      );
    case "categories":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="m12 2 2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7l2-7Z" />
        </svg>
      );
    case "saved":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2Z" />
        </svg>
      );
    case "custom":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M3 13h2v8H3v-8Zm4-6h2v14H7V7Zm4 4h2v10h-2V11Zm4-8h2v18h-2V3Zm4 12h2v6h-2v-6Z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Sidebar({ variant }: SidebarProps) {
  const t = useTranslations("agency.sidebar");
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "th";
  const base = `/${locale}`;

  if (variant === "admin") {
    return (
      <aside className="hidden w-60 shrink-0 border-r border-border-sidebar bg-surface-card lg:flex lg:flex-col">
        <div className="p-4 font-sarabun text-label text-text-muted">
          Admin sidebar
        </div>
      </aside>
    );
  }

  const items: NavItem[] = [
    {
      href: `${base}/dashboard`,
      labelKey: "dashboard",
      icon: "dashboard",
      match: (p) => p === `${base}/dashboard`,
    },
    {
      href: `${base}/datasets`,
      labelKey: "myDatasets",
      icon: "datasets",
      match: (p) =>
        p === `${base}/datasets` ||
        (p.startsWith(`${base}/datasets/`) &&
          !p.includes("/create") &&
          !p.includes("/bulk-upload") &&
          !p.includes("/edit") &&
          !p.includes("/versions")),
    },
    {
      href: `${base}/datasets/create`,
      labelKey: "upload",
      icon: "upload",
      match: (p) => p.startsWith(`${base}/datasets/create`),
    },
    {
      href: `${base}/datasets/bulk-upload`,
      labelKey: "bulkUpload",
      icon: "bulk",
      match: (p) => p.startsWith(`${base}/datasets/bulk-upload`),
    },
    {
      href: `${base}/manage/categories`,
      labelKey: "categories",
      icon: "categories",
      match: (p) => p.startsWith(`${base}/manage/categories`),
    },
  ];

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border-sidebar bg-surface-card lg:flex">
      <nav className="flex flex-1 flex-col gap-1 px-2 py-spacing-6">
        {items.map((item) => {
          const active = item.match(pathname);
          return (
            <div key={item.href}>
              {item.dividerBefore ? (
                <div className="mb-2 mt-4 border-t border-border-default/50 pt-4" />
              ) : null}
              <Link
                href={item.href}
                className={`flex items-center gap-3 rounded-r-radius-lg px-4 py-2.5 font-sarabun text-label transition-all ${
                  active
                    ? "border-l-[3px] border-primary-dark bg-primary-light font-medium text-primary-dark"
                    : "text-text-muted hover:bg-surface-container hover:text-primary-dark"
                }`}
              >
                <NavIcon name={item.icon} />
                {t(item.labelKey)}
              </Link>
            </div>
          );
        })}
      </nav>
      <div className="px-4 pb-4">
        <Link
          href={`${base}/datasets/create`}
          className="flex w-full items-center justify-center gap-2 rounded-radius-xl bg-primary-dark py-3 font-sarabun text-label font-medium text-surface-card shadow-level-1 transition-colors hover:bg-primary-hover"
        >
          <NavIcon name="upload" />
          {t("publishDataset")}
        </Link>
      </div>
    </aside>
  );
}
