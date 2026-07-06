"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";
import type { AdminCategoryTreeNode } from "@/hooks/useAdminCategories";
import { canAddChild } from "@/utils/categoryTreeUtils";

type CategoryTreeProps = {
  categories: AdminCategoryTreeNode[];
  isLoading?: boolean;
  onAddRoot: () => void;
  onAddChild: (parent: AdminCategoryTreeNode) => void;
  onEdit: (node: AdminCategoryTreeNode) => void;
  onDelete: (node: AdminCategoryTreeNode, displayName: string) => void;
  onMove?: (node: AdminCategoryTreeNode) => void;
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
  onMove,
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
  onMove?: (node: AdminCategoryTreeNode) => void;
  locale: string;
  t: ReturnType<typeof useTranslations>;
}) {
  const label = locale === "th" ? node.nameTh : node.nameEn;
  const hasChildren = node.children.length > 0;
  const isExpanded = expanded.has(node.id);
  const isRoot = depth === 0;

  return (
    <>
      <tr
        className={`transition-colors ${
          isRoot ? "hover:bg-[#f8f9fa]" : "bg-[#fafbfc] hover:bg-[#f3f4f5]/50"
        }`}
      >
        {/* Name + Slug */}
        <td className="px-6 py-4" style={{ paddingLeft: `${24 + depth * 28}px` }}>
          <div className="flex items-center gap-2">
            {hasChildren ? (
              <button
                type="button"
                onClick={() => onToggle(node.id)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#053F5C] transition-colors hover:bg-[#053F5C]/10"
                aria-expanded={isExpanded}
              >
                <ChevronIcon expanded={isExpanded} />
              </button>
            ) : (
              <span className="inline-block h-7 w-7 shrink-0" />
            )}
            <span
              className={`font-sarabun ${
                isRoot
                  ? "text-body-md font-semibold text-text-primary"
                  : "text-label text-text-primary"
              }`}
            >
              {label}
            </span>
          </div>
        </td>
        {/* Agency */}
        <td className="hidden px-6 py-4 font-sarabun text-label text-text-muted md:table-cell">
          {node.agencyName}
        </td>
        {/* Dataset count */}
        <td className="px-6 py-4 text-center">
          <span className={`inline-flex rounded-full px-3 py-1 font-sarabun text-xs font-bold ${
            isRoot
              ? "bg-[#00AFB9]/15 text-[#006e74]"
              : "bg-gray-100 text-text-muted"
          }`}>
            {formatCount(node.datasetCount, locale)} ชุดข้อมูล
          </span>
        </td>
        {/* Actions */}
        <td className="px-6 py-4">
          <div className="flex justify-end gap-1">
            {canAddChild(node) && (
              <ActionButton
                label={t("addChild")}
                onClick={() => onAddChild(node)}
              >
                <PlusIcon />
              </ActionButton>
            )}
            {onMove && node.parentId && (
              <ActionButton label="ย้าย" onClick={() => onMove(node)}>
                <MoveIcon />
              </ActionButton>
            )}
            <ActionButton label={t("edit")} onClick={() => onEdit(node)}>
              <EditIcon />
            </ActionButton>
            <ActionButton
              label={t("delete")}
              onClick={() => onDelete(node, label)}
              danger
            >
              <DeleteIcon />
            </ActionButton>
          </div>
        </td>
      </tr>
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
            onMove={onMove}
            locale={locale}
            t={t}
          />
        ))}
    </>
  );
}

export default function CategoryTree({
  categories,
  isLoading,
  onAddRoot,
  onAddChild,
  onEdit,
  onDelete,
  onMove,
}: CategoryTreeProps) {
  const t = useTranslations("admin.categories");
  const locale = useLocale();
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

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
      <div className="overflow-hidden rounded-2xl border border-white/80 bg-white shadow-md">
        <div className="animate-pulse space-y-3 p-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-12 rounded-xl bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="rounded-2xl border border-white/80 bg-white p-12 text-center shadow-md">
        <p className="font-sarabun text-body-md text-text-muted">{t("empty")}</p>
        <button
          type="button"
          onClick={onAddRoot}
          className="mt-4 rounded-full bg-gradient-to-r from-[#053F5C] to-[#0081A7] px-6 py-2.5 font-sarabun text-label font-bold text-white shadow-lg shadow-[#053F5C]/20 transition-all hover:shadow-[#0081A7]/30"
        >
          {t("addRoot")}
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/80 bg-white shadow-md">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-left">
          <thead>
            <tr className="border-b border-gray-200 bg-[#f3f4f5] font-sarabun text-[10px] font-bold uppercase tracking-wider text-[#053F5C]">
              <th className="px-6 py-4">
                <span className="flex items-center gap-1">
                  {t("colName")} / {t("colSlug")}
                  <SortIcon />
                </span>
              </th>
              <th className="hidden px-6 py-4 md:table-cell">{t("colAgency")}</th>
              <th className="px-6 py-4 text-center">{t("colDatasets")}</th>
              <th className="px-6 py-4 text-right">{t("colAction")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/60">
            {categories.map((category) => (
              <TreeRow
                key={category.id}
                node={category}
                depth={0}
                expanded={expanded}
                onToggle={toggleExpand}
                onAddChild={onAddChild}
                onEdit={onEdit}
                onDelete={onDelete}
                onMove={onMove}
                locale={locale}
                t={t}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ActionButton({
  children,
  label,
  onClick,
  danger,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`rounded-full p-2 transition-colors ${
        danger
          ? "text-red-400 hover:bg-red-50 hover:text-red-600"
          : "text-[#0081A7] hover:bg-[#053F5C]/10 hover:text-[#053F5C]"
      }`}
    >
      {children}
    </button>
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`h-5 w-5 transition-transform duration-200 ${
        expanded ? "rotate-90" : "rotate-0"
      }`}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z" />
    </svg>
  );
}

function SortIcon() {
  return (
    <svg className="h-4 w-4 text-text-muted" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 5.83 15.17 9l1.41-1.41L12 3 7.41 7.59 8.83 9 12 5.83zm0 12.34L8.83 15l-1.41 1.41L12 21l4.59-4.59L15.17 15 12 18.17z" />
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

function MoveIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z" />
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
