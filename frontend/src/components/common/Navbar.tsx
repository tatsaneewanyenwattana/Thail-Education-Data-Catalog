"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import NotificationBell from "@/components/common/NotificationBell";
import { useAuthStore } from "@/stores/useAuthStore";

type NavbarProps = {
  variant: "public" | "auth" | "agency" | "admin";
};

function SearchIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z" />
    </svg>
  );
}

export default function Navbar({ variant }: NavbarProps) {
  const t = useTranslations("nav");
  const tAdminNav = useTranslations("admin.nav");
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const locale = pathname.split("/")[1] || "th";
  const base = `/${locale}`;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: base, label: t("home"), match: (p: string) => p === base || p === `${base}/` },
    { href: `${base}/search`, label: t("search"), match: (p: string) => p.startsWith(`${base}/search`) },
    { href: `${base}/stats`, label: t("stats"), match: (p: string) => p.startsWith(`${base}/stats`) },
    { href: `${base}/scholarship`, label: t("scholarship"), match: (p: string) => p.startsWith(`${base}/scholarship`) },
  ];

  const linkClass = (active: boolean) =>
    `flex h-full items-center px-2 font-sarabun text-label transition-colors ${
      active
        ? "border-b-2 border-primary-dark font-medium text-primary-dark"
        : "text-text-secondary hover:text-primary-dark"
    }`;

  if (variant === "auth") {
    return (
      <header
        className="sticky top-0 z-50 flex h-16 items-center border-b border-white/60 px-4 md:px-10"
        style={{
          background: "rgba(255, 255, 255, 0.55)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="mx-auto flex w-full max-w-container-max items-center justify-between">
          <Link
            href={base}
            className="font-kanit text-label font-bold text-primary-dark md:text-body-lg"
          >
            Thai EduData Insight
          </Link>
          <LanguageSwitcher />
        </div>
      </header>
    );
  }

  if (variant === "admin") {
    const displayName = user?.agency_name ?? user?.email ?? "Admin";

    const handleLogout = () => {
      logout();
      router.push(`${base}/login`);
    };

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
            href={base}
            className="shrink-0 font-kanit text-label font-bold text-primary-dark"
          >
            Thai EduData Insight
          </Link>
          <div className="ml-auto flex items-center gap-4">
            <NotificationBell />
            <LanguageSwitcher />
            <div className="flex items-center gap-3 border-l border-border-default pl-4">
              <span className="hidden font-sarabun text-label font-bold text-text-primary sm:inline">
                {displayName}
              </span>
              <span className="rounded-radius-full bg-[#e1f5ee] px-3 py-1 font-sarabun text-caption font-bold text-[#006b5f]">
                Admin
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="min-h-[40px] rounded-radius-sm px-3 font-sarabun text-label font-medium text-text-secondary transition-colors hover:bg-surface-container hover:text-status-error"
              >
                {tAdminNav("logout")}
              </button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  if (variant === "agency") {
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
            href={base}
            className="shrink-0 font-kanit text-label font-bold text-primary-dark"
          >
            Thai EduData Insight
          </Link>
          <div className="ml-auto flex items-center gap-4">
            <NotificationBell />
            <LanguageSwitcher />
            <Link
              href={`${base}/profile`}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-radius-sm px-3 font-sarabun text-label font-medium text-text-secondary transition-colors hover:bg-surface-container hover:text-primary-dark"
              aria-label={t("profile")}
            >
              <UserIcon />
              <span className="hidden sm:inline">{t("profile")}</span>
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b border-white/60 transition-shadow ${
          scrolled ? "shadow-level-2" : ""
        }`}
        style={{
          background: "rgba(255, 255, 255, 0.55)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Tier 1 */}
        <div className="mx-auto flex h-16 max-w-container-max items-center justify-between gap-4 px-4 md:px-10">
          <Link
            href={base}
            className="shrink-0 font-kanit text-label font-bold text-primary-dark md:text-body-lg"
          >
            Thai EduData Insight
          </Link>

          {!pathname.startsWith(`${base}/datasets/`) && !pathname.startsWith(`${base}/search`) && !pathname.startsWith(`${base}/scholarship`) && (
            <div className="relative mx-4 hidden max-w-xl flex-1 md:flex">
              <input
                type="search"
                readOnly
                onFocus={() => {
                  window.location.href = `${base}/search`;
                }}
                placeholder={t("searchPlaceholder")}
                className="h-10 w-full cursor-pointer rounded-radius-sm border border-border-input bg-surface-card px-4 pr-10 font-sarabun text-body-md text-text-primary placeholder:text-text-muted focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-primary-dark/20"
                aria-label={t("search")}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
                <SearchIcon className="h-5 w-5" />
              </span>
            </div>
          )}

          <div className="flex items-center gap-3 md:gap-4">
            <NotificationBell />
            <LanguageSwitcher />
            <Link
              href={`${base}/login`}
              className="hidden min-h-[40px] items-center rounded-radius-sm bg-primary px-6 font-sarabun text-label font-medium text-white transition-colors hover:bg-primary-hover sm:inline-flex"
            >
              {t("login")}
            </Link>
            <button
              type="button"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-radius-sm text-text-secondary md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label={t("menu")}
            >
              <MenuIcon />
            </button>
          </div>
        </div>

        {/* Tier 2 — desktop */}
        <div className="hidden border-t border-border-input/30 md:block">
          <div className="mx-auto flex h-11 max-w-container-max items-center gap-6 px-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={linkClass(link.match(pathname))}
              >
                {link.label}
              </Link>
            ))}

            <Link
              href={`${base}/api-docs`}
              className={linkClass(pathname.startsWith(`${base}/api-docs`))}
            >
              {t("apiDocs")}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[55] md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-surface-navy/40"
            aria-label={t("closeMenu")}
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-xs flex-col bg-surface-card shadow-level-3">
            <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
              <span className="font-kanit text-heading-3-mobile text-primary-dark">
                {t("menu")}
              </span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="min-h-[44px] min-w-[44px] rounded-radius-sm p-2 text-text-muted"
                aria-label={t("closeMenu")}
              >
                <svg
                  className="h-5 w-5"
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
              </button>
            </div>
            <nav className="flex flex-col gap-1 p-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`min-h-[44px] rounded-radius-sm px-3 py-2 font-sarabun text-label ${
                    link.match(pathname)
                      ? "bg-primary-light font-medium text-primary-dark"
                      : "text-text-secondary"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href={`${base}/api-docs`}
                className={`min-h-[44px] rounded-radius-sm px-3 py-2 font-sarabun text-label ${
                  pathname.startsWith(`${base}/api-docs`)
                    ? "bg-primary-light font-medium text-primary-dark"
                    : "text-text-secondary"
                }`}
              >
                {t("apiDocs")}
              </Link>
              <Link
                href={`${base}/login`}
                className="mt-2 inline-flex min-h-[44px] items-center justify-center rounded-radius-sm bg-primary px-4 font-sarabun text-label font-medium text-white"
              >
                {t("login")}
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
