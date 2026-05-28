"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_COLORS } from "@/constants/chartColors";
import { toChartData, useAdminMonthlyStats, useAdminStatsYears } from "@/hooks/useAdminMonthlyStats";

const CURRENT_YEAR = new Date().getFullYear();

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

export default function AdminDownloadChart() {
  const t = useTranslations("admin.dashboard");
  const locale = useLocale();
  const { data: availableYears = [] } = useAdminStatsYears();
  const defaultYear = availableYears[0] ?? CURRENT_YEAR;
  const [year, setYear] = useState<number | null>(null);
  const selectedYear = year ?? defaultYear;

  const { data, isLoading, isError } = useAdminMonthlyStats(selectedYear);

  const chartData = data
    ? toChartData(data.downloads_by_month, locale)
    : Array.from({ length: 12 }, (_, i) => ({
        month: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."][i],
        count: 0,
      }));

  return (
    <section className="rounded-radius-lg border border-border-default/80 bg-surface-card p-6 shadow-level-1">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-kanit text-heading-3 font-semibold text-text-primary">
          {t("downloadChart")}
        </h2>
        <select
          value={selectedYear}
          onChange={(e) => setYear(Number(e.target.value))}
          className="h-9 rounded-radius-sm border border-border-input bg-surface-container px-3 font-sarabun text-label text-text-primary focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-primary-dark/20"
          aria-label={t("yearLabel")}
        >
          {availableYears.map((y) => (
            <option key={y} value={y}>
              {t("yearPrefix")} {y}
            </option>
          ))}
        </select>
      </div>

      {isError && (
        <p className="py-8 text-center font-sarabun text-caption text-status-error">
          โหลดข้อมูลไม่สำเร็จ
        </p>
      )}

      <div className={`h-64 w-full min-w-0 transition-opacity ${isLoading ? "opacity-40" : "opacity-100"}`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
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
            <Line
              type="monotone"
              dataKey="count"
              stroke={CHART_COLORS.student}
              strokeWidth={3}
              dot={{ r: 4, fill: CHART_COLORS.student }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
