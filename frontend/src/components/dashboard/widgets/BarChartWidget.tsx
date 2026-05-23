"use client";

import { useLocale } from "next-intl";
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
import { mockWidgetBarData } from "@/data/mockData";

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

export default function BarChartWidget() {
  const locale = useLocale();
  const chartData = mockWidgetBarData.map((point) => ({
    name: locale === "th" ? point.name : point.nameEn,
    value: point.value,
  }));

  return (
    <div className="h-[300px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: "#6c7a76", fontSize: 12 }}
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
          <Bar
            dataKey="value"
            fill={CHART_COLORS.student}
            radius={[4, 4, 0, 0]}
            maxBarSize={48}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
