"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import CategoryForm from "@/components/admin/CategoryForm";
import CategoryTree from "@/components/admin/CategoryTree";
import DeleteCategoryModal, {
  type DeleteCategoryTarget,
} from "@/components/admin/DeleteCategoryModal";
import TagForm from "@/components/admin/TagForm";
import TagTable from "@/components/admin/TagTable";
import type { AdminCategory, AdminSubcategory, AdminTag } from "@/data/mockData";
import { useAdminCategories } from "@/hooks/useAdminCategories";
import { useAdminTags } from "@/hooks/useAdminTags";

type TabId = "categories" | "tags";

export default function AdminCategoriesPage() {
  const t = useTranslations("admin.categories");

  const [tab, setTab] = useState<TabId>("categories");
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [page, setPage] = useState(1);

  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [categoryFormMode, setCategoryFormMode] = useState<"create" | "edit">(
    "create"
  );
  const [categoryFormLevel, setCategoryFormLevel] = useState<1 | 2>(1);
  const [editingCategory, setEditingCategory] = useState<
    AdminCategory | AdminSubcategory | null
  >(null);

  const [deleteTarget, setDeleteTarget] = useState<DeleteCategoryTarget | null>(
    null
  );

  const [tagFormOpen, setTagFormOpen] = useState(false);
  const [tagFormMode, setTagFormMode] = useState<"create" | "edit">("create");
  const [editingTag, setEditingTag] = useState<AdminTag | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);

  const categoryFilters = useMemo(
    () => ({ search: appliedSearch || undefined, page }),
    [appliedSearch, page]
  );

  const { data: categoriesData, isLoading: categoriesLoading } =
    useAdminCategories(categoryFilters);
  const { data: tags = [], isLoading: tagsLoading } = useAdminTags(
    tab === "tags" ? appliedSearch || undefined : undefined
  );

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastError(null);
    window.setTimeout(() => setToastMessage(null), 3000);
  };

  const showError = (message: string) => {
    setToastError(message);
    setToastMessage(null);
    window.setTimeout(() => setToastError(null), 3000);
  };

  const applySearch = () => {
    setAppliedSearch(searchInput.trim());
    setPage(1);
  };

  const openCreateCategory = () => {
    setCategoryFormMode("create");
    setCategoryFormLevel(1);
    setEditingCategory(null);
    setCategoryFormOpen(true);
  };

  const openEditCategoryL1 = (category: AdminCategory) => {
    setCategoryFormMode("edit");
    setCategoryFormLevel(1);
    setEditingCategory(category);
    setCategoryFormOpen(true);
  };

  const openEditCategoryL2 = (subcategory: AdminSubcategory) => {
    setCategoryFormMode("edit");
    setCategoryFormLevel(2);
    setEditingCategory(subcategory);
    setCategoryFormOpen(true);
  };

  const openCreateTag = () => {
    setTagFormMode("create");
    setEditingTag(null);
    setTagFormOpen(true);
  };

  const openEditTag = (tag: AdminTag) => {
    setTagFormMode("edit");
    setEditingTag(tag);
    setTagFormOpen(true);
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: "categories", label: t("tabCategories") },
    { id: "tags", label: t("tabTags") },
  ];

  const totalPages = categoriesData?.totalPages ?? 1;

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
        </div>
        <div className="flex w-full gap-3 md:w-auto">
          {tab === "categories" && (
            <>
              <button
                type="button"
                onClick={openCreateCategory}
                className="flex flex-1 items-center justify-center gap-2 rounded-radius-lg bg-primary px-5 py-2.5 font-kanit text-label font-semibold text-surface-card shadow-level-1 transition-all hover:bg-primary-hover active:scale-95 md:flex-none"
              >
                <PlusIcon />
                {t("addL1")}
              </button>
              <button
                type="button"
                onClick={() => showToast(t("exportSoon"))}
                className="hidden items-center gap-2 rounded-radius-lg border border-border-default px-4 py-2.5 font-kanit text-label font-medium text-text-secondary transition-colors hover:bg-surface-container-low lg:flex"
              >
                <DownloadIcon />
                {t("exportData")}
              </button>
            </>
          )}
        </div>
      </header>

      <div className="border-b border-border-default/50 bg-surface-card px-6 lg:px-8">
        <div className="mb-4 pt-4 md:hidden">
          <div className="relative">
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
              className="h-10 w-full rounded-radius-sm border border-border-input bg-surface-card pl-10 pr-4 font-sarabun text-body-md focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-primary-dark/20"
            />
          </div>
        </div>

        <nav className="flex gap-8 overflow-x-auto">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`whitespace-nowrap py-4 font-kanit text-label font-semibold transition-colors ${
                tab === item.id
                  ? "border-b-[3px] border-primary text-primary"
                  : "text-text-muted hover:text-primary"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="space-y-8 p-4 lg:p-8">
        {tab === "categories" ? (
          <>
            <CategoryTree
              categories={categoriesData?.data ?? []}
              isLoading={categoriesLoading}
              onEditL1={openEditCategoryL1}
              onEditL2={openEditCategoryL2}
              onDeleteL1={(category, displayName) =>
                setDeleteTarget({ level: 1, category, displayName })
              }
              onDeleteL2={(subcategory, displayName) =>
                setDeleteTarget({ level: 2, category: subcategory, displayName })
              }
            />

            <div className="flex flex-col items-center justify-between gap-4 font-sarabun text-body-sm text-text-muted sm:flex-row">
              <p>
                {t("paginationSummary", {
                  l1: categoriesData?.totalL1 ?? 0,
                  l2: categoriesData?.totalL2 ?? 0,
                })}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page <= 1}
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
                        page === pageNumber
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
                  disabled={page >= totalPages}
                  className="rounded-radius-lg p-1.5 text-text-muted transition-colors hover:bg-surface-container-low disabled:opacity-40"
                  aria-label={t("nextPage")}
                >
                  <ChevronRightIcon />
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={openCreateTag}
                className="flex items-center gap-2 rounded-radius-lg bg-primary px-5 py-2 font-kanit text-label font-semibold text-surface-card shadow-level-1 transition-all hover:bg-primary-hover"
              >
                <PlusIcon />
                {t("addTag")}
              </button>
            </div>
            <TagTable
              tags={tags}
              isLoading={tagsLoading}
              onEdit={openEditTag}
              onError={showError}
              onSuccess={showToast}
            />
          </>
        )}
      </div>

      <CategoryForm
        open={categoryFormOpen}
        level={categoryFormLevel}
        mode={categoryFormMode}
        category={editingCategory}
        onClose={() => setCategoryFormOpen(false)}
        onError={showError}
      />

      <DeleteCategoryModal
        open={Boolean(deleteTarget)}
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onSuccess={() => showToast(t("deleteSuccess"))}
        onError={showError}
      />

      <TagForm
        open={tagFormOpen}
        mode={tagFormMode}
        tag={editingTag}
        onClose={() => setTagFormOpen(false)}
        onError={showError}
      />

      {toastMessage && (
        <Toast message={toastMessage} variant="success" />
      )}
      {toastError && <Toast message={toastError} variant="error" />}
    </div>
  );
}

function Toast({
  message,
  variant,
}: {
  message: string;
  variant: "success" | "error";
}) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-[110] rounded-radius-lg px-5 py-3 font-sarabun text-body-md shadow-level-2 ${
        variant === "success"
          ? "bg-status-published text-surface-card"
          : "bg-status-error text-surface-card"
      }`}
      role="status"
    >
      {message}
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
