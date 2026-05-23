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
import { mockWidgetLineData } from "@/data/mockData";

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

export default function LineChartWidget() {
  const t = useTranslations("agency.customDashboard.widgets");
  const locale = useLocale();
  const chartData = mockWidgetLineData.map((point) => ({
    name: locale === "th" ? point.name : point.nameEn,
    value: point.value,
  }));

  return (
    <div>
      <div className="mb-4 flex items-center justify-end gap-2">
        <span className="h-3 w-3 rounded-radius-full bg-primary" />
        <span className="font-sarabun text-caption text-text-muted">
          {t("lineLegend")}
        </span>
      </div>
      <div className="h-[260px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" />
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
            <Line
              type="monotone"
              dataKey="value"
              stroke={CHART_COLORS.student}
              strokeWidth={3}
              dot={{ r: 5, fill: CHART_COLORS.student }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
