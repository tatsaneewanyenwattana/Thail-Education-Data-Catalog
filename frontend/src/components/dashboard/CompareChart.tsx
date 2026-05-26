"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_COLORS } from "@/constants/chartColors";
import type { ApiDataset } from "@/types/dataset";

type CompareChartProps = {
  datasets: ApiDataset[];
};

type CompareRow = {
  metric: string;
  [key: string]: string | number;
};

function truncateTitle(title: string, max = 24): string {
  if (title.length <= max) return title;
  return `${title.slice(0, max)}…`;
}

export default function CompareChart({ datasets }: CompareChartProps) {
  const t = useTranslations("compare");
  const locale = useLocale();

  const labels = datasets.map((d, i) =>
    truncateTitle(d.title || `${t("currentDataset")} ${i + 1}`)
  );

  const chartData: CompareRow[] = [
    {
      metric: t("metricDownloads"),
      ...Object.fromEntries(
        datasets.map((d, i) => [labels[i], d.download_count ?? 0])
      ),
    },
    {
      metric: t("metricViews"),
      ...Object.fromEntries(
        datasets.map((d, i) => [labels[i], d.view_count ?? 0])
      ),
    },
  ];

  const colors = [
    CHART_COLORS.student,
    CHART_COLORS.teacher,
    CHART_COLORS.school,
  ];

  return (
    <div className="rounded-radius-lg border border-border-default bg-surface-card p-4 shadow-level-1 md:p-6">
      <div className="h-[320px] w-full min-h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="metric"
              tick={{ fontSize: 12, fill: "#6c7a76" }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#6c7a76" }}
              tickFormatter={(v) => Number(v).toLocaleString(locale)}
            />
            <Tooltip
              formatter={(value: number) => value.toLocaleString(locale)}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                fontFamily: "Sarabun, sans-serif",
              }}
            />
            <Legend />
            {labels.map((label, index) => (
              <Bar
                key={label}
                dataKey={label}
                fill={colors[index % colors.length]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
