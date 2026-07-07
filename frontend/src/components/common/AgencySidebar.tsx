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
    case "categories":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="m12 2 2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7l2-7Z" />
        </svg>
      );
    case "scholarship":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
        </svg>
      );
    case "activity":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18Zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12Z" />
        </svg>
      );
    case "profile":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
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

function LogoutIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
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
  const t = useTranslations("agency.sidebar");

  return (
    <nav className="flex flex-1 flex-col gap-1 px-4 py-3">
      {items.map((item) => {
        const active = item.match(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex h-[48px] items-center gap-3 px-4 py-2.5 font-sarabun text-label transition-all ${
              active
                ? "-mr-4 rounded-l-xl rounded-r-none bg-white font-medium text-[#2d8a2c]"
                : "rounded-xl text-white/60 hover:bg-white/[0.05] hover:text-white"
            }`}
          >
            <span className={active ? "text-[#42bd41]" : ""}>
              <NavIcon name={item.icon} />
            </span>
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
  const tNav = useTranslations("nav");
  const handleLogout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // still clear local session
    } finally {
      useAuthStore.getState().logout();
      onNavigate?.();
      router.push(`${base}/login`);
    }
  };

  return (
    <div className="border-t border-white/10 px-4 py-6">
      <button
        type="button"
        onClick={handleLogout}
        className="flex h-[48px] w-full items-center justify-center gap-3 rounded-xl px-4 py-2.5 font-sarabun text-label font-normal text-white/80 transition-colors hover:bg-white/[0.10] hover:text-white"
      >
        <LogoutIcon />
        {tNav("logout")}
      </button>
    </div>
  );
}

export default function AgencySidebar() {
  const t = useTranslations("agency.sidebar");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const base = `/${locale}`;
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore();

  const switchLocale = (target: string) => {
    const newPath = pathname.replace(`/${locale}`, `/${target}`);
    router.push(newPath);
  };

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
    {
      href: `${base}/profile`,
      labelKey: "profile",
      icon: "profile",
      match: (p) => p.startsWith(`${base}/profile`),
    },
  ];

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  const closeDrawer = () => setSidebarOpen(false);

  const sidebarHeader = (
    <div className="px-4 py-6">
      <h2 className="font-kanit text-xl font-bold text-white">
        Thai EduData
      </h2>
      <p className="font-sarabun text-body-sm text-white/60">{t("portal")}</p>
      <div className="mt-2 flex items-center gap-1">
        <button
          type="button"
          onClick={() => switchLocale("th")}
          className={`rounded-full px-3 py-1 font-sarabun text-caption font-semibold transition-all ${
            locale === "th"
              ? "bg-white text-[#2d8a2c]"
              : "text-white/60 hover:text-white"
          }`}
        >
          TH
        </button>
        <span className="text-white/30">|</span>
        <button
          type="button"
          onClick={() => switchLocale("en")}
          className={`rounded-full px-3 py-1 font-sarabun text-caption font-semibold transition-all ${
            locale === "en"
              ? "bg-white text-[#2d8a2c]"
              : "text-white/60 hover:text-white"
          }`}
        >
          EN
        </button>
      </div>
      <Link
        href={`${base}/datasets/create`}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-white/20 py-2.5 font-sarabun text-label font-medium text-white shadow-sm transition-all hover:bg-white/30 active:scale-[0.98]"
      >
        <PlusIcon />
        {t("publishDataset")}
      </Link>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={toggleSidebar}
        className="fixed bottom-6 left-4 z-40 flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-lg lg:hidden"
        style={{ background: "linear-gradient(135deg, #2d8a2c, #42bd41)" }}
        aria-label={t("menu")}
      >
        <MenuIcon />
      </button>

      <aside
        className="sticky top-0 hidden h-screen w-[240px] shrink-0 flex-col rounded-r-[24px] lg:flex"
        style={{
          background: "linear-gradient(180deg, #2d8a2c 0%, #42bd41 100%)",
          boxShadow: "0 0 12px rgba(45,138,44,0.3)",
        }}
      >
        {sidebarHeader}
        <SidebarNav items={items} pathname={pathname} />
        <SidebarFooter />
      </aside>

      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="presentation">
          <button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeDrawer}
            aria-label={t("closeMenu")}
          />
          <aside className="absolute left-0 top-0 flex h-full w-[280px] flex-col rounded-r-[24px] shadow-2xl" style={{ background: "linear-gradient(180deg, #2d8a2c 0%, #42bd41 100%)" }}>
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
              <span className="font-kanit text-label font-semibold text-white">
                {t("menu")}
              </span>
              <button
                type="button"
                onClick={closeDrawer}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-white/70 hover:bg-white/[0.10] hover:text-white"
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
