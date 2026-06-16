import type {
  AdminPageEditorContent,
  AdminStaticPageMeta,
  PageContentMock,
  StaticPageIcon,
  StaticPageStatus,
} from "@/data/mockData";

export type ApiPageContent = {
  slug: string;
  title_th: string;
  title_en: string;
  content_th: string;
  content_en: string;
  status: string;
  updated_at: string;
};

const PAGE_UI_META: Record<
  string,
  { route: string; icon: StaticPageIcon; status?: StaticPageStatus }
> = {
  "privacy-policy": {
    route: "/privacy-policy",
    icon: "policy",
  },
  terms: { route: "/terms", icon: "gavel" },
  "api-docs": { route: "/api-docs", icon: "api" },
  "help-center": { route: "/help-center", icon: "help" },
};

function formatUpdatedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso.slice(0, 10);
  }
  return date.toISOString().slice(0, 10);
}

export function mapPageContent(item: ApiPageContent): AdminPageEditorContent {
  return {
    slug: item.slug,
    titleTh: item.title_th,
    titleEn: item.title_en,
    updatedAt: formatUpdatedAt(item.updated_at),
    contentTh: item.content_th ?? "",
    contentEn: item.content_en ?? "",
    sections: [],
  };
}

/** Map public page API → PageContentMock for static pages (no mock fallback) */
export function mapApiPageToPublicContent(item: ApiPageContent): PageContentMock {
  const hasApiBody =
    Boolean(item.content_th?.trim()) || Boolean(item.content_en?.trim());

  if (hasApiBody) {
    return {
      slug: item.slug,
      titleTh: item.title_th,
      titleEn: item.title_en,
      updatedAt: formatUpdatedAt(item.updated_at),
      sections: [
        {
          id: "main-content",
          titleTh: item.title_th,
          titleEn: item.title_en,
          contentTh: item.content_th ?? "",
          contentEn: item.content_en ?? "",
        },
      ],
    };
  }

  return {
    slug: item.slug,
    titleTh: item.title_th,
    titleEn: item.title_en,
    updatedAt: formatUpdatedAt(item.updated_at),
    sections: [],
  };
}

export function mapPageListItem(item: ApiPageContent): AdminStaticPageMeta {
  const ui = PAGE_UI_META[item.slug] ?? {
    route: `/pages/${item.slug}`,
    icon: "policy" as StaticPageIcon,
  };
  const status: StaticPageStatus =
    item.status === "draft" ? "draft" : "published";
  return {
    slug: item.slug,
    titleTh: item.title_th,
    titleEn: item.title_en,
    route: ui.route,
    icon: ui.icon,
    status,
    updatedAt: formatUpdatedAt(item.updated_at),
  };
}

export function toPageCreateBody(input: {
  slug: string;
  titleTh: string;
  titleEn: string;
  status: StaticPageStatus;
}) {
  return {
    slug: input.slug,
    title_th: input.titleTh,
    title_en: input.titleEn,
    status: input.status,
  };
}

export function toPageContentUpdateBody(input: {
  contentTh: string;
  contentEn: string;
}) {
  return {
    content_th: input.contentTh,
    content_en: input.contentEn,
  };
}
