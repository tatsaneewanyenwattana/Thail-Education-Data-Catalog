"use client";

import { useLocale } from "next-intl";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { CHART_COLORS } from "@/constants/chartColors";
import { mockWidgetPieData } from "@/data/mockData";

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number }[];
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-radius-md border border-border-default bg-surface-card px-3 py-2 shadow-level-2">
      <p className="font-sarabun text-caption text-text-muted">{payload[0].name}</p>
      <p className="font-kanit text-label font-semibold text-text-primary">
        {payload[0].value.toLocaleString()}
      </p>
    </div>
  );
}

export default function PieChartWidget() {
  const locale = useLocale();
  const chartData = mockWidgetPieData.map((point) => ({
    name: locale === "th" ? point.name : point.nameEn,
    value: point.value,
  }));

  return (
    <div className="h-[280px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
          >
            {chartData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={CHART_COLORS.pie[index % CHART_COLORS.pie.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
