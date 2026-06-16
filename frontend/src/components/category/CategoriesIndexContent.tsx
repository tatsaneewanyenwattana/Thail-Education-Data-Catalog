"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import SubcategoryCard from "@/components/dataset/SubcategoryCard";
import { useCategories } from "@/hooks/useCategories";
import { useCategoryDatasets } from "@/hooks/useCategoryDatasets";
import {
  applyDatasetCountsToTree,
  buildPublicCategoryTree,
} from "@/utils/publicCategoryApi";
import { collectLeafNodes } from "@/utils/categoryTreeUtils";

export default function CategoriesIndexContent() {
  const t = useTranslations("category");
  const locale = useLocale();
  const isTh = locale === "th";
  const base = `/${locale}`;

  const { data: categories = [], isLoading, isError } = useCategories();
  const tree = useMemo(
    () => buildPublicCategoryTree(categories),
    [categories]
  );
  const leafIds = useMemo(
    () => collectLeafNodes(tree).map((node) => node.id),
    [tree]
  );
  const { data: datasets = [] } = useCategoryDatasets(leafIds, categories);
  const treeWithCounts = applyDatasetCountsToTree(tree, datasets);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center font-sarabun text-body-md text-text-muted">
        Loading...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-container-max px-4 py-12 text-center font-sarabun text-body-md text-error">
        {t("loadError")}
      </div>
    );
  }

  return (
    <>
      <section className="border-b border-border-default/60 bg-surface-card px-4 py-spacing-6 md:px-spacing-10">
        <div className="mx-auto max-w-container-max">
          <nav
            className="mb-4 flex flex-wrap items-center gap-2 font-sarabun text-caption text-text-muted"
            aria-label="Breadcrumb"
          >
            <Link href={base} className="hover:text-primary-dark">
              {t("breadcrumbHome")}
            </Link>
            <span aria-hidden>/</span>
            <span className="text-text-secondary">{t("breadcrumbCategories")}</span>
          </nav>
          <h1 className="font-kanit text-heading-2 text-text-primary md:text-heading-1">
            {t("indexTitle")}
          </h1>
          <p className="mt-2 font-sarabun text-body-md text-text-muted">
            {t("indexSubtitle")}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-container-max px-4 py-spacing-8 md:px-spacing-10">
        {treeWithCounts.length === 0 ? (
          <p className="text-center font-sarabun text-body-md text-text-muted">
            {t("indexEmpty")}
          </p>
        ) : (
          <div className="flex flex-col gap-spacing-8">
            {treeWithCounts.map((category) => (
              <section key={category.slug}>
                <Link
                  href={`${base}/categories/${category.slug}`}
                  className="group inline-flex flex-col"
                >
                  <h2 className="font-kanit text-heading-3 text-text-primary transition-colors group-hover:text-primary-dark">
                    {isTh ? category.nameTh : category.nameEn}
                  </h2>
                  <p className="mt-1 font-sarabun text-caption text-text-muted">
                    {t("datasetCount", { count: category.datasetCount })}
                  </p>
                </Link>
                {category.children.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                    {category.children.map((child) => (
                      <SubcategoryCard
                        key={child.slug}
                        slug={child.slug}
                        name={isTh ? child.nameTh : child.nameEn}
                        datasetCount={child.datasetCount}
                      />
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
