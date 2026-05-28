"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
    <div className="rounded-radius-md border border-border-default bg-surface-card px-3 py-2 shadow-level-2">
      <p className="font-sarabun text-caption text-text-muted">{label}</p>
      <p className="font-kanit text-label font-semibold text-text-primary">
        {payload[0].value.toLocaleString()}
      </p>
    </div>
  );
}

export default function AdminDatasetChart() {
  const t = useTranslations("admin.dashboard");
  const locale = useLocale();
  const { data: availableYears = [] } = useAdminStatsYears();
  const defaultYear = availableYears[0] ?? CURRENT_YEAR;
  const [year, setYear] = useState<number | null>(null);
  const selectedYear = year ?? defaultYear;

  const { data, isLoading, isError } = useAdminMonthlyStats(selectedYear);

  const chartData = data
    ? toChartData(data.datasets_by_month, locale)
    : Array.from({ length: 12 }, (_, i) => ({
        month: ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."][i],
        count: 0,
      }));

  const maxCount = Math.max(...chartData.map((item) => item.count), 1);

  return (
    <section className="rounded-radius-lg border border-border-default/80 bg-surface-card p-6 shadow-level-1">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-kanit text-heading-3 font-semibold text-text-primary">
          {t("datasetChart")}
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
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: "#6c7a76", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(0,168,150,0.08)" }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={48}>
              {chartData.map((entry) => (
                <Cell
                  key={entry.month}
                  fill={
                    entry.count === maxCount && maxCount > 0
                      ? CHART_COLORS.student
                      : `${CHART_COLORS.student}55`
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
