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
    case "users":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3Zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3Zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5Zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5Z" />
        </svg>
      );
    case "datasets":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M4 4h16v4H4V4Zm0 6h10v4H4v-4Zm0 6h16v4H4v-4Z" />
        </svg>
      );
    case "categories":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="m12 2 2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7l2-7Z" />
        </svg>
      );
    case "announcements":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M18 11v2h4v-2h-4Zm-2 6.61c.96.71 2.21 1.65 3.2 2.39.4-.31.79-.62 1.2-.92v-14.16l-5.5 3.32c-.55-.34-1.16-.62-1.87-.62-1.93 0-3.5 1.57-3.5 3.5 0 1.93 1.57 3.5 3.5 3.5.71 0 1.32-.28 1.87-.62l5.3 3.19ZM9 4v16h2V4H9Z" />
        </svg>
      );
    case "pages":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M20 4H4c-1.1 0-2 0.9-2 2v12c0 1.1 0.9 2 2 2h16c1.1 0 2-0.9 2-2V6c0-1.1-0.9-2-2-2Zm0 14H4V8h16v10Z" />
        </svg>
      );
    case "audit":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18Zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12Z" />
        </svg>
      );
    default:
      return null;
  }
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
      <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 0.9-2 2v14c0 1.1 0.9 2 2 2h8v-2H4V5z" />
    </svg>
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
  const t = useTranslations("admin.nav");

  return (
    <nav className="flex flex-1 flex-col gap-1 px-2 py-spacing-4">
      {items.map((item) => {
        const active = item.match(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex min-h-[44px] items-center gap-3 rounded-r-radius-lg px-4 py-2.5 font-sarabun text-label transition-all ${
              active
                ? "border-l-[3px] border-primary-dark bg-primary-light font-medium text-primary-dark"
                : "text-text-muted hover:bg-surface-container hover:text-primary-dark"
            }`}
          >
            <NavIcon name={item.icon} />
            {t(item.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter({ onNavigate }: { onNavigate?: () => void }) {
  const locale = useLocale();
  const router = useRouter();
  const base = `/${locale}`;
  const tNav = useTranslations("admin.nav");
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
    <div className="border-t border-border-default px-2 py-4">
      <Link
        href={`${base}/help-center`}
        onClick={onNavigate}
        className="mb-1 flex min-h-[44px] items-center gap-3 rounded-radius-lg px-4 py-2.5 font-sarabun text-label text-text-muted transition-colors hover:bg-surface-container hover:text-primary-dark"
      >
        <HelpIcon />
        {tNav("helpCenter")}
      </Link>
      <button
        type="button"
        onClick={handleLogout}
        className="flex min-h-[44px] w-full items-center gap-3 rounded-radius-lg px-4 py-2.5 font-sarabun text-label text-status-error transition-colors hover:bg-status-error-bg"
      >
        <LogoutIcon />
        {tNav("logout")}
      </button>
    </div>
  );
}

export default function AdminSidebar() {
  const t = useTranslations("admin.nav");
  const locale = useLocale();
  const pathname = usePathname();
  const base = `/${locale}`;
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore();

  const items: NavItem[] = [
    {
      href: `${base}/admin`,
      labelKey: "dashboard",
      icon: "dashboard",
      match: (p) => p === `${base}/admin`,
    },
    {
      href: `${base}/admin/users`,
      labelKey: "users",
      icon: "users",
      match: (p) => p.startsWith(`${base}/admin/users`),
    },
    {
      href: `${base}/admin/datasets`,
      labelKey: "datasets",
      icon: "datasets",
      match: (p) => p.startsWith(`${base}/admin/datasets`),
    },
    {
      href: `${base}/admin/categories`,
      labelKey: "categories",
      icon: "categories",
      match: (p) => p.startsWith(`${base}/admin/categories`),
    },
    {
      href: `${base}/admin/announcements`,
      labelKey: "announcements",
      icon: "announcements",
      match: (p) => p.startsWith(`${base}/admin/announcements`),
    },
    {
      href: `${base}/admin/pages`,
      labelKey: "pages",
      icon: "pages",
      match: (p) => p.startsWith(`${base}/admin/pages`),
    },
    {
      href: `${base}/admin/audit-logs`,
      labelKey: "auditLogs",
      icon: "audit",
      match: (p) => p.startsWith(`${base}/admin/audit-logs`),
    },
  ];

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  const closeDrawer = () => setSidebarOpen(false);

  const sidebarHeader = (
    <div className="border-b border-border-default px-4 py-spacing-6">
      <h2 className="font-kanit text-body-lg font-bold text-primary-dark">
        Thai EduData
      </h2>
      <p className="font-sarabun text-caption text-text-muted">{t("portal")}</p>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={toggleSidebar}
        className="fixed bottom-6 left-4 z-40 flex h-11 w-11 items-center justify-center rounded-radius-md border border-border-default bg-surface-card text-text-secondary shadow-level-2 lg:hidden"
        aria-label={t("menu")}
      >
        <MenuIcon />
      </button>

      <aside className="hidden h-full w-[240px] shrink-0 flex-col border-r border-border-sidebar bg-surface-card lg:flex">
        {sidebarHeader}
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
          <aside className="absolute left-0 top-0 flex h-full w-[280px] flex-col border-r border-border-sidebar bg-surface-card shadow-level-3">
            <div className="flex items-center justify-between border-b border-border-default px-4 py-4">
              <span className="font-kanit text-label font-semibold text-primary-dark">
                {t("menu")}
              </span>
              <button
                type="button"
                onClick={closeDrawer}
                className="flex h-10 w-10 items-center justify-center rounded-radius-sm text-text-muted hover:bg-surface-container"
                aria-label={t("closeMenu")}
              >
                <CloseIcon />
              </button>
            </div>
            {sidebarHeader}
            <SidebarNav items={items} pathname={pathname} onNavigate={closeDrawer} />
            <SidebarFooter onNavigate={closeDrawer} />
          </aside>
        </div>
      ) : null}
    </>
  );
}
