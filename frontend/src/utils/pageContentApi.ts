import type {
  AdminPageEditorContent,
  AdminStaticPageMeta,
  StaticPageIcon,
  StaticPageStatus,
} from "@/data/mockData";

export type ApiPageContent = {
  slug: string;
  title_th: string;
  title_en: string;
  content_th: string;
  content_en: string;
  updated_at: string;
};

const PAGE_UI_META: Record<
  string,
  { route: string; icon: StaticPageIcon; status: StaticPageStatus }
> = {
  "privacy-policy": {
    route: "/privacy-policy",
    icon: "policy",
    status: "published",
  },
  terms: { route: "/terms", icon: "gavel", status: "published" },
  "api-docs": { route: "/api-docs", icon: "api", status: "published" },
  "help-center": { route: "/help-center", icon: "help", status: "draft" },
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

export function mapPageListItem(item: ApiPageContent): AdminStaticPageMeta {
  const ui = PAGE_UI_META[item.slug] ?? {
    route: `/${item.slug}`,
    icon: "policy" as StaticPageIcon,
    status: "published" as StaticPageStatus,
  };
  return {
    slug: item.slug,
    titleTh: item.title_th,
    titleEn: item.title_en,
    route: ui.route,
    icon: ui.icon,
    status: ui.status,
    updatedAt: formatUpdatedAt(item.updated_at),
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
