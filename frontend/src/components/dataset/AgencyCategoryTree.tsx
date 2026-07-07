"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import type { CategoryTreeNode } from "@/utils/categoryTreeUtils";
import { canAddChild } from "@/utils/categoryTreeUtils";

type AgencyCategoryTreeProps = {
  nodes: CategoryTreeNode[];
  isLoading?: boolean;
  onAddRoot: () => void;
  onAddChild: (parent: CategoryTreeNode) => void;
  onEdit: (node: CategoryTreeNode) => void;
  onDelete: (node: CategoryTreeNode, displayName: string) => void;
  onMove?: (node: CategoryTreeNode) => void;
  filterLevel?: number;
};

function CategoryIcon({ level }: { level: number }) {
  const colors =
    level === 1
      ? "bg-[#e1f5fe] text-[#03a9f4]"
      : "bg-[#e1f5fe] text-[#03a9f4]";
  return (
    <div
      className={`flex h-9 w-9 items-center justify-center rounded-xl ${colors}`}
    >
      <svg
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
      >
        <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
      </svg>
    </div>
  );
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
  node: CategoryTreeNode;
  depth: number;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onAddChild: (parent: CategoryTreeNode) => void;
  onEdit: (node: CategoryTreeNode) => void;
  onDelete: (node: CategoryTreeNode, displayName: string) => void;
  onMove?: (node: CategoryTreeNode) => void;
  locale: string;
  t: ReturnType<typeof useTranslations>;
}) {
  const label = locale === "th" ? node.nameTh : node.nameEn;
  const hasChildren = node.children.length > 0;
  const isExpanded = expanded.has(node.id);

  return (
    <>
      <tr className="transition-colors hover:bg-gray-50/50">
        <td className="px-6 py-4">
          <div
            className="flex items-center gap-3"
            style={{ paddingLeft: `${depth * 24}px` }}
          >
            {hasChildren ? (
              <button
                type="button"
                onClick={() => onToggle(node.id)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-text-muted hover:bg-surface-container"
                aria-expanded={isExpanded}
              >
                <ChevronIcon open={isExpanded} />
              </button>
            ) : (
              <span className="inline-block h-7 w-7 shrink-0" />
            )}
            <CategoryIcon level={node.level} />
            <div className="min-w-0">
              <span className="block font-sarabun text-body-md font-semibold text-text-primary">
                {label}
              </span>
              <span className="font-sarabun text-[11px] text-text-muted">
                {t("levelBadge", { level: node.level })}
              </span>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 font-mono text-body-md text-text-muted">
          {node.slug}
        </td>
        <td className="px-6 py-4">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-light px-3 py-1 font-sarabun text-caption font-bold text-primary-dark">
            <DatasetSmallIcon />
            {t("datasetCount", { count: node.datasetCount })}
          </span>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center justify-center gap-1.5">
            {canAddChild(node) && (
              <button
                type="button"
                onClick={() => onAddChild(node)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8f5e9] text-[#43a047] transition-colors hover:bg-[#c8e6c9]"
                aria-label={t("addChild")}
                title={t("addChild")}
              >
                <PlusSmallIcon />
              </button>
            )}
            {onMove && node.parentId && (
              <button
                type="button"
                onClick={() => onMove(node)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-[#e3f2fd] hover:text-[#1565c0]"
                aria-label="ย้ายหมวดหมู่"
                title="ย้ายหมวดหมู่"
              >
                <MoveIcon />
              </button>
            )}
            <button
              type="button"
              onClick={() => onEdit(node)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-container hover:text-primary-dark"
              aria-label={t("formTitleEdit")}
              title={t("formTitleEdit")}
            >
              <EditIcon />
            </button>
            <button
              type="button"
              onClick={() => onDelete(node, label)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-[#ffdad6] hover:text-status-error"
              aria-label={t("confirmDelete")}
              title={t("confirmDelete")}
            >
              <DeleteIcon />
            </button>
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

export default function AgencyCategoryTree({
  nodes,
  isLoading,
  onAddRoot,
  onAddChild,
  onEdit,
  onDelete,
  onMove,
  filterLevel,
}: AgencyCategoryTreeProps) {
  const t = useTranslations("agency.categories");
  const locale = useLocale();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredNodes =
    filterLevel === 2
      ? nodes.flatMap((n) => n.children)
      : nodes;

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3 rounded-2xl border border-border-default/60 bg-surface-card p-6 shadow-level-1">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-14 rounded-xl bg-surface-container" />
        ))}
      </div>
    );
  }

  if (filteredNodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border-default/60 bg-surface-card px-6 py-16 text-center shadow-level-1">
        <p className="font-sarabun text-body-lg text-text-secondary">
          {t("empty")}
        </p>
        <button
          type="button"
          onClick={onAddRoot}
          className="mt-4 rounded-xl bg-primary-dark px-6 py-2.5 font-sarabun text-label font-bold text-white"
        >
          {t("addRoot")}
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border-default/60 bg-surface-card shadow-level-1">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border-default/30 bg-[#f3f4f5] font-sarabun text-[15px] font-bold text-text-muted">
              <th className="px-6 py-4">{t("colName")}</th>
              <th className="px-6 py-4">SLUG</th>
              <th className="px-6 py-4">{t("colDatasets")}</th>
              <th className="px-6 py-4 text-center">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/60">
            {filteredNodes.map((node) => (
              <TreeRow
                key={node.id}
                node={node}
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

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-4 w-4 transition-transform ${open ? "rotate-90" : ""}`}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
    </svg>
  );
}

function DatasetSmallIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H5v-2h7v2zm7-4H5v-2h14v2zm0-4H5V7h14v2z" />
    </svg>
  );
}

function PlusSmallIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
  );
}

function MoveIcon() {
  return (
    <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
    </svg>
  );
}
