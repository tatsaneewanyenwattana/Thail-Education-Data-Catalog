"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { Control, Controller } from "react-hook-form";
import CategoryForm from "@/components/dataset/CategoryForm";
import type { DatasetFormValues } from "@/components/dataset/datasetFormSchema";
import { useCategories } from "@/hooks/useCategories";
import { useAuthStore } from "@/stores/useAuthStore";
import type { ApiCategory } from "@/utils/categoryApi";
import {
  buildCategoryTree,
  canAddChild,
  collectLeafNodes,
  collectLeavesUnder,
  findCategoryNode,
  formatCategoryPath,
  getCategoryPathNodes,
  isCategoryLeaf,
  type CategoryTreeNode,
} from "@/utils/categoryTreeUtils";

type CategoryTreePickerProps = {
  control: Control<DatasetFormValues>;
  errors: {
    categoryId?: { message?: string };
  };
  allowCreate?: boolean;
};

type CategoryComboboxProps = {
  id: string;
  label: string;
  placeholder: string;
  options: CategoryTreeNode[];
  value: string;
  onChange: (id: string) => void;
  locale: string;
  hasError?: boolean;
  emptyMessage?: string;
};

function nodeLabel(node: CategoryTreeNode, locale: string): string {
  return locale === "th" ? node.nameTh : node.nameEn;
}

function CategoryCombobox({
  id,
  label,
  placeholder,
  options,
  value,
  onChange,
  locale,
  hasError,
  emptyMessage,
}: CategoryComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.id === value) ?? null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return options;
    }
    return options.filter((node) =>
      nodeLabel(node, locale).toLowerCase().includes(q)
    );
  }, [options, query, locale]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (selected) {
      setQuery(nodeLabel(selected, locale));
    } else if (!open) {
      setQuery("");
    }
  }, [selected, locale, open]);

  return (
    <div ref={wrapperRef} className="relative">
      <label
        htmlFor={id}
        className="mb-1.5 block font-sarabun text-caption font-medium text-text-secondary"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-listbox`}
          autoComplete="off"
          placeholder={placeholder}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            if (value) {
              onChange("");
            }
          }}
          onFocus={() => setOpen(true)}
          className={`w-full rounded-radius-md border bg-surface-page py-2.5 pl-3 pr-9 font-sarabun text-label text-text-primary outline-none transition-all focus:border-border-focus focus:ring-2 focus:ring-primary-dark/20 ${
            hasError ? "border-status-error" : "border-border-input"
          }`}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setOpen((prev) => !prev)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-radius-sm p-1 text-text-muted hover:bg-surface-container"
          aria-label="toggle"
        >
          <ChevronDownIcon open={open} />
        </button>
      </div>
      {open && (
        <ul
          id={`${id}-listbox`}
          role="listbox"
          className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-radius-md border border-border-input bg-surface-page py-1 shadow-level-2"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 font-sarabun text-caption text-text-muted">
              {emptyMessage ?? placeholder}
            </li>
          ) : (
            filtered.map((node) => {
              const isSelected = node.id === value;
              return (
                <li key={node.id} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(node.id);
                      setQuery(nodeLabel(node, locale));
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-3 py-2 text-left font-sarabun text-label transition-colors hover:bg-surface-container ${
                      isSelected
                        ? "bg-primary-light font-semibold text-primary-dark"
                        : "text-text-primary"
                    }`}
                  >
                    <span>{nodeLabel(node, locale)}</span>
                    {isCategoryLeaf(node) && (
                      <span className="ml-2 shrink-0 font-sarabun text-caption text-text-muted">
                        ✓
                      </span>
                    )}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}

type CategoryPickerBodyProps = {
  categoryId: string;
  onCategoryChange: (id: string) => void;
  tree: CategoryTreeNode[];
  isLoading: boolean;
  isError: boolean;
  leafCount: number;
  hasError: boolean;
  allowCreate: boolean;
};

