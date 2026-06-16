"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState, type ReactNode } from "react";
import type {
  AdminAgencyCategoryGroup,
  AdminCategoryTreeNode,
} from "@/hooks/useAdminCategories";
import { canAddChild } from "@/utils/categoryTreeUtils";

type CategoryTreeProps = {
  groups: AdminAgencyCategoryGroup[];
  isLoading?: boolean;
  onAddRoot: () => void;
  onAddChild: (parent: AdminCategoryTreeNode) => void;
  onEdit: (node: AdminCategoryTreeNode) => void;
  onDelete: (node: AdminCategoryTreeNode, displayName: string) => void;
};

function formatCount(value: number, locale: string): string {
  return value.toLocaleString(locale === "th" ? "th-TH" : "en-US");
}

function TreeRow({
  node,
  depth,
  expanded,
  onToggle,
  onAddChild,
  onEdit,
  onDelete,
  locale,
  t,
}: {
  node: AdminCategoryTreeNode;
  depth: number;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onAddChild: (parent: AdminCategoryTreeNode) => void;
  onEdit: (node: AdminCategoryTreeNode) => void;
  onDelete: (node: AdminCategoryTreeNode, displayName: string) => void;
  locale: string;
  t: ReturnType<typeof useTranslations>;
}) {
  const label = locale === "th" ? node.nameTh : node.nameEn;
  const hasChildren = node.children.length > 0;
  const isExpanded = expanded.has(node.id);

  return (
    <>
      <div
        className={`grid min-h-[48px] grid-cols-12 items-center gap-4 px-6 transition-colors hover:bg-surface-container-lowest ${
          depth > 0 ? "bg-surface-page/50" : ""
        }`}
        style={{ paddingLeft: `${24 + depth * 20}px` }}
      >
        <div className="col-span-5 flex items-center gap-2 md:col-span-5">
          {hasChildren ? (
            <button
              type="button"
              onClick={() => onToggle(node.id)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-radius-sm text-primary"
              aria-expanded={isExpanded}
            >
              <ChevronIcon expanded={isExpanded} />
            </button>
          ) : (
            <span className="inline-block h-7 w-7 shrink-0" />
          )}
          <span
            className={`font-sarabun text-body-sm ${
              depth === 0
                ? "font-kanit text-[15px] font-semibold text-text-primary"
                : "text-text-primary"
            }`}
          >
            {label}
          </span>
          <span className="rounded-radius-full bg-surface-container px-2 py-0.5 font-sarabun text-caption text-text-muted">
            {t("levelBadge", { level: node.level })}
          </span>
        </div>
        <div className="col-span-3 hidden font-sarabun text-body-sm text-text-secondary md:col-span-3 md:block">
          {node.agencyName}
        </div>
        <div className="col-span-3 text-center md:col-span-2">
          <span className="rounded-radius-full bg-status-published-bg px-3 py-1 font-sarabun text-caption font-bold text-status-published">
            {formatCount(node.datasetCount, locale)}
          </span>
        </div>
        <div className="col-span-4 flex justify-end gap-1 md:col-span-2 md:gap-2">
          {canAddChild(node) && (
            <ActionButton
              label={t("addChild")}
              onClick={() => onAddChild(node)}
              small
            >
              <PlusIcon />
            </ActionButton>
          )}
          <ActionButton label={t("edit")} onClick={() => onEdit(node)} small>
            <EditIcon />
          </ActionButton>
          <ActionButton
            label={t("delete")}
            onClick={() => onDelete(node, label)}
            small
            danger
          >
            <DeleteIcon />
          </ActionButton>
        </div>
      </div>
      {hasChildren &&
        isExpanded &&
        node.children.map((child) => (
          <TreeRow
            key={child.id}
            node={child}
            depth={depth + 1}
            expanded={expanded}
            onToggle={onToggle}
            onAddChild={onAddChild}
            onEdit={onEdit}
            onDelete={onDelete}
            locale={locale}
            t={t}
          />
        ))}
    </>
  );
}

export default function CategoryTree({
  groups,
  isLoading,
  onAddRoot,
  onAddChild,
  onEdit,
  onDelete,
}: CategoryTreeProps) {
  const t = useTranslations("admin.categories");
  const locale = useLocale();
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const rootIds = groups.flatMap((group) =>
      group.categories.map((category) => category.id)
    );
    if (rootIds.length === 0) {
      setExpanded(new Set());
      return;
    }
    setExpanded((current) => {
      if (current.size > 0) {
        return current;
      }
      return new Set(rootIds);
    });
  }, [groups]);

  const toggleExpand = (id: string) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-radius-lg border border-border-default bg-surface-card shadow-level-1">
        <div className="animate-pulse space-y-3 p-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-12 rounded-radius-sm bg-surface-container"
            />
          ))}
        </div>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="rounded-radius-lg border border-border-default bg-surface-card p-12 text-center shadow-level-1">
        <p className="font-sarabun text-body-md text-text-muted">{t("empty")}</p>
        <button
          type="button"
          onClick={onAddRoot}
          className="mt-4 rounded-radius-lg bg-primary px-5 py-2 font-kanit text-label font-semibold text-surface-card"
        >
          {t("addRoot")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section
          key={group.agencyName}
          className="overflow-hidden rounded-radius-lg border border-border-default bg-surface-card shadow-level-1"
        >
          <div className="border-b border-border-default/30 bg-surface-container px-6 py-3">
            <h2 className="font-kanit text-heading-3 font-semibold text-text-primary">
              {group.agencyName}
            </h2>
            <p className="font-sarabun text-caption text-text-muted">
              {t("agencyGroupSummary", { count: group.categories.length })}
            </p>
          </div>

          <div className="grid grid-cols-12 gap-4 bg-surface-container-low px-6 py-4 font-kanit text-[13px] font-bold uppercase tracking-wider text-text-muted">
            <div className="col-span-5 md:col-span-5">{t("colName")}</div>
            <div className="col-span-3 hidden md:col-span-3 md:block">
              {t("colAgency")}
            </div>
            <div className="col-span-3 text-center md:col-span-2">
              {t("colDatasets")}
            </div>
            <div className="col-span-4 text-right md:col-span-2">
              {t("colAction")}
            </div>
          </div>

          <div className="divide-y divide-border-default/30">
            {group.categories.map((category) => (
              <TreeRow
                key={category.id}
                node={category}
                depth={0}
                expanded={expanded}
                onToggle={toggleExpand}
                onAddChild={onAddChild}
                onEdit={onEdit}
                onDelete={onDelete}
                locale={locale}
                t={t}
              />
            ))}
          </div>
        </section>
      ))}
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
  onClick: () => void;
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
      className={`h-5 w-5 transition-transform duration-200 ${
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

function PlusIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 0 0 0-1.42l-2.34-2.34a1.003 1.003 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
    </svg>
  );
}
