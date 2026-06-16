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
};

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
  node: CategoryTreeNode;
  depth: number;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onAddChild: (parent: CategoryTreeNode) => void;
  onEdit: (node: CategoryTreeNode) => void;
  onDelete: (node: CategoryTreeNode, displayName: string) => void;
  locale: string;
  t: ReturnType<typeof useTranslations>;
}) {
  const label = locale === "th" ? node.nameTh : node.nameEn;
  const hasChildren = node.children.length > 0;
  const isExpanded = expanded.has(node.id);

  return (
    <>
      <tr className="transition-colors hover:bg-surface-page">
        <td className="px-4 py-3">
          <div
            className="flex items-center gap-2"
            style={{ paddingLeft: `${depth * 20}px` }}
          >
            {hasChildren ? (
              <button
                type="button"
                onClick={() => onToggle(node.id)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-radius-sm text-text-muted hover:bg-surface-container"
                aria-expanded={isExpanded}
              >
                <ChevronIcon open={isExpanded} />
              </button>
            ) : (
              <span className="inline-block h-7 w-7 shrink-0" />
            )}
            <span className="font-sarabun text-body-md text-text-primary">
              {label}
            </span>
            <span className="rounded-radius-full bg-surface-container px-2 py-0.5 font-sarabun text-caption text-text-muted">
              {t("levelBadge", { level: node.level })}
            </span>
          </div>
        </td>
        <td className="px-4 py-3 font-mono text-code text-text-muted">
          {node.slug}
        </td>
        <td className="px-4 py-3">
          <span className="inline-flex rounded-radius-full bg-primary-light px-3 py-1 font-sarabun text-caption font-bold text-primary-dark">
            {t("datasetCount", { count: node.datasetCount })}
          </span>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center justify-center gap-2">
            {canAddChild(node) && (
              <button
                type="button"
                onClick={() => onAddChild(node)}
                className="rounded-radius-md px-2 py-1 font-sarabun text-caption font-medium text-primary-dark transition-colors hover:bg-primary-light"
              >
                {t("addChild")}
              </button>
            )}
            <button
              type="button"
              onClick={() => onEdit(node)}
              className="rounded-radius-md p-1.5 text-text-muted transition-colors hover:bg-primary-light hover:text-primary-dark"
              aria-label={t("formTitleEdit")}
            >
              <EditIcon />
            </button>
            <button
              type="button"
              onClick={() => onDelete(node, label)}
              className="rounded-radius-md p-1.5 text-text-muted transition-colors hover:bg-status-error-bg hover:text-status-error"
              aria-label={t("confirmDelete")}
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

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3 rounded-radius-lg border border-border-default/80 bg-surface-card p-6 shadow-level-1">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-12 rounded-radius-sm bg-surface-container"
          />
        ))}
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-radius-lg border border-border-default/80 bg-surface-card px-6 py-16 text-center shadow-level-1">
        <p className="font-sarabun text-body-lg text-text-secondary">
          {t("empty")}
        </p>
        <button
          type="button"
          onClick={onAddRoot}
          className="mt-4 rounded-radius-lg bg-primary px-6 py-2.5 font-sarabun text-label font-bold text-surface-card"
        >
          {t("addRoot")}
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-radius-lg border border-border-default/80 bg-surface-card shadow-level-1">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border-default/30 bg-surface-container font-kanit text-label font-semibold text-text-secondary">
              <th className="px-4 py-4">{t("colName")}</th>
              <th className="px-4 py-4">{t("colSlug")}</th>
              <th className="px-4 py-4">{t("colDatasets")}</th>
              <th className="px-4 py-4 text-center">{t("colAction")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default/20">
            {nodes.map((node) => (
              <TreeRow
                key={node.id}
                node={node}
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
