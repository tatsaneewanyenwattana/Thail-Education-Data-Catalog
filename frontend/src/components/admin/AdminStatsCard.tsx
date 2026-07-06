"use client";

import type { ReactNode } from "react";

type AdminStatsCardProps = {
  label: string;
  value: string;
  icon: ReactNode;
  iconClassName?: string;
  variant?: "default" | "warning" | "highlight";
  gradient?: { from: string; to: string; darkText?: boolean };
  badge?: ReactNode;
  className?: string;
};

const waveSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Ccircle cx='250' cy='-20' r='120' fill='rgba(0,129,167,0.04)'/%3E%3Ccircle cx='280' cy='160' r='80' fill='rgba(0,175,185,0.03)'/%3E%3C/svg%3E")`;

const highlightWaveSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Ccircle cx='250' cy='-20' r='120' fill='rgba(255,255,255,0.15)'/%3E%3Ccircle cx='280' cy='160' r='80' fill='rgba(255,255,255,0.10)'/%3E%3Ccircle cx='40' cy='180' r='60' fill='rgba(255,255,255,0.06)'/%3E%3C/svg%3E")`;

const darkTextWaveSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Ccircle cx='250' cy='-20' r='120' fill='rgba(0,0,0,0.08)'/%3E%3Ccircle cx='280' cy='160' r='80' fill='rgba(0,0,0,0.06)'/%3E%3Ccircle cx='40' cy='180' r='60' fill='rgba(0,0,0,0.04)'/%3E%3C/svg%3E")`;

export default function AdminStatsCard({
  label,
  value,
  icon,
  iconClassName = "bg-surface-container text-status-draft",
  variant = "default",
  gradient,
  badge,
  className = "",
}: AdminStatsCardProps) {
  const isWarning = variant === "warning";
  const isHighlight = variant === "highlight";
  const hasGradient = !!gradient;
  const isColorful = isHighlight || hasGradient;
  const isDarkText = hasGradient && gradient.darkText;

  const gradientBg = hasGradient
    ? `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`
    : isHighlight
      ? `linear-gradient(135deg, #053F5C 0%, #0081A7 100%)`
      : undefined;

  return (
    <div
      className={`rounded-2xl border p-6 transition-all hover:shadow-md ${
        isColorful
          ? "border-transparent shadow-sm"
          : isWarning
            ? "border-[#ef6c00]/10 shadow-sm"
            : "shadow-sm"
      } ${className}`}
      style={
        isColorful
          ? {
              background: gradientBg,
              backgroundImage: `${isDarkText ? darkTextWaveSvg : highlightWaveSvg}, ${gradientBg}`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right top",
            }
          : isWarning
            ? {
                background: "#ef6c0010",
                border: "1px solid rgba(239,108,0,0.1)",
              }
            : {
                background: "rgba(255,255,255,0.9)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(0,129,167,0.08)",
                backgroundImage: waveSvg,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right top",
              }
      }
    >
      <div className="mb-5 flex items-start justify-between">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
            isColorful
              ? isDarkText ? "bg-black/10 text-[#053F5C]" : "bg-white/20 text-white"
              : isWarning
                ? "bg-surface-card/50 text-[#ef6c00]"
                : iconClassName
          }`}
        >
          {icon}
        </div>
        {badge}
      </div>
      <p
        className={`mb-1 font-sarabun text-sm font-semibold ${
          isColorful
            ? isDarkText ? "text-[#053F5C]/70" : "text-white/80"
            : isWarning
              ? "text-[#ef6c00]"
              : "text-text-muted"
        }`}
      >
        {label}
      </p>
      <p
        className={`font-kanit text-[30px] font-bold leading-tight ${
          isColorful
            ? isDarkText ? "text-[#053F5C]" : "text-white"
            : isWarning
              ? "text-[#ef6c00]"
              : "text-[#053F5C]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
