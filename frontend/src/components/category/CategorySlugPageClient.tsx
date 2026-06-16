"use client";

import { notFound } from "next/navigation";
import { useMemo } from "react";
import CategoryPageContent from "@/components/category/CategoryPageContent";
import { useCategories } from "@/hooks/useCategories";
import { useCategoryDatasets } from "@/hooks/useCategoryDatasets";
import {
  applyDatasetCountsToTree,
  buildPublicCategoryTree,
  findPublicCategoryPageBySlug,
  getCategoryFilterIds,
  getSubtreeLeafFilterIds,
} from "@/utils/publicCategoryApi";
import { collectLeafNodes } from "@/utils/categoryTreeUtils";

type CategorySlugPageClientProps = {
  slug: string;
};

export default function CategorySlugPageClient({
  slug,
}: CategorySlugPageClientProps) {
  const { data: categories = [], isLoading, isError } = useCategories();

  const tree = useMemo(
    () => buildPublicCategoryTree(categories),
    [categories]
  );

  const pageData = useMemo(
    () => findPublicCategoryPageBySlug(slug, tree),
    [slug, tree]
  );

  const datasetQueryIds = useMemo(() => {
    if (!pageData) {
      return [];
    }
    if (pageData.isLeaf) {
      return getCategoryFilterIds(pageData);
    }
    return getSubtreeLeafFilterIds(pageData.node);
  }, [pageData]);

  const { data: datasets = [], isLoading: datasetsLoading } =
    useCategoryDatasets(datasetQueryIds, categories);

  const pageDataWithCounts = useMemo(() => {
    if (!pageData) {
      return null;
    }
    const treeWithCounts = applyDatasetCountsToTree(tree, datasets);
    return findPublicCategoryPageBySlug(slug, treeWithCounts);
  }, [pageData, tree, datasets, slug]);

  const needsDatasetLoad = pageData?.isLeaf ?? false;
  const allLeafIds = useMemo(
    () => collectLeafNodes(tree).map((node) => node.id),
    [tree]
  );
  const waitingForCounts =
    !pageData?.isLeaf && pageData != null && allLeafIds.length > 0;

  if (isLoading || (needsDatasetLoad && datasetsLoading) || (waitingForCounts && datasetsLoading)) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center font-sarabun text-body-md text-text-muted">
        Loading...
      </div>
    );
  }

  if (isError || !pageDataWithCounts) {
    notFound();
  }

  return (
    <CategoryPageContent
      pageData={pageDataWithCounts}
      datasets={pageDataWithCounts.isLeaf ? datasets : []}
    />
  );
}
