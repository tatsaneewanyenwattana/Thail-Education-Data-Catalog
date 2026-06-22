"use client";

import { useEffect, useState } from "react";
import type { LocalizedText } from "@/data/apiDocsContent";
import { getLocalizedText } from "@/data/apiDocsContent";

export type ApiDocNavItem = {
  id: string;
  title: LocalizedText;
  description?: LocalizedText;
};

type ApiSidebarProps = {
  items: ApiDocNavItem[];
  locale: string;
  version: string;
  activeId: string;
  onNavigate: (id: string) => void;
  title: string;
};

function NavIcon({ id }: { id: string }) {
  const className = "h-5 w-5 shrink-0";

  switch (id) {
    case "quick-start":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    case "authentication":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      );
    case "dataset-management":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
      );
    case "public-api":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      );
    case "search-discovery":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      );
    case "categories-tags":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      );
    case "statistics":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
    case "administration":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    default:
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
          <circle cx="12" cy="12" r="4" />
        </svg>
      );
  }
}

function NavLink({
  item,
  locale,
  isActive,
  isQuickStart,
  onNavigate,
}: {
  item: ApiDocNavItem;
  locale: string;
  isActive: boolean;
  isQuickStart?: boolean;
  onNavigate: (id: string) => void;
}) {
  const title = getLocalizedText(item.title, locale);

  if (isQuickStart) {
    return (
      <a
        href={`#${item.id}`}
        onClick={(e) => {
          e.preventDefault();
          onNavigate(item.id);
        }}
        className="flex items-center gap-3 rounded-xl px-5 py-3.5 font-kanit text-body-md font-bold text-white transition-all hover:opacity-90"
        style={{ backgroundColor: "#004d40" }}
      >
        <NavIcon id={item.id} />
        {title}
      </a>
    );
  }

  return (
    <a
      href={`#${item.id}`}
      onClick={(e) => {
        e.preventDefault();
        onNavigate(item.id);
      }}
      className={`flex items-center gap-3 rounded-xl px-5 py-3.5 font-sarabun text-body-md transition-all ${
        isActive
          ? "font-bold text-white"
          : "text-text-secondary hover:bg-gray-50"
      }`}
      style={isActive ? { backgroundColor: "#00695c" } : undefined}
    >
      <NavIcon id={item.id} />
      {title}
    </a>
  );
}

export default function ApiSidebar({
  items,
  locale,
  version,
  activeId,
  onNavigate,
  title,
}: ApiSidebarProps) {
  return (
    <aside className="hidden w-[340px] shrink-0 md:sticky md:top-20 md:flex md:flex-col" style={{ height: "calc(100vh - 5rem)" }}>
      <div className="overflow-y-auto rounded-2xl border border-border-default/60 bg-white p-5 shadow-level-1">
        <div className="mb-5 px-2">
          <h2 className="font-kanit text-[1.25rem] font-bold" style={{ color: "#1a3a2a" }}>
            {title}
          </h2>
          <p className="font-sarabun text-label text-text-muted">
            {version}-stable
          </p>
        </div>
        <nav className="flex flex-col gap-1.5">
          {items.map((item, i) => (
            <NavLink
              key={item.id}
              item={item}
              locale={locale}
              isActive={activeId === item.id}
              isQuickStart={i === 0}
              onNavigate={onNavigate}
            />
          ))}
        </nav>
      </div>
    </aside>
  );
}

export function ApiMobileNav({
  items,
  locale,
  activeId,
  onNavigate,
  jumpLabel,
}: ApiSidebarProps & { jumpLabel: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const close = () => setOpen(false);
    if (open) {
      document.addEventListener("click", close);
      return () => document.removeEventListener("click", close);
    }
  }, [open]);

  return (
    <div className="fixed bottom-6 right-6 z-50 md:hidden">
      {open && (
        <div
          className="absolute bottom-20 right-0 w-56 overflow-hidden rounded-2xl border border-border-default/60 bg-white py-4 shadow-level-3"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="mb-2 border-b border-border-default/40 px-4 pb-2 font-kanit text-label font-bold" style={{ color: "#1a3a2a" }}>
            {jumpLabel}
          </p>
          {items.map((endpoint) => (
            <a
              key={endpoint.id}
              href={`#${endpoint.id}`}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(endpoint.id);
                setOpen(false);
              }}
              className={`block px-4 py-2 font-sarabun text-body-md transition-colors hover:bg-gray-50 ${
                activeId === endpoint.id
                  ? "font-bold"
                  : "text-text-secondary"
              }`}
              style={activeId === endpoint.id ? { color: "#00695c" } : undefined}
            >
              {getLocalizedText(endpoint.title, locale)}
            </a>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="flex h-14 w-14 items-center justify-center rounded-full text-white shadow-level-2 transition-transform hover:scale-105 active:scale-95"
        style={{ backgroundColor: "#004d40" }}
        aria-label={jumpLabel}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
        </svg>
      </button>
    </div>
  );
}

export function useActiveSection(sectionIds: string[]) {
  const [activeId, setActiveId] = useState(sectionIds[0] ?? "");

  useEffect(() => {
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-120px 0px -60% 0px", threshold: [0, 0.25, 0.5] }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sectionIds]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: "smooth" });
      setActiveId(id);
    }
  };

  return { activeId, scrollTo };
}
