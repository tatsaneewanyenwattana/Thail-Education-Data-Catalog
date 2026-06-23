"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_COLORS } from "@/constants/chartColors";
import {
  toYearlyChartData,
  useAdminDownloadSourceMonthly,
  useAdminDownloadSourceYearly,
} from "@/hooks/useAdminDownloadStats";
import { toChartData, useAdminStatsYears } from "@/hooks/useAdminMonthlyStats";

const CURRENT_YEAR = new Date().getFullYear();

function YearDropdown({
  value,
  options,
  onChange,
  label,
  prefix,
}: {
  value: number;
  options: number[];
  onChange: (v: number) => void;
  label: string;
  prefix: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 items-center gap-1.5 rounded-full border border-gray-200 bg-gray-100 px-4 font-sarabun text-label text-text-primary shadow-sm transition-all hover:border-primary-dark/30 hover:shadow-md"
        aria-label={label}
      >
        {prefix} {value}
        <svg className="h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-1.5 min-w-[120px] overflow-hidden rounded-2xl border border-gray-200 bg-white py-1 shadow-lg">
          {options.map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => { onChange(y); setOpen(false); }}
              className={`flex w-full px-4 py-2.5 font-sarabun text-label transition-colors ${
                y === value
                  ? "bg-primary-dark/10 font-bold text-primary-dark"
                  : "text-text-primary hover:bg-gray-50"
              }`}
            >
              {prefix} {y}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

type Granularity = "month" | "year";

type AdminDownloadSourceChartProps = {
  source: "web" | "api";
};

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-radius-md border border-border-default bg-surface-navy px-3 py-2 shadow-level-2">
      <p className="font-sarabun text-caption text-white/70">{label}</p>
      <p className="font-kanit text-label font-semibold text-white">
        {payload[0].value.toLocaleString()}
      </p>
    </div>
  );
}

export default function AdminDownloadSourceChart({
  source,
}: AdminDownloadSourceChartProps) {
  const t = useTranslations("admin.dashboard");
  const locale = useLocale();
  const [granularity, setGranularity] = useState<Granularity>("month");

  const { data: availableYears = [] } = useAdminStatsYears();
  const defaultYear = availableYears[0] ?? CURRENT_YEAR;
  const [year, setYear] = useState<number | null>(null);
  const selectedYear = year ?? defaultYear;

  const monthlyQuery = useAdminDownloadSourceMonthly(selectedYear);
  const yearlyQuery = useAdminDownloadSourceYearly();

  const isLoading =
    granularity === "month" ? monthlyQuery.isLoading : yearlyQuery.isLoading;
  const isError =
    granularity === "month" ? monthlyQuery.isError : yearlyQuery.isError;

  const emptyMonths = toChartData([], locale).map((p) => ({
    label: p.month,
    count: p.count,
  }));

  const chartData =
    granularity === "month"
      ? monthlyQuery.data
        ? toChartData(
            source === "web"
              ? monthlyQuery.data.web_by_month
              : monthlyQuery.data.api_by_month,
            locale
          ).map((p) => ({ label: p.month, count: p.count }))
        : emptyMonths
      : yearlyQuery.data
        ? toYearlyChartData(
            source === "web"
              ? yearlyQuery.data.web_by_year
              : yearlyQuery.data.api_by_year
          )
        : [];

  const lineColor =
    source === "web" ? CHART_COLORS.downloadWeb : CHART_COLORS.downloadApi;

  const toggleClass = (active: boolean) =>
    `min-h-[36px] rounded-full px-4 font-sarabun text-caption font-medium transition-all ${
      active
        ? "bg-primary-dark text-white shadow-md"
        : "bg-gray-100 text-text-secondary hover:bg-gray-200 hover:text-primary-dark"
    }`;

  return (
    <section className="rounded-2xl border border-white/80 bg-white p-6 shadow-md">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-kanit text-heading-3 font-semibold text-text-primary">
          {source === "web" ? t("webDownloadChart") : t("apiDownloadChart")}
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setGranularity("month")}
            className={toggleClass(granularity === "month")}
          >
            {t("monthlyToggle")}
          </button>
          <button
            type="button"
            onClick={() => setGranularity("year")}
            className={toggleClass(granularity === "year")}
          >
            {t("yearlyToggle")}
          </button>
          {granularity === "month" && (
            <YearDropdown
              value={selectedYear}
              options={availableYears}
              onChange={(v) => setYear(v)}
              label={t("yearLabel")}
              prefix={t("yearPrefix")}
            />
          )}
        </div>
      </div>

      {isError && (
        <p className="py-8 text-center font-sarabun text-caption text-status-error">
          {t("chartLoadError")}
        </p>
      )}

      <div
        className={`h-64 w-full min-w-0 transition-opacity ${isLoading ? "opacity-40" : "opacity-100"}`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id={`grad-${source}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={lineColor} stopOpacity={0.3} />
                <stop offset="100%" stopColor={lineColor} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tick={{ fill: "#6c7a76", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#6c7a76", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={48}
              tickFormatter={(value) =>
                value >= 1000 ? `${Math.round(value / 1000)}k` : String(value)
              }
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="count"
              stroke={lineColor}
              strokeWidth={3}
              fill={`url(#grad-${source})`}
              dot={{ r: 4, fill: lineColor, stroke: "#fff", strokeWidth: 2 }}
              activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
