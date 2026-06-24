"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect } from "react";
import apiClient from "@/services/api";
import { useAuthStore } from "@/stores/useAuthStore";
import { useUIStore } from "@/stores/useUIStore";

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
    case "activity":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M13 3a9 9 0 1 0 8.95 10h-2.02A7 7 0 1 1 17 6.1V9h2V3h-6v2h3.27A8.96 8.96 0 0 0 13 3Zm-1 5h2v5l4.25 2.52-1 1.73L12 14V8Z" />
        </svg>
      );
    case "scholarship":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 3 1 9l4 2.18v6L12 21l7-3.82v-6L23 9 12 3zm0 2.18 6.5 3.5L12 12.18 5.5 8.68 12 5.18zM7 11.09v4.36L12 18.5l5-3.05v-4.36L12 14.82 7 11.09z" />
        </svg>
      );
    default:
      return null;
  }
}

function BrandLogo() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-dark">
      <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 3 1 9l4 2.18v6L12 21l7-3.82v-6L23 9 12 3zm0 2.18 6.5 3.5L12 12.18 5.5 8.68 12 5.18zM7 11.09v4.36L12 18.5l5-3.05v-4.36L12 14.82 7 11.09z" />
      </svg>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function SidebarBrand({ onNavigate }: { onNavigate?: () => void }) {
  const locale = useLocale();
  const base = `/${locale}`;
  const t = useTranslations("agency.sidebar");

  return (
    <div className="px-5 pb-4 pt-6">
      <Link
        href={`${base}/dashboard`}
        onClick={onNavigate}
        className="flex items-center gap-3"
      >
        <BrandLogo />
        <div>
          <p className="font-kanit text-body-md font-bold leading-tight text-primary-dark">
            Thai EduData
          </p>
          <p className="font-sarabun text-caption text-text-muted">
            Insight Portal
          </p>
        </div>
      </Link>

      <Link
        href={`${base}/datasets/create`}
        onClick={onNavigate}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-primary-dark py-2.5 font-sarabun text-label font-medium text-white shadow-level-1 transition-all hover:opacity-90 active:scale-[0.98]"
      >
        <PlusIcon />
        {t("publishDataset")}
      </Link>
    </div>
  );
}

function SidebarNav({
  items,
  pathname,
  onNavigate,
}: {
  items: NavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  const t = useTranslations("agency.sidebar");

  return (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
      {items.map((item) => {
        const active = item.match(pathname);
        return (
          <div key={item.href}>
            {item.dividerBefore ? (
              <div className="my-3 border-t border-border-default/50" />
            ) : null}
            <Link
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 font-sarabun text-label transition-all ${
                active
                  ? "bg-primary-light font-medium text-primary-dark"
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
  );
}

function SidebarFooter({ onNavigate }: { onNavigate?: () => void }) {
  const locale = useLocale();
  const router = useRouter();
  const base = `/${locale}`;
  const tNav = useTranslations("nav");
  const handleLogout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // still clear local session
    } finally {
      localStorage.removeItem("token");
      useAuthStore.getState().logout();
      onNavigate?.();
      router.push(`${base}/login`);
    }
  };

  return (
    <div className="mt-auto border-t border-border-default/30 px-3 py-4">
      <Link
        href={`${base}/help-center`}
        onClick={onNavigate}
        className="mb-1 flex items-center gap-3 rounded-xl px-4 py-2.5 font-sarabun text-label text-text-muted transition-colors hover:bg-surface-container hover:text-primary-dark"
      >
        <HelpIcon />
        Help Center
      </Link>
      <button
        type="button"
        onClick={handleLogout}
        className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 font-sarabun text-label text-[#ba1a1a] transition-colors hover:bg-[#ffdad6]"
      >
        <LogoutIcon />
        {tNav("logout")}
      </button>
    </div>
  );
}

function HelpIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M11 18h2v-2h-2v2Zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8Zm0-14c-2.21 0-4 1.79-4 4h2a2 2 0 1 1 4 0c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4Z" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
    </svg>
  );
}

export default function AgencySidebar() {
  const t = useTranslations("agency.sidebar");
  const locale = useLocale();
  const pathname = usePathname();
  const base = `/${locale}`;
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore();

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
    {
      href: `${base}/manage/scholarships`,
      labelKey: "scholarships",
      icon: "scholarship",
      match: (p) => p.startsWith(`${base}/manage/scholarships`),
    },
    {
      href: `${base}/activity`,
      labelKey: "activityLog",
      icon: "activity",
      match: (p) => p.startsWith(`${base}/activity`),
    },
  ];

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  const closeDrawer = () => setSidebarOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={toggleSidebar}
        className="fixed bottom-6 left-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-border-default bg-surface-card text-text-secondary shadow-level-2 lg:hidden"
        aria-label={t("menu")}
      >
        <MenuIcon />
      </button>

      <aside className="hidden w-[260px] shrink-0 flex-col border-l-4 border-l-primary-dark border-r border-r-border-sidebar bg-surface-card lg:flex">
        <SidebarBrand />
        <SidebarNav items={items} pathname={pathname} />
        <SidebarFooter />
      </aside>

      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="presentation">
          <button
            type="button"
            className="absolute inset-0 bg-surface-navy/40 backdrop-blur-sm"
            onClick={closeDrawer}
            aria-label={t("closeMenu")}
          />
          <aside className="absolute left-0 top-0 flex h-full w-[260px] flex-col border-l-4 border-l-primary-dark border-r border-r-border-sidebar bg-surface-card shadow-level-3">
            <div className="flex items-center justify-between px-5 pt-5">
              <div className="flex items-center gap-3">
                <BrandLogo />
                <div>
                  <p className="font-kanit text-body-md font-bold leading-tight text-primary-dark">
                    Thai EduData
                  </p>
                  <p className="font-sarabun text-caption text-text-muted">
                    Insight Portal
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                className="flex h-10 w-10 items-center justify-center rounded-full text-text-muted hover:bg-surface-container"
                aria-label={t("closeMenu")}
              >
                <CloseIcon />
              </button>
            </div>
            <div className="px-5 pb-2 pt-4">
              <Link
                href={`${base}/datasets/create`}
                onClick={closeDrawer}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-primary-dark py-2.5 font-sarabun text-label font-medium text-white shadow-level-1 transition-all hover:opacity-90 active:scale-[0.98]"
              >
                <PlusIcon />
                {t("publishDataset")}
              </Link>
            </div>
            <SidebarNav
              items={items}
              pathname={pathname}
              onNavigate={closeDrawer}
            />
            <SidebarFooter onNavigate={closeDrawer} />
          </aside>
        </div>
      ) : null}
    </>
  );
}
