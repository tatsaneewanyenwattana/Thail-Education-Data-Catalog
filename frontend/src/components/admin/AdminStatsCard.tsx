"use client";

import type { ReactNode } from "react";

type AdminStatsCardProps = {
  label: string;
  value: string;
  icon: ReactNode;
  iconClassName?: string;
  variant?: "default" | "warning";
  badge?: ReactNode;
};

export default function AdminStatsCard({
  label,
  value,
  icon,
  iconClassName = "bg-surface-container text-status-draft",
  variant = "default",
  badge,
}: AdminStatsCardProps) {
  const isWarning = variant === "warning";

  return (
    <div
      className={`rounded-2xl border p-6 transition-all hover:-translate-y-1 ${
        isWarning
          ? "border-status-warning/10 bg-status-warning-bg shadow-md"
          : "border-white/80 bg-white shadow-md hover:shadow-lg"
      }`}
    >
      <div className="mb-5 flex items-start justify-between">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-full ${
            isWarning ? "bg-surface-card/50 text-status-warning" : iconClassName
          }`}
        >
          {icon}
        </div>
        {badge}
      </div>
      <p
        className={`mb-1 font-sarabun text-label ${
          isWarning ? "text-status-warning" : "text-text-muted"
        }`}
      >
        {label}
      </p>
      <p
        className={`font-kanit text-[36px] font-bold leading-tight ${
          isWarning
            ? "text-status-warning"
            : "text-primary-dark"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
