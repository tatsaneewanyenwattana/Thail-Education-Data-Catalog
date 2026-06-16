"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import { useCategories } from "@/hooks/useCategories";
import apiClient from "@/services/api";
import Pagination from "./Pagination";
import SortDropdown, { type SortOption } from "./SortDropdown";
import { parseListParam } from "./useSearchParamsUpdate";

const PAGE_SIZE = 10;

type SearchResultProps = {
  keyword: string;
  filterQuery: string;
  selectedCategory: string | null;
  selectedAgencies: string[];
  selectedYears: string[];
  selectedFormats: string[];
  selectedTags: string[];
  selectedProvince: string;
  sort: SortOption;
  page: number;
};

type ApiSearchItem = {
  id: string;
  title: string;
  description: string | null;
  license: "open" | "conditional" | "cc";
  category_id: string | null;
  download_count: number;
  published_at: string | null;
  agency_name: string | null;
};

function formatDownloadCount(count: number, locale: string): string {
  if (count >= 1000) {
    const k = count / 1000;
    const formatted =
      k >= 10 ? Math.round(k).toString() : k.toFixed(1).replace(/\.0$/, "");
    return `${formatted}k`;
  }
  return count.toLocaleString(locale);
}

function formatDate(iso: string, locale: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 7) {
    const rtf = new Intl.RelativeTimeFormat(locale === "th" ? "th-TH" : "en-US", {
      numeric: "auto",
    });
    if (diffDays < 1) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      return diffHours < 1 ? rtf.format(0, "hour") : rtf.format(-diffHours, "hour");
    }
    return rtf.format(-diffDays, "day");
  }

  return date.toLocaleDateString(locale === "th" ? "th-TH" : "en-US", {
    year: "numeric",
    month: "short",
  });
}

function licenseBadge(license: ApiSearchItem["license"], locale: string): string {
  if (license === "open") return locale === "th" ? "เปิดข้อมูล" : "Open Data";
  if (license === "cc") return "CC-BY-4.0";
  return locale === "th" ? "มีเงื่อนไข" : "Restricted";
}

function mapSortToApi(sort: SortOption): string {
  if (sort === "popular") {
    return "download_count";
  }
  return "published_at";
}

function SearchResultCard({
  item,
  categoryName,
}: {
  item: ApiSearchItem;
  categoryName: string;
}) {
  const t = useTranslations("search");
  const locale = useLocale();
  const title = item.title;
  const description = item.description ?? "";
  const agency = item.agency_name ?? "-";

  return (
    <article className="group flex flex-col justify-between gap-4 rounded-radius-lg border border-border-default/80 bg-surface-card p-5 shadow-level-1 transition-all hover:border-primary/50 hover:shadow-level-2 sm:flex-row sm:items-start">
      <div className="flex max-w-full flex-col gap-3 sm:max-w-[70%]">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-radius-sm bg-primary-light px-2 py-0.5 font-sarabun text-caption font-bold uppercase tracking-wider text-primary-dark">
            {categoryName}
          </span>
          <span className="rounded-radius-sm bg-surface-container px-2 py-0.5 font-sarabun text-caption font-bold uppercase tracking-wider text-text-secondary">
            {licenseBadge(item.license, locale)}
          </span>
        </div>
        <Link
          href={`/${locale}/datasets/${item.id}`}
          className="font-kanit text-heading-3-mobile leading-snug text-primary-dark transition-colors hover:text-primary"
        >
          {title}
        </Link>
        <p className="line-clamp-2 font-sarabun text-label text-text-muted">
          {description}
        </p>
        <div className="flex flex-wrap items-center gap-4 font-sarabun text-caption text-text-muted">
          <span className="flex items-center gap-1">
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            {agency}
          </span>
          <span className="flex items-center gap-1">
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {formatDate(item.published_at ?? new Date().toISOString(), locale)}
          </span>
        </div>
      </div>

      <div className="flex min-w-[140px] flex-col items-stretch gap-4 sm:items-end">
        <span className="self-start rounded-radius-full bg-status-published-bg px-3 py-1 font-sarabun text-caption font-bold text-status-published sm:self-auto">
          {t("published")}
        </span>
        <div className="text-left sm:text-right">
          <p className="font-sarabun text-caption text-text-muted">{t("downloads")}</p>
          <p className="font-sarabun text-label font-bold text-text-primary">
            {formatDownloadCount(item.download_count, locale)}
          </p>
        </div>
        <Link
          href={`/${locale}/datasets/${item.id}`}
          className="w-full rounded-radius-md border border-primary-dark px-4 py-2 text-center font-sarabun text-label font-medium text-primary-dark transition-colors hover:bg-primary-light sm:w-full"
        >
          {t("viewDetail")}
        </Link>
      </div>
    </article>
  );
}

