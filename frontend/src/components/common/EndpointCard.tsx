"use client";

import { useState } from "react";
import type { ApiEndpointDoc, ApiHttpMethod } from "@/data/apiDocsContent";
import { getLocalizedText } from "@/data/apiDocsContent";
import CodeBlock from "@/components/common/CodeBlock";
import PermissionBadge from "@/components/common/PermissionBadge";

const METHOD_COLORS: Record<ApiHttpMethod, { bg: string; text: string }> = {
  GET: { bg: "#e8f5e9", text: "#00695c" },
  POST: { bg: "#e8f5e9", text: "#004d40" },
  PUT: { bg: "#fff8e1", text: "#f57f17" },
  PATCH: { bg: "#fff8e1", text: "#f57f17" },
  DELETE: { bg: "#fef2f2", text: "#c41411" },
};

type EndpointCardProps = {
  endpoint: ApiEndpointDoc;
  locale: string;
  requestLabel: string;
  responseLabel: string;
  expandLabel: string;
  collapseLabel: string;
};

export default function EndpointCard({
  endpoint,
  locale,
  requestLabel,
  responseLabel,
  expandLabel,
  collapseLabel,
}: EndpointCardProps) {
  const [open, setOpen] = useState(false);
  const title = getLocalizedText(endpoint.title, locale);
  const description = getLocalizedText(endpoint.description, locale);
  const methodStyle = METHOD_COLORS[endpoint.method];

  return (
    <article
      id={endpoint.id}
      className="scroll-mt-28 overflow-hidden rounded-2xl border border-border-default/60 bg-white shadow-level-1"
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full flex-col gap-4 px-6 py-5 text-left transition-colors hover:bg-gray-50 md:px-8"
        aria-expanded={open}
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className="inline-flex min-w-16 justify-center rounded-lg px-3 py-1.5 font-mono text-body-md font-bold"
                style={{ backgroundColor: methodStyle.bg, color: methodStyle.text }}
              >
                {endpoint.method}
              </span>
              <code className="break-all rounded-lg px-3 py-1.5 font-mono text-body-md" style={{ backgroundColor: "#f5f5f5", color: "#00695c" }}>
                {endpoint.path}
              </code>
            </div>
            <div>
              <h3 className="font-kanit text-body-lg font-bold" style={{ color: "#1a3a2a" }}>
                {title}
              </h3>
              <p className="mt-1 font-sarabun text-body-md text-text-secondary">
                {description}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            {endpoint.permissions.map((permission) => (
              <PermissionBadge key={permission} permission={permission} />
            ))}
          </div>
        </div>

        <span className="inline-flex items-center gap-2 self-start font-sarabun text-label font-bold" style={{ color: "#00695c" }}>
          {open ? collapseLabel : expandLabel}
          <ChevronIcon open={open} />
        </span>
      </button>

      {open && (
        <div className="grid gap-5 border-t border-border-default/40 p-6 md:grid-cols-2 md:p-8" style={{ backgroundColor: "#fafafa" }}>
          <div>
            <h4 className="mb-3 font-kanit text-label font-bold" style={{ color: "#1a3a2a" }}>
              {requestLabel}
            </h4>
            <CodeBlock code={endpoint.requestExample} label="REQUEST" />
          </div>
          <div>
            <h4 className="mb-3 font-kanit text-label font-bold" style={{ color: "#1a3a2a" }}>
              {responseLabel}
            </h4>
            <CodeBlock code={endpoint.responseExample} label="JSON" />
          </div>
        </div>
      )}
    </article>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
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