function CategoryPickerBody({
  categoryId,
  onCategoryChange,
  tree,
  isLoading,
  isError,
  leafCount,
  hasError,
  allowCreate,
}: CategoryPickerBodyProps) {
  const t = useTranslations("agency.upload");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const [pathIds, setPathIds] = useState<string[]>([]);
  const [subSearchQuery, setSubSearchQuery] = useState("");
  const [subSearchOpen, setSubSearchOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [parentForCreate, setParentForCreate] = useState<CategoryTreeNode | null>(
    null
  );
  const [formError, setFormError] = useState<string | null>(null);
  const subSearchRef = useRef<HTMLDivElement>(null);

  const rootId = pathIds[0] ?? "";
  const rootNode = rootId ? findCategoryNode(tree, rootId) : null;

  const browseParent = useMemo(() => {
    if (!rootNode || isCategoryLeaf(rootNode)) {
      return null;
    }
    if (pathIds.length <= 1) {
      return rootNode;
    }
    const lastNode = findCategoryNode(tree, pathIds[pathIds.length - 1]);
    if (lastNode && !isCategoryLeaf(lastNode)) {
      return lastNode;
    }
    return null;
  }, [rootNode, pathIds, tree]);

  const browseOptions = browseParent?.children ?? [];

  const subSearchResults = useMemo(() => {
    if (!rootNode || isCategoryLeaf(rootNode)) {
      return [];
    }
    const q = subSearchQuery.trim().toLowerCase();
    if (!q) {
      return [];
    }
    return collectLeavesUnder(rootNode)
      .map((leaf) => {
        const fullPath = getCategoryPathNodes(tree, leaf.id);
        if (!fullPath) {
          return null;
        }
        const rootIndex = fullPath.findIndex((n) => n.id === rootNode.id);
        const relativePath = fullPath.slice(rootIndex + 1);
        const relativeLabel =
          relativePath.length > 0
            ? relativePath.map((n) => nodeLabel(n, locale)).join(" › ")
            : nodeLabel(leaf, locale);
        return { leaf, fullPath, relativeLabel };
      })
      .filter(
        (
          item
        ): item is {
          leaf: CategoryTreeNode;
          fullPath: CategoryTreeNode[];
          relativeLabel: string;
        } => item !== null
      )
      .filter((item) => item.relativeLabel.toLowerCase().includes(q));
  }, [rootNode, tree, subSearchQuery, locale]);

  const selectedPathNodes = useMemo(() => {
    if (pathIds.length === 0) {
      return [];
    }
    return getCategoryPathNodes(tree, pathIds[pathIds.length - 1]) ?? [];
  }, [pathIds, tree]);

  const lastPathNode =
    selectedPathNodes.length > 0
      ? selectedPathNodes[selectedPathNodes.length - 1]
      : null;

  const canAddSubcategory =
    allowCreate &&
    lastPathNode !== null &&
    !isCategoryLeaf(lastPathNode) &&
    canAddChild(lastPathNode);

  const applyPath = (ids: string[]) => {
    setPathIds(ids);
    if (ids.length === 0) {
      onCategoryChange("");
      return;
    }
    const lastId = ids[ids.length - 1];
    const lastNode = findCategoryNode(tree, lastId);
    if (lastNode && isCategoryLeaf(lastNode)) {
      onCategoryChange(lastId);
    } else {
      onCategoryChange("");
    }
  };

  const handleRootSelect = (id: string) => {
    setSubSearchQuery("");
    setSubSearchOpen(false);
    if (!id) {
      applyPath([]);
      return;
    }
    applyPath([id]);
  };

  const handleBrowseSelect = (node: CategoryTreeNode) => {
    setSubSearchQuery("");
    setSubSearchOpen(false);
    const parentPath = browseParent
      ? getCategoryPathNodes(tree, browseParent.id)
      : null;
    if (!parentPath) {
      return;
    }
    applyPath([...parentPath.map((n) => n.id), node.id]);
  };

  const handleSubSearchSelect = (fullPath: CategoryTreeNode[]) => {
    setPathIds(fullPath.map((n) => n.id));
    onCategoryChange(fullPath[fullPath.length - 1].id);
    setSubSearchQuery(
      formatCategoryPath(
        fullPath.slice(fullPath.findIndex((n) => n.id === rootNode?.id) + 1),
        locale
      )
    );
    setSubSearchOpen(false);
  };

  const openCreateRoot = () => {
    setParentForCreate(null);
    setFormError(null);
    setFormOpen(true);
  };

  const openCreateChild = () => {
    if (!lastPathNode || !canAddChild(lastPathNode)) {
      return;
    }
    setParentForCreate(lastPathNode);
    setFormError(null);
    setFormOpen(true);
  };

  const handleCreated = (category: ApiCategory) => {
    const newId = String(category.id);

    if (category.parent_id && parentForCreate) {
      const ids = [...pathIds, newId];
      setPathIds(ids);
      onCategoryChange(newId);
      setSubSearchQuery("");
      return;
    }

    setPathIds([newId]);
    onCategoryChange(newId);
    setSubSearchQuery("");
  };

  useEffect(() => {
    if (!categoryId || tree.length === 0) {
      return;
    }
    const pathNodes = getCategoryPathNodes(tree, categoryId);
    if (pathNodes) {
      setPathIds(pathNodes.map((n) => n.id));
    }
  }, [categoryId, tree]);

  useEffect(() => {
    if (!subSearchOpen) {
      return;
    }
    const handleClickOutside = (event: MouseEvent) => {
      if (
        subSearchRef.current &&
        !subSearchRef.current.contains(event.target as Node)
      ) {
        setSubSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [subSearchOpen]);

  const showSubPanel =
    rootNode !== null && !isCategoryLeaf(rootNode) && rootNode.children.length > 0;

  const subBreadcrumb = useMemo(() => {
    if (!rootNode || pathIds.length <= 1) {
      return null;
    }
    const trail = pathIds
      .slice(1)
      .map((id) => findCategoryNode(tree, id))
      .filter((n): n is CategoryTreeNode => n !== null);
    return trail.length > 0 ? formatCategoryPath(trail, locale) : null;
  }, [rootNode, pathIds, tree, locale]);

  const hasLeafSelected =
    Boolean(categoryId) &&
    lastPathNode !== null &&
    isCategoryLeaf(lastPathNode);

  return (
    <>
      {formError && (
        <p className="mb-2 font-sarabun text-caption text-status-error">
          {formError}
        </p>
      )}

      <div
        className={`space-y-4 rounded-radius-md border bg-surface-page p-4 ${
          hasError ? "border-status-error" : "border-border-input"
        }`}
      >
        {isLoading && (
          <p className="font-sarabun text-label text-text-muted">
            {tCommon("loading")}
          </p>
        )}
        {isError && (
          <p className="font-sarabun text-label text-status-error">
            {t("fieldCategoryLoadError")}
          </p>
        )}

        {!isLoading && !isError && leafCount === 0 && (
          <div>
            <p className="font-sarabun text-label text-text-muted">
              {t("fieldCategoryEmpty")}
            </p>
            {allowCreate && (
              <p className="mt-1 font-sarabun text-caption text-text-muted">
                {t("fieldCategoryEmptyHint")}
              </p>
            )}
          </div>
        )}

        {!isLoading && !isError && leafCount > 0 && (
          <>
            <CategoryCombobox
              id="category-root"
              label={t("fieldCategoryRoot")}
              placeholder={t("fieldCategoryRootPlaceholder")}
              options={tree}
              value={rootId}
              onChange={handleRootSelect}
              locale={locale}
              hasError={hasError}
              emptyMessage={t("fieldCategorySearchEmpty")}
            />

            {showSubPanel && (
              <div className="rounded-radius-md border border-border-input bg-surface-container/50 p-4">
                <p className="mb-3 font-sarabun text-label font-semibold text-text-primary">
                  {t("fieldCategorySubPanelTitle", {
                    root: nodeLabel(rootNode, locale),
                  })}
                </p>

                <div ref={subSearchRef} className="relative mb-4">
                  <label
                    htmlFor="category-sub-search"
                    className="mb-1.5 block font-sarabun text-caption font-medium text-text-secondary"
                  >
                    {t("fieldCategorySubSearch")}
                  </label>
                  <input
                    id="category-sub-search"
                    type="search"
                    value={subSearchQuery}
                    onChange={(event) => {
                      setSubSearchQuery(event.target.value);
                      setSubSearchOpen(true);
                    }}
                    onFocus={() => setSubSearchOpen(true)}
                    placeholder={t("fieldCategorySubSearchPlaceholder")}
                    className="w-full rounded-radius-md border border-border-input bg-surface-page py-2.5 px-3 font-sarabun text-label text-text-primary outline-none transition-all focus:border-border-focus focus:ring-2 focus:ring-primary-dark/20"
                  />
                  {subSearchOpen && subSearchQuery.trim() && (
                    <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-radius-md border border-border-input bg-surface-page py-1 shadow-level-2">
                      {subSearchResults.length === 0 ? (
                        <li className="px-3 py-2 font-sarabun text-caption text-text-muted">
                          {t("fieldCategorySearchEmpty")}
                        </li>
                      ) : (
                        subSearchResults.map((item) => (
                          <li key={item.leaf.id}>
                            <button
                              type="button"
                              onClick={() =>
                                handleSubSearchSelect(item.fullPath)
                              }
                              className="w-full px-3 py-2 text-left font-sarabun text-label text-text-primary transition-colors hover:bg-surface-container"
                            >
                              {item.relativeLabel}
                            </button>
                          </li>
                        ))
                      )}
                    </ul>
                  )}
                </div>

                {!subSearchQuery.trim() && (
                  <>
                    {pathIds.length > 1 && (
                      <button
                        type="button"
                        onClick={() => applyPath(pathIds.slice(0, -1))}
                        className="mb-3 font-sarabun text-caption font-medium text-primary-dark hover:underline"
                      >
                        {t("fieldCategorySubBack")}
                      </button>
                    )}
                    {subBreadcrumb && (
                      <p className="mb-2 font-sarabun text-caption text-text-muted">
                        {t("fieldCategorySubBreadcrumb", {
                          path: subBreadcrumb,
                        })}
                      </p>
                    )}
                    <p className="mb-2 font-sarabun text-caption text-text-secondary">
                      {t("fieldCategorySubBrowseHint")}
                    </p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {browseOptions.map((node) => {
                        const isActive = pathIds.includes(node.id);
                        const isLeaf = isCategoryLeaf(node);
                        return (
                          <button
                            key={node.id}
                            type="button"
                            onClick={() => handleBrowseSelect(node)}
                            className={`flex items-center justify-between rounded-radius-md border px-3 py-2.5 text-left font-sarabun text-label transition-colors ${
                              isActive
                                ? "border-primary-dark bg-primary-light font-semibold text-primary-dark"
                                : "border-border-input bg-surface-page text-text-primary hover:border-primary-dark/40 hover:bg-surface-container"
                            }`}
                          >
                            <span>{nodeLabel(node, locale)}</span>
                            <span className="ml-2 shrink-0 font-sarabun text-caption text-text-muted">
                              {isLeaf ? "✓" : "›"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {browseOptions.length === 0 && (
                      <p className="font-sarabun text-caption text-text-muted">
                        {t("fieldCategorySubEmpty")}
                      </p>
                    )}
                  </>
                )}
              </div>
            )}

            {hasLeafSelected && selectedPathNodes.length > 0 && (
              <div className="flex items-start gap-2 rounded-radius-md border border-primary-dark/20 bg-primary-light/40 px-3 py-2.5">
                <CheckIcon />
                <div>
                  <p className="font-sarabun text-caption font-medium text-primary-dark">
                    {t("fieldCategorySelected")}
                  </p>
                  <p className="font-sarabun text-label text-text-primary">
                    {formatCategoryPath(selectedPathNodes, locale)}
                  </p>
                </div>
              </div>
            )}

            {!hasLeafSelected && pathIds.length > 0 && showSubPanel && (
              <p className="font-sarabun text-caption text-text-muted">
                {t("fieldCategorySelectLeafHint")}
              </p>
            )}
          </>
        )}

        {allowCreate && (
          <div className="space-y-3 border-t border-border-input pt-4">
            <p className="flex items-start gap-2 rounded-radius-sm border border-primary-dark/15 bg-primary-light/50 px-3 py-2 font-sarabun text-caption text-text-secondary">
              <InfoIcon />
              {t("fieldCategoryCreateHint")}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={openCreateRoot}
                className="rounded-radius-sm border border-primary-dark px-3 py-1.5 font-sarabun text-caption font-medium text-primary-dark transition-colors hover:bg-primary-light"
              >
                + {t("fieldCategoryCreateRoot")}
              </button>
              {canAddSubcategory && (
                <button
                  type="button"
                  onClick={openCreateChild}
                  className="rounded-radius-sm border border-border-input px-3 py-1.5 font-sarabun text-caption font-medium text-text-secondary transition-colors hover:bg-surface-container"
                >
                  + {t("fieldCategoryAddChild")}
                </button>
              )}
            </div>
          </div>
        )}

        <p className="font-sarabun text-caption text-text-muted">
          {t("fieldCategoryEmptyHint")}
        </p>
      </div>

      {allowCreate && (
        <CategoryForm
          open={formOpen}
          mode="create"
          parent={parentForCreate}
          onClose={() => setFormOpen(false)}
          onError={setFormError}
          onCreated={handleCreated}
        />
      )}
    </>
  );
}

export default function CategoryTreePicker({
  control,
  errors,
  allowCreate = true,
}: CategoryTreePickerProps) {
  const t = useTranslations("agency.upload");
  const userId = useAuthStore((s) => s.user?.id);
  const userRole = useAuthStore((s) => s.user?.role);
  const { data: categories = [], isLoading, isError } = useCategories();

  const isAdmin = userRole === "admin";

  const tree = useMemo(() => {
    const mine = categories.filter(
      (c) => isAdmin || !userId || String(c.created_by) === String(userId)
    );
    return buildCategoryTree(mine);
  }, [categories, userId, isAdmin]);

  const leafCount = useMemo(() => collectLeafNodes(tree).length, [tree]);

  return (
    <div>
      <label className="mb-2 block font-sarabun text-label text-text-secondary">
        {t("fieldCategory")} *
      </label>

      <Controller
        name="categoryId"
        control={control}
        render={({ field }) => (
          <CategoryPickerBody
            categoryId={field.value}
            onCategoryChange={field.onChange}
            tree={tree}
            isLoading={isLoading}
            isError={isError}
            leafCount={leafCount}
            hasError={Boolean(errors.categoryId)}
            allowCreate={allowCreate}
          />
        )}
      />

      {errors.categoryId?.message && (
        <p className="mt-1 font-sarabun text-caption text-status-error">
          {errors.categoryId.message}
        </p>
      )}
    </div>
  );
}

function ChevronDownIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M7 10l5 5 5-5H7z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="mt-0.5 h-4 w-4 shrink-0 text-primary-dark"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg
      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-dark"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
    </svg>
  );
}
