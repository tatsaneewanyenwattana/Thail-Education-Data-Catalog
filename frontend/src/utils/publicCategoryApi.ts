import type {
  CategoryMock,
  CategoryPageData,
  CategorySubcategoryMock,
  SearchResultMock,
} from "@/data/mockData";
import type { ApiCategory } from "@/utils/categoryApi";

type ApiPublishedDataset = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  license: string;
  category_id: string | null;
  download_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  metadata?: { year?: number; agency?: string } | null;
  agency_name?: string | null;
};

export function buildCategoryTreeFromApi(
  categories: ApiCategory[]
): CategoryMock[] {
  const l1Raw = categories.filter((c) => c.level === 1);
  const l2Raw = categories.filter((c) => c.level === 2);
  const l2ByParent = new Map<string, CategorySubcategoryMock[]>();

  for (const c of l2Raw) {
    const parentId = c.parent_id ? String(c.parent_id) : "";
    const sub: CategorySubcategoryMock = {
      id: String(c.id),
      slug: c.slug,
      nameTh: c.name_th,
      nameEn: c.name_en,
      level: 2,
      datasetCount: 0,
    };
    const list = l2ByParent.get(parentId) ?? [];
    list.push(sub);
    l2ByParent.set(parentId, list);
  }

  return l1Raw.map((c) => ({
    id: String(c.id),
    slug: c.slug,
    nameTh: c.name_th,
    nameEn: c.name_en,
    level: 1 as const,
    datasetCount: 0,
    searchCategoryId: String(c.id),
    subcategories: l2ByParent.get(String(c.id)) ?? [],
  }));
}

export function findCategoryPageBySlug(
  slug: string,
  tree: CategoryMock[]
): CategoryPageData | null {
  for (const category of tree) {
    if (category.slug === slug) {
      return { level: 1, category, subcategory: null };
    }
    const subcategory = category.subcategories.find((s) => s.slug === slug);
    if (subcategory) {
      return { level: 2, category, subcategory };
    }
  }
  return null;
}

/** UUID ของหมวดที่ใช้กรอง Dataset (L1 รวม L2 ใต้ตัว) */
export function getCategoryFilterIds(
  pageData: CategoryPageData,
  allCategories: ApiCategory[]
): string[] {
  const { category, subcategory, level } = pageData;

  if (level === 2 && subcategory) {
    return [subcategory.id ?? subcategory.slug];
  }

  const rootId = category.id ?? category.searchCategoryId;
  const childIds = allCategories
    .filter((c) => c.level === 2 && String(c.parent_id) === rootId)
    .map((c) => String(c.id));

  return [rootId, ...childIds];
}

export function mapApiDatasetToSearchResult(
  item: ApiPublishedDataset,
  categoryById: Map<string, ApiCategory>
): SearchResultMock {
  const cat = item.category_id
    ? categoryById.get(String(item.category_id))
    : undefined;
  const parent =
    cat?.level === 2 && cat.parent_id
      ? categoryById.get(String(cat.parent_id))
      : cat?.level === 1
        ? cat
        : undefined;

  const title = item.title;
  const year =
    typeof item.metadata?.year === "number" ? item.metadata.year : 0;
  const agencyName =
    typeof item.agency_name === "string" && item.agency_name.trim()
      ? item.agency_name.trim()
      : typeof item.metadata?.agency === "string" && item.metadata.agency.trim()
        ? item.metadata.agency.trim()
        : "ไม่ระบุหน่วยงาน";

  return {
    id: String(item.id),
    titleTh: title,
    titleEn: title,
    descriptionTh: item.description ?? "",
    descriptionEn: item.description ?? "",
    categoryTh: parent?.name_th ?? cat?.name_th ?? "—",
    categoryEn: parent?.name_en ?? cat?.name_en ?? "—",
    categoryId: parent ? String(parent.id) : cat ? String(cat.id) : "",
    subcategorySlug: cat?.level === 2 ? cat.slug : undefined,
    agencyTh: agencyName,
    agencyEn: agencyName,
    agencyId: "",
    status: item.status === "published" ? "published" : "published",
    downloadCount: item.download_count ?? 0,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    publishedAt: item.published_at ?? item.created_at,
    license: (item.license as SearchResultMock["license"]) ?? "open",
    fileFormats: [],
    year,
  };
}

export function applyDatasetCounts(
  tree: CategoryMock[],
  datasets: SearchResultMock[]
): CategoryMock[] {
  return tree.map((category) => ({
    ...category,
    datasetCount: datasets.filter((d) => d.categoryId === category.id).length,
    subcategories: category.subcategories.map((sub) => ({
      ...sub,
      datasetCount: datasets.filter((d) => d.subcategorySlug === sub.slug)
        .length,
    })),
  }));
}

export type { ApiPublishedDataset };
