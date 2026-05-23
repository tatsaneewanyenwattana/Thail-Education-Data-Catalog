"use client";

import { useLocale, useTranslations } from "next-intl";
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
import type { StatsYearPoint } from "@/data/mockData";
import { teachersChartData } from "./chartUtils";

type TeacherChartProps = {
  data: StatsYearPoint[];
};

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { payload: { count: number } }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-radius-md border border-border-default bg-surface-card px-3 py-2 shadow-level-2">
      <p className="font-sarabun text-caption text-text-muted">{label}</p>
      <p className="font-kanit text-label font-semibold text-text-primary">
        {payload[0].payload.count.toLocaleString()}
      </p>
    </div>
  );
}

export default function TeacherChart({ data }: TeacherChartProps) {
  const t = useTranslations("stats");
  const locale = useLocale();
  const chartData = teachersChartData(data, locale);

  return (
    <div className="rounded-radius-lg border border-border-default bg-surface-card p-4 shadow-level-1 md:p-6">
      <h2 className="mb-6 font-kanit text-heading-3-mobile font-semibold text-text-primary md:text-heading-3">
        {t("teachersByYear")}
      </h2>
      <div className="h-[240px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" />
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
              width={40}
            />
            <Tooltip content={<ChartTooltip />} />
            <Line
              type="monotone"
              dataKey="countTenThousands"
              stroke={CHART_COLORS.teacher}
              strokeWidth={2}
              dot={{ fill: CHART_COLORS.teacher, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
