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
}: AgencyStatsCardProps) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border-default/60 p-5 shadow-level-1 transition-shadow hover:shadow-level-2"
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

      <div className="relative z-10 flex items-start gap-4">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-full ${iconClassName}`}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-sarabun text-caption text-text-muted">{label}</p>
          <p className="mt-1 font-kanit text-[28px] font-bold leading-tight text-text-primary">
            {value}
          </p>
        </div>
      </div>

      {progressBar ? (
        <div className="relative z-10 mt-4">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container">
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
