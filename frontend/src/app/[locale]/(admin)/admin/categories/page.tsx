"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import CategoryForm from "@/components/admin/CategoryForm";
import CategoryTree from "@/components/admin/CategoryTree";
import DeleteCategoryModal from "@/components/admin/DeleteCategoryModal";
import {
  ADMIN_AGENCY_PAGE_SIZE,
  useAdminCategories,
  type AdminCategoryTreeNode,
} from "@/hooks/useAdminCategories";
import { MAX_CATEGORY_DEPTH } from "@/utils/categoryTreeUtils";
import { toast } from "@/stores/toastStore";

type TabMode = "agency" | "admin";

export default function AdminCategoriesPage() {
  const t = useTranslations("admin.categories");
  const locale = useLocale();
  const base = `/${locale}`;

  const [tab, setTab] = useState<TabMode>("agency");
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

  const allCategories = categoriesData?.data ?? [];
  const adminOwnerLabel = t("adminOwner");

  const filteredCategories = useMemo(() => {
    if (tab === "admin") {
      return allCategories.filter((c) => c.agencyName === adminOwnerLabel);
    }
    return allCategories.filter((c) => c.agencyName !== adminOwnerLabel);
  }, [allCategories, tab, adminOwnerLabel]);

  const totalCategories = filteredCategories.length;
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(totalCategories / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedCategories = filteredCategories.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );
  const startItem = totalCategories === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem = Math.min(safePage * pageSize, totalCategories);

  const levelSummary = useMemo(() => {
    const counts = categoriesData?.countsByLevel ?? {};
    return Array.from({ length: MAX_CATEGORY_DEPTH }, (_, index) => {
      const level = index + 1;
      return { level, count: counts[level] ?? 0 };
    }).filter((item) => item.count > 0);
  }, [categoriesData?.countsByLevel]);

  return (
    <div className="mx-auto max-w-container-max space-y-6 pb-24">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <nav className="mb-2 flex font-sarabun text-label text-text-muted">
            <Link href={base} className="hover:text-primary-dark">
              {t("breadcrumbHome")}
            </Link>
            <span className="mx-2">&gt;</span>
            <span>{t("breadcrumbManagement")}</span>
            <span className="mx-2">&gt;</span>
            <span className="font-medium text-primary-dark">{t("breadcrumbCategories")}</span>
          </nav>
          <h1 className="font-kanit text-[28px] font-bold leading-tight text-text-primary">
            {t("title")}
          </h1>
          <p className="mt-1 font-sarabun text-body-md text-text-muted">
            {t("subtitle")}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => showToast(t("exportSoon"))}
            className="hidden items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 font-sarabun text-label font-medium text-text-secondary shadow-sm transition-all hover:bg-gray-50 hover:shadow-md lg:flex"
          >
            <DownloadIcon />
            {t("exportData")}
          </button>
          <button
            type="button"
            onClick={openCreateRoot}
            className="inline-flex items-center gap-2 rounded-full bg-primary-dark px-5 py-2.5 font-sarabun text-label font-medium text-white shadow-md transition-all hover:bg-primary-hover hover:shadow-lg"
          >
            <PlusCircleIcon />
            {t("addRoot")}
          </button>
        </div>
      </header>

      {/* Search + Tabs */}
      <section className="rounded-2xl border border-white/80 bg-white p-6 shadow-md">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative min-w-[280px] flex-1">
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
              className="h-11 w-full rounded-full border border-gray-200 bg-gray-50 pl-10 pr-4 font-sarabun text-body-md shadow-sm transition-all hover:border-gray-300 focus:border-primary-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-dark/20"
            />
          </div>
        </div>

        {/* Tab buttons */}
        <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={() => { setTab("agency"); setPage(1); }}
            className={`rounded-full px-5 py-2 font-sarabun text-label font-medium transition-all ${
              tab === "agency"
                ? "bg-primary-dark text-white shadow-md"
                : "bg-gray-100 text-text-secondary hover:bg-gray-200"
            }`}
          >
            {t("tabAgency")}
          </button>
          <button
            type="button"
            onClick={() => { setTab("admin"); setPage(1); }}
            className={`rounded-full px-5 py-2 font-sarabun text-label font-medium transition-all ${
              tab === "admin"
                ? "bg-primary-dark text-white shadow-md"
                : "bg-gray-100 text-text-secondary hover:bg-gray-200"
            }`}
          >
            {t("tabAdmin")}
          </button>
        </div>
      </section>

      {/* Category Table */}
      <CategoryTree
        categories={pagedCategories}
        isLoading={categoriesLoading}
        onAddRoot={openCreateRoot}
        onAddChild={openCreateChild}
        onEdit={openEditCategory}
        onDelete={(category, displayName) => {
          setDeleteTarget(category);
          setDeleteDisplayName(displayName);
        }}
      />

      {/* Pagination */}
      {totalCategories > 0 && (
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="font-sarabun text-label text-text-muted">
            {t("paginationCategorySummary", {
              start: startItem,
              end: endItem,
              total: totalCategories,
            })}
          </p>
          {totalPages > 1 && (
            <nav className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((c) => Math.max(1, c - 1))}
                disabled={safePage <= 1}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-text-muted shadow-sm transition-all hover:bg-gray-50 hover:shadow-md disabled:opacity-30"
                aria-label={t("prevPage")}
              >
                <ChevronLeftIcon />
              </button>
              {Array.from({ length: totalPages }).map((_, index) => {
                const p = index + 1;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    className={`flex h-10 w-10 items-center justify-center rounded-full font-sarabun text-label font-bold transition-all ${
                      safePage === p
                        ? "bg-primary-dark text-white shadow-md"
                        : "border border-gray-200 bg-white text-text-muted hover:bg-gray-50 hover:shadow-sm"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setPage((c) => Math.min(totalPages, c + 1))}
                disabled={safePage >= totalPages}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-text-muted shadow-sm transition-all hover:bg-gray-50 hover:shadow-md disabled:opacity-30"
                aria-label={t("nextPage")}
              >
                <ChevronRightIcon />
              </button>
            </nav>
          )}
        </div>
      )}

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
    </div>
  );
}

function SearchIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function PlusCircleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
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
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}
