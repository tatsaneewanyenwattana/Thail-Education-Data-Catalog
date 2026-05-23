"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_COLORS } from "@/constants/chartColors";
import type { StatsYearPoint } from "@/data/mockData";
import { formatYearTick } from "./chartUtils";

type SchoolChartProps = {
  data: StatsYearPoint[];
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
    <div className="rounded-radius-md border border-border-default bg-surface-card px-3 py-2 shadow-level-2">
      <p className="font-sarabun text-caption text-text-muted">{label}</p>
      <p className="font-kanit text-label font-semibold text-text-primary">
        {payload[0].value.toLocaleString()}
      </p>
    </div>
  );
}

export default function SchoolChart({ data }: SchoolChartProps) {
  const t = useTranslations("stats");
  const locale = useLocale();

  const chartData = data.map((p) => ({
    year: formatYearTick(p.year, locale),
    count: p.count,
  }));

  return (
    <div className="rounded-radius-lg border border-border-default bg-surface-card p-4 shadow-level-1 md:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-kanit text-heading-3-mobile font-semibold text-text-primary md:text-heading-3">
          {t("schoolsByYear")}
        </h2>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-radius-xs bg-primary-dark" aria-hidden />
          <span className="font-sarabun text-caption text-text-secondary">
            {t("schoolsLegend")}
          </span>
        </div>
      </div>
      <div className="h-[280px] w-full min-w-0 md:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="year"
              tick={{ fill: "#6c7a76", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#6c7a76", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip content={<ChartTooltip />} />
            <Bar
              dataKey="count"
              fill={CHART_COLORS.school}
              radius={[2, 2, 0, 0]}
              maxBarSize={48}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