export default function SearchResult(props: SearchResultProps) {
  const t = useTranslations("search");
  const locale = useLocale();
  const { data: categories = [] } = useCategories();

  const categoryNameMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((cat) => {
      map.set(
        String(cat.id),
        locale === "th" ? cat.name_th : cat.name_en
      );
    });
    return map;
  }, [categories, locale]);

  const { data, isLoading } = useQuery({
    queryKey: [
      "search",
      props.keyword,
      props.filterQuery,
      props.selectedCategory,
      props.selectedTags,
      props.selectedProvince,
      props.page,
      props.sort,
      props.selectedAgencies,
      props.selectedYears,
      props.selectedFormats,
    ],
    queryFn: async () => {
      const keyword = (props.keyword || props.filterQuery || "").trim();
      const filters: Record<string, unknown> = {};
      if (props.selectedCategory) {
        filters.category_id = props.selectedCategory;
      }
      if (props.selectedTags.length > 0) {
        filters.tags = props.selectedTags;
      }
      if (props.selectedProvince) {
        filters.province = props.selectedProvince;
      }
      if (props.selectedAgencies.length > 0) {
        filters.agency_user_id = props.selectedAgencies[0];
      }
      if (props.selectedYears.length > 0) {
        filters.years = props.selectedYears.map((year) => Number.parseInt(year, 10));
      }
      if (props.selectedFormats.length > 0) {
        filters.formats = props.selectedFormats;
      }

      const hasKeyword = keyword.length >= 2;
      const hasFilters = Object.keys(filters).length > 0;

      // ไม่มี keyword และไม่มี filter → แสดง Dataset ทั้งหมดจาก /datasets ตาม #31
      if (!hasKeyword && !hasFilters) {
        const response = await apiClient.get<{
          data: ApiSearchItem[];
          pagination: { total_items: number; total_pages: number };
        }>("/datasets", {
          params: {
            page: props.page,
            page_size: PAGE_SIZE,
            sort: mapSortToApi(props.sort),
            order: "desc",
          },
        });
        return response.data;
      }

      const response = await apiClient.get<{
        data: ApiSearchItem[];
        pagination: { total_items: number; total_pages: number };
      }>("/search", {
        params: {
          keyword,
          filters: JSON.stringify(filters),
          page: props.page,
          page_size: PAGE_SIZE,
          sort: mapSortToApi(props.sort),
          order: "desc",
        },
      });
      return response.data;
    },
    retry: 1,
  });

  const totalCount = data?.pagination?.total_items ?? 0;
  const totalPages = Math.max(1, data?.pagination?.total_pages ?? 1);
  const pageItems = data?.data ?? [];

  const displayKeyword = props.keyword || (locale === "th" ? "ทั้งหมด" : "all");

  return (
    <section className="flex-1 py-spacing-2">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-sarabun text-body-md text-text-muted">
          {t("foundCount", { count: totalCount.toLocaleString(locale) })}{" "}
          <strong className="text-text-primary">&quot;{displayKeyword}&quot;</strong>
        </p>
        <SortDropdown value={props.sort} />
      </div>

      {isLoading ? (
        <div className="rounded-radius-lg border border-border-default bg-surface-card p-12 text-center">
          <p className="font-sarabun text-body-md text-text-secondary">{t("loading")}</p>
        </div>
      ) : pageItems.length === 0 ? (
        <div className="rounded-radius-lg border border-border-default bg-surface-card p-12 text-center">
          <p className="font-sarabun text-body-md text-text-secondary">{t("noResults")}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {pageItems.map((item) => (
            <SearchResultCard
              key={item.id}
              item={item}
              categoryName={categoryNameMap.get(String(item.category_id)) ?? "-"}
            />
          ))}
        </div>
      )}

      <Pagination currentPage={Math.min(props.page, totalPages)} totalPages={totalPages} />
    </section>
  );
}

export function parseSearchPageParams(searchParams: URLSearchParams) {
  const sortParam = searchParams.get("sort");
  const sort: SortOption =
    sortParam === "popular" || sortParam === "name" ? sortParam : "newest";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);

  return {
    keyword: searchParams.get("q") ?? "",
    filterQuery: searchParams.get("fq") ?? "",
    selectedCategory: searchParams.get("category"),
    selectedAgencies: parseListParam(searchParams.get("agency")),
    selectedYears: parseListParam(searchParams.get("year")),
    selectedFormats: parseListParam(searchParams.get("format")),
    selectedTags: parseListParam(searchParams.get("tag")),
    selectedProvince: searchParams.get("province") ?? "",
    sort,
    page,
  };
}
