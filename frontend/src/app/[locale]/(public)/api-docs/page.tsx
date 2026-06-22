"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import ApiSidebar, {
  ApiMobileNav,
  type ApiDocNavItem,
  useActiveSection,
} from "@/components/common/ApiSidebar";
import EndpointCard from "@/components/common/EndpointCard";
import QuickStart from "@/components/common/QuickStart";
import {
  API_ENDPOINT_GROUPS,
  QUICK_START_STEPS,
  getLocalizedText,
} from "@/data/apiDocsContent";
import { useApiDocs } from "@/hooks/useApiDocs";

function ApiDocsSkeleton() {
  return (
    <div className="mx-auto flex max-w-container-max gap-spacing-6 px-4 py-spacing-8 md:px-spacing-10">
      <div className="hidden w-72 shrink-0 md:block">
        <div className="h-80 animate-pulse rounded-radius-xl bg-surface-container" />
      </div>
      <div className="flex-1 space-y-spacing-6">
        <div className="h-9 w-72 animate-pulse rounded-radius-sm bg-surface-container" />
        <div className="h-24 max-w-3xl animate-pulse rounded-radius-md bg-surface-container" />
        <div className="h-72 animate-pulse rounded-radius-xl bg-surface-container" />
        <div className="h-48 animate-pulse rounded-radius-xl bg-surface-container" />
      </div>
    </div>
  );
}

export default function ApiDocsPage() {
  const t = useTranslations("apiDocs");
  const locale = useLocale();
  const { data, isLoading, isError, isFetching } = useApiDocs();

  const navItems = useMemo<ApiDocNavItem[]>(
    () => [
      {
        id: "quick-start",
        title: {
          th: t("quickStartTitle"),
          en: t("quickStartTitle"),
        },
        description: {
          th: t("quickStartNavDescription"),
          en: t("quickStartNavDescription"),
        },
      },
      ...API_ENDPOINT_GROUPS.map((group) => ({
        id: group.id,
        title: group.title,
        description: group.description,
      })),
    ],
    [t]
  );

  const sectionIds = useMemo(() => navItems.map((item) => item.id), [navItems]);
  const { activeId, scrollTo } = useActiveSection(sectionIds);

  if (isLoading && !data) {
    return <ApiDocsSkeleton />;
  }

  const docs = data;
  const pageTitle =
    locale === "th"
      ? "Thai EduData Insight API Documentation"
      : "Thai EduData Insight API Documentation";
  const pageDescription = docs
    ? locale === "th"
      ? docs.descriptionTh
      : docs.descriptionEn
    : t("portalDescription");
  const version = docs?.version ?? "v1";

  return (
    <>
      <div className="bg-surface-card px-4 pb-6 pt-4 md:px-spacing-10">
        <div className="mx-auto max-w-container-max">
          <nav className="mb-4 flex items-center gap-1.5 font-sarabun text-caption text-text-muted">
            <Link href={`/${locale}`} className="transition-colors" style={{ color: "#00695c" }}>
              {t("breadcrumbHome")}
            </Link>
            <span>{">"}</span>
            <span style={{ color: "#00695c" }}>
              {t("breadcrumbCurrent")}
            </span>
          </nav>

          <div className="overflow-hidden rounded-2xl p-8 md:p-10" style={{ backgroundColor: "#004d40" }}>
            <div className="relative">
              <p className="mb-3 inline-flex rounded-full px-4 py-1 font-sarabun text-caption font-semibold uppercase tracking-[0.18em]" style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "#a5d6a7" }}>
                {t("portalEyebrow")}
              </p>
              <h1 className="mb-3 font-kanit text-[2rem] font-bold text-white md:text-[2.5rem]">
                {pageTitle}
              </h1>
              <p className="max-w-3xl font-sarabun text-body-lg leading-relaxed text-white/85">
                {pageDescription}
              </p>
              <div className="pointer-events-none absolute -right-4 -top-4 hidden opacity-20 md:block">
                <svg width="120" height="120" viewBox="0 0 24 24" fill="white" aria-hidden>
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-4 rounded-2xl border border-border-default/60 bg-white px-6 py-4 shadow-level-1">
            <p className="font-sarabun text-label font-bold uppercase tracking-wider text-text-muted">
              {t("baseUrl")}
            </p>
            <code className="flex-1 break-all rounded-xl bg-gray-50 px-4 py-2.5 font-mono text-body-md" style={{ color: "#1a3a2a" }}>
              {docs?.baseUrl ?? "http://127.0.0.1:8000/api/v1"}
            </code>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 font-sarabun text-caption font-semibold" style={{ color: "#00695c" }}>
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: "#00c853" }} />
                Server Status: Online
              </span>
              <span className="rounded-full border px-3 py-1 font-mono text-caption font-semibold" style={{ borderColor: "#00897b", color: "#00695c" }}>
                {version} stable
              </span>
            </div>
          </div>

          {isError && (
            <p className="mt-4 rounded-2xl border border-status-warning bg-status-warning-bg px-4 py-3 font-sarabun text-body-md text-status-warning">
              {t("fallback")}
            </p>
          )}
          {isFetching && !isLoading && (
            <p className="mt-4 font-sarabun text-caption text-text-muted">
              {t("loading")}
            </p>
          )}
        </div>
      </div>

      <div className="mx-auto flex max-w-[1400px] gap-8 px-4 md:px-spacing-10">
        <ApiSidebar
          items={navItems}
          locale={locale}
          version={version}
          activeId={activeId}
          onNavigate={scrollTo}
          title={t("sidebarTitle")}
        />

        <main className="min-w-0 flex-1 py-8">
          <div className="space-y-10">
            <QuickStart
              steps={QUICK_START_STEPS}
              locale={locale}
              title={t("quickStartTitle")}
              description={t("quickStartDescription")}
            />

            {API_ENDPOINT_GROUPS.map((group) => (
              <section
                key={group.id}
                id={group.id}
                className="scroll-mt-28 space-y-spacing-6"
              >
                <div className="rounded-2xl border border-border-default/60 bg-white p-6 shadow-level-1 md:p-8">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: "#e8f5e9", color: "#00695c" }}>
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="font-kanit text-[1.5rem] font-bold" style={{ color: "#1a3a2a" }}>
                        {getLocalizedText(group.title, locale)}
                      </h2>
                      <p className="mt-1 max-w-2xl font-sarabun text-body-md text-text-secondary">
                        {getLocalizedText(group.description, locale)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {group.endpoints.map((endpoint) => (
                    <EndpointCard
                      key={endpoint.id}
                      endpoint={endpoint}
                      locale={locale}
                      requestLabel={t("requestExample")}
                      responseLabel={t("response")}
                      expandLabel={t("expandEndpoint")}
                      collapseLabel={t("collapseEndpoint")}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </main>
      </div>

      <ApiMobileNav
        items={navItems}
        locale={locale}
        version={version}
        activeId={activeId}
        onNavigate={scrollTo}
        title={t("sidebarTitle")}
        jumpLabel={t("jumpTo")}
      />
    </>
  );
}
