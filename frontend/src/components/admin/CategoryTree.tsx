"use client";

import { useLocale, useTranslations } from "next-intl";
import type { MouseEvent, ReactNode } from "react";
import { useState } from "react";
import type { AdminCategory, AdminSubcategory } from "@/data/mockData";

type CategoryTreeProps = {
  categories: AdminCategory[];
  isLoading?: boolean;
  onEditL1: (category: AdminCategory) => void;
  onEditL2: (subcategory: AdminSubcategory) => void;
  onDeleteL1: (category: AdminCategory, displayName: string) => void;
  onDeleteL2: (subcategory: AdminSubcategory, displayName: string) => void;
};

function formatCount(value: number, locale: string): string {
  return value.toLocaleString(locale === "th" ? "th-TH" : "en-US");
}

export default function CategoryTree({
  categories,
  isLoading,
  onEditL1,
  onEditL2,
  onDeleteL1,
  onDeleteL2,
}: CategoryTreeProps) {
  const t = useTranslations("admin.categories");
  const locale = useLocale();
  const [expandedIds, setExpandedIds] = useState<string[]>(
    categories.length > 0 ? [categories[0].id] : []
  );

  const toggleExpand = (id: string) => {
    setExpandedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-radius-lg border border-border-default bg-surface-card shadow-level-1">
        <div className="animate-pulse space-y-3 p-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-12 rounded-radius-sm bg-surface-container" />
          ))}
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="rounded-radius-lg border border-border-default bg-surface-card p-12 text-center shadow-level-1">
        <p className="font-sarabun text-body-md text-text-muted">{t("empty")}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-radius-lg border border-border-default bg-surface-card shadow-level-1">
      <div className="grid grid-cols-12 gap-4 bg-surface-container-low px-6 py-4 font-kanit text-[13px] font-bold uppercase tracking-wider text-text-muted">
        <div className="col-span-7 md:col-span-8">{t("colName")}</div>
        <div className="col-span-3 text-center md:col-span-2">{t("colDatasets")}</div>
        <div className="col-span-2 text-right">{t("colAction")}</div>
      </div>

      <div className="divide-y divide-border-default/30">
        {categories.map((category) => {
          const isExpanded = expandedIds.includes(category.id);
          const displayName = `${category.nameTh} (${category.nameEn})`;

          return (
            <div key={category.id}>
              <div
                className="group grid min-h-[56px] cursor-pointer grid-cols-12 items-center gap-4 px-6 transition-colors hover:bg-surface-container-lowest"
                onClick={() => toggleExpand(category.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    toggleExpand(category.id);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
              >
                <div className="col-span-7 flex items-center gap-3 md:col-span-8">
                  <ChevronIcon expanded={isExpanded} />
                  <span className="font-kanit text-[15px] font-semibold text-text-primary">
                    {displayName}
                  </span>
                </div>
                <div className="col-span-3 text-center md:col-span-2">
                  <span className="rounded-radius-full bg-status-published-bg px-3 py-1 font-sarabun text-caption font-bold text-status-published">
                    {formatCount(category.datasetCount, locale)}
                  </span>
                </div>
                <div className="col-span-2 flex justify-end gap-1 md:gap-3">
                  <ActionButton
                    label={t("edit")}
                    onClick={(event) => {
                      event.stopPropagation();
                      onEditL1(category);
                    }}
                  >
                    <EditIcon />
                  </ActionButton>
                  <ActionButton
                    label={t("delete")}
                    onClick={(event) => {
                      event.stopPropagation();
                      onDeleteL1(category, category.nameTh);
                    }}
                    danger
                  >
                    <DeleteIcon />
                  </ActionButton>
                </div>
              </div>

              {isExpanded && category.subcategories.length > 0 && (
                <div className="bg-surface-page/50">
                  {category.subcategories.map((subcategory) => (
                    <div
                      key={subcategory.id}
                      className="grid min-h-[48px] grid-cols-12 items-center gap-4 border-l-4 border-transparent px-6 pl-12 transition-colors hover:border-primary/30 hover:bg-surface-card md:pl-16"
                    >
                      <div className="col-span-7 flex items-center gap-2 md:col-span-8">
                        <span className="h-1.5 w-1.5 rounded-radius-full bg-border-default" />
                        <span className="font-sarabun text-body-sm text-text-primary">
                          {subcategory.nameTh}
                        </span>
                        <span className="hidden rounded-radius-sm bg-secondary-fixed px-2 py-0.5 font-sarabun text-[10px] font-bold uppercase text-on-secondary-fixed-variant sm:inline">
                          {t("agencyOwner")}
                        </span>
                        <span className="font-sarabun text-caption text-text-muted">
                          {subcategory.agencyName}
                        </span>
                      </div>
                      <div className="col-span-3 text-center font-sarabun text-body-sm text-text-muted md:col-span-2">
                        {formatCount(subcategory.datasetCount, locale)}
                      </div>
                      <div className="col-span-2 flex justify-end gap-1 md:gap-2">
                        <ActionButton
                          label={t("edit")}
                          onClick={() => onEditL2(subcategory)}
                          small
                        >
                          <EditIcon />
                        </ActionButton>
                        <ActionButton
                          label={t("delete")}
                          onClick={() =>
                            onDeleteL2(subcategory, subcategory.nameTh)
                          }
                          small
                          danger
                        >
                          <DeleteIcon />
                        </ActionButton>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ActionButton({
  children,
  label,
  onClick,
  small,
  danger,
}: {
  children: ReactNode;
  label: string;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  small?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`rounded-radius-sm p-1 transition-colors ${
        small ? "text-text-muted" : "text-text-muted hover:text-primary"
      } ${danger ? "hover:text-status-error" : "hover:text-primary"}`}
    >
      {children}
    </button>
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`h-5 w-5 text-primary transition-transform duration-200 ${
        expanded ? "rotate-0" : "-rotate-90"
      }`}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
    </svg>
  );
}
