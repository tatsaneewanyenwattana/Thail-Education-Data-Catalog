"use client";

import type { ReactNode } from "react";

type AgencyStatsCardProps = {
  label: string;
  value: string;
  footer?: ReactNode;
  icon: ReactNode;
  iconClassName?: string;
  trendBadge?: ReactNode;
  progressBar?: { percent: number; color?: string };
  bgGradient?: string;
  patternColor?: string;
  textColor?: "white" | "dark";
};

export default function AgencyStatsCard({
  label,
  value,
  footer,
  icon,
  iconClassName = "bg-primary-light text-primary-dark",
  trendBadge,
  progressBar,
  bgGradient,
  patternColor,
  textColor,
}: AgencyStatsCardProps) {
  const isWhite = textColor === "white";
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border-default/60 p-6 shadow-level-1 transition-shadow hover:shadow-level-2"
      style={bgGradient ? { background: bgGradient } : { backgroundColor: 'var(--color-surface-card)' }}
    >
      {patternColor && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
          <circle cx="83%" cy="-10%" r="35%" fill={patternColor} />
          <circle cx="93%" cy="80%" r="25%" fill={patternColor} />
          <circle cx="13%" cy="90%" r="18%" fill={patternColor} />
        </svg>
      )}
      {trendBadge ? (
        <div className="absolute right-4 top-4 z-10">{trendBadge}</div>
      ) : null}

      <div className="relative z-10">
        <div
          className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${iconClassName}`}
        >
          {icon}
        </div>
        <p className={`mb-1 font-sarabun text-sm font-semibold ${isWhite ? "text-white/70" : "text-text-muted"}`}>{label}</p>
        <p className={`font-kanit text-[30px] font-bold leading-tight ${isWhite ? "text-white" : "text-text-primary"}`}>
          {value}
        </p>
      </div>

      {progressBar ? (
        <div className="relative z-10 mt-4">
          <div className={`h-1.5 w-full overflow-hidden rounded-full ${isWhite ? "bg-white/20" : "bg-surface-container"}`}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, Math.max(0, progressBar.percent))}%`,
                backgroundColor: progressBar.color ?? "var(--color-primary-dark)",
              }}
            />
          </div>
        </div>
      ) : null}

      {footer ? <div className="relative z-10 mt-3">{footer}</div> : null}
    </div>
  );
}
