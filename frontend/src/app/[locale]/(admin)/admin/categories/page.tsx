"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import CategoryForm from "@/components/admin/CategoryForm";
import CategoryTree from "@/components/admin/CategoryTree";
import DeleteCategoryModal from "@/components/admin/DeleteCategoryModal";
import DatasetTagsOverview from "@/components/admin/DatasetTagsOverview";
import TagForm from "@/components/admin/TagForm";
import {
  ADMIN_AGENCY_PAGE_SIZE,
  useAdminCategories,
  type AdminCategoryTreeNode,
} from "@/hooks/useAdminCategories";
import { useAdminTags } from "@/hooks/useAdminTags";
import { MAX_CATEGORY_DEPTH } from "@/utils/categoryTreeUtils";
import { toast } from "@/stores/toastStore";

export default function AdminCategoriesPage() {
  const t = useTranslations("admin.categories");
  const locale = useLocale();

  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [page, setPage] = useState(1);

  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [categoryFormMode, setCategoryFormMode] = useState<"create" | "edit">(
    "create"
  );
  const [editingCategory, setEditingCategory] =
    useState<AdminCategoryTreeNode | null>(null);
  const [parentForCreate, setParentForCreate] =
    useState<AdminCategoryTreeNode | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<AdminCategoryTreeNode | null>(
    null
  );
  const [deleteDisplayName, setDeleteDisplayName] = useState("");

  const [tagFormOpen, setTagFormOpen] = useState(false);

  const categoryFilters = useMemo(
    () => ({
      search: appliedSearch || undefined,
      page,
      adminOwnerLabel: t("adminOwner"),
    }),
    [appliedSearch, page, t]
  );

  const { data: categoriesData, isLoading: categoriesLoading } =
    useAdminCategories(categoryFilters);
  const { data: tags = [], isLoading: tagsLoading } = useAdminTags(
    appliedSearch || undefined
  );

  const showToast = (message: string) => {
    toast.success(message);
  };

  const showError = (message: string) => {
    toast.error(message);
  };

  const applySearch = () => {
    setAppliedSearch(searchInput.trim());
    setPage(1);
  };

  const openCreateRoot = () => {
    setCategoryFormMode("create");
    setEditingCategory(null);
    setParentForCreate(null);
    setCategoryFormOpen(true);
  };

  const openCreateChild = (parent: AdminCategoryTreeNode) => {
    setCategoryFormMode("create");
    setEditingCategory(null);
    setParentForCreate(parent);
    setCategoryFormOpen(true);
  };

  const openEditCategory = (category: AdminCategoryTreeNode) => {
    setCategoryFormMode("edit");
    setEditingCategory(category);
    setParentForCreate(null);
    setCategoryFormOpen(true);
  };

  const totalCategories = categoriesData?.totalCategories ?? 0;
  const totalAgencyGroups = categoriesData?.totalAgencyGroups ?? 0;
  const totalPages = categoriesData?.totalPages ?? 1;
  const currentPage = categoriesData?.page ?? 1;
  const agencyFrom =
    totalAgencyGroups === 0
      ? 0
      : (currentPage - 1) * ADMIN_AGENCY_PAGE_SIZE + 1;
  const agencyTo = Math.min(currentPage * ADMIN_AGENCY_PAGE_SIZE, totalAgencyGroups);

  const levelSummary = useMemo(() => {
    const counts = categoriesData?.countsByLevel ?? {};
    return Array.from({ length: MAX_CATEGORY_DEPTH }, (_, index) => {
      const level = index + 1;
      return { level, count: counts[level] ?? 0 };
    }).filter((item) => item.count > 0);
  }, [categoriesData?.countsByLevel]);

  return (
    <div className="mx-auto max-w-[1200px] space-y-0 pb-24">
      <header className="flex flex-col justify-between gap-4 border-b border-border-default/20 bg-surface-card px-6 py-8 md:flex-row md:items-center lg:px-8">
        <div>
          <h1 className="font-kanit text-[28px] font-bold leading-tight text-text-primary">
            {t("title")}
          </h1>
          <p className="mt-1 font-sarabun text-body-md text-text-muted">
            {t("subtitle")}
          </p>
          {levelSummary.length > 0 && (
            <p className="mt-2 font-sarabun text-caption text-text-muted">
              {t("levelSummary", {
                total: categoriesData?.totalCategories ?? 0,
                levels: levelSummary
                  .map((item) =>
                    t("levelCount", { level: item.level, count: item.count })
                  )
                  .join(locale === "th" ? " · " : " · "),
              })}
            </p>
          )}
        </div>
        <div className="flex w-full gap-3 md:w-auto">
          <button
            type="button"
            onClick={openCreateRoot}
            className="flex flex-1 items-center justify-center gap-2 rounded-radius-lg bg-primary px-5 py-2.5 font-kanit text-label font-semibold text-surface-card shadow-level-1 transition-all hover:bg-primary-hover active:scale-95 md:flex-none"
          >
            <PlusIcon />
            {t("addRoot")}
          </button>
          <button
            type="button"
            onClick={() => showToast(t("exportSoon"))}
            className="hidden items-center gap-2 rounded-radius-lg border border-border-default px-4 py-2.5 font-kanit text-label font-medium text-text-secondary transition-colors hover:bg-surface-container-low lg:flex"
          >
            <DownloadIcon />
            {t("exportData")}
          </button>
        </div>
      </header>

      <div className="border-b border-border-default/50 bg-surface-card px-6 lg:px-8">
        <div className="py-4">
          <div className="relative max-w-xl">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              <SearchIcon />
            </span>
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  applySearch();
                }
              }}
              placeholder={t("searchPlaceholder")}
              className="h-10 w-full rounded-radius-sm border border-border-input bg-surface-card pl-10 pr-24 font-sarabun text-body-md focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-primary-dark/20"
            />
            <button
              type="button"
              onClick={applySearch}
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded-radius-sm bg-primary px-3 py-1.5 font-kanit text-caption font-semibold text-surface-card"
            >
              {t("searchAction")}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-8 p-4 lg:p-8">
        <CategoryTree
          groups={categoriesData?.groupedByAgency ?? []}
          isLoading={categoriesLoading}
          onAddRoot={openCreateRoot}
          onAddChild={openCreateChild}
          onEdit={openEditCategory}
          onDelete={(category, displayName) => {
            setDeleteTarget(category);
            setDeleteDisplayName(displayName);
          }}
        />

        {totalAgencyGroups > 0 && (
          <div className="flex flex-col items-center justify-between gap-4 font-sarabun text-body-sm text-text-muted sm:flex-row">
            <p>
              {t("agencyPaginationSummary", {
                from: agencyFrom,
                to: agencyTo,
                total: totalAgencyGroups,
              })}
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={currentPage <= 1}
                  className="rounded-radius-lg p-1.5 text-text-muted transition-colors hover:bg-surface-container-low disabled:opacity-40"
                  aria-label={t("prevPage")}
                >
                  <ChevronLeftIcon />
                </button>
                {Array.from({ length: totalPages }).map((_, index) => {
                  const pageNumber = index + 1;
                  return (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => setPage(pageNumber)}
                      className={`flex h-9 w-9 items-center justify-center rounded-radius-lg font-sarabun text-label font-bold transition-colors ${
                        currentPage === pageNumber
                          ? "bg-primary text-surface-card shadow-level-1"
                          : "hover:bg-surface-container-low"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() =>
                    setPage((current) => Math.min(totalPages, current + 1))
                  }
                  disabled={currentPage >= totalPages}
                  className="rounded-radius-lg p-1.5 text-text-muted transition-colors hover:bg-surface-container-low disabled:opacity-40"
                  aria-label={t("nextPage")}
                >
                  <ChevronRightIcon />
                </button>
              </div>
            )}
          </div>
        )}

        <p className="font-sarabun text-body-sm text-text-muted">
          {t("listSummary", { total: totalCategories })}
        </p>

        <section className="space-y-4 border-t border-border-default/50 pt-8">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-kanit text-heading-2 text-text-primary">
                {t("tagsSectionTitle")}
              </h2>
              <p className="mt-1 font-sarabun text-body-sm text-text-muted">
                {t("tagsSectionSubtitle")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setTagFormOpen(true)}
              className="flex items-center justify-center gap-2 rounded-radius-lg bg-primary px-5 py-2 font-kanit text-label font-semibold text-surface-card shadow-level-1 transition-all hover:bg-primary-hover"
            >
              <PlusIcon />
              {t("addTag")}
            </button>
          </div>
          <DatasetTagsOverview tags={tags} isLoading={tagsLoading} />
        </section>
      </div>

      <CategoryForm
        open={categoryFormOpen}
        mode={categoryFormMode}
        category={editingCategory}
        parent={parentForCreate}
        onClose={() => setCategoryFormOpen(false)}
        onError={showError}
      />

      <DeleteCategoryModal
        open={Boolean(deleteTarget)}
        target={deleteTarget}
        displayName={deleteDisplayName}
        onClose={() => setDeleteTarget(null)}
        onSuccess={() => showToast(t("deleteSuccess"))}
        onError={showError}
      />

      <TagForm
        open={tagFormOpen}
        mode="create"
        onClose={() => setTagFormOpen(false)}
        onSuccess={() => showToast(t("tagCreateSuccess"))}
        onError={showError}
      />
    </div>
  );
}

function SearchIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
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

function DownloadIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12l4.58-4.59z" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z" />
    </svg>
  );
}
