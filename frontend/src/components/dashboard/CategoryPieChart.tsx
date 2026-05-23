"use client";

import { useLocale, useTranslations } from "next-intl";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CHART_COLORS } from "@/constants/chartColors";
import type { StatsCategorySlice } from "@/data/mockData";

type CategoryPieChartProps = {
  data: StatsCategorySlice[];
};

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number }[];
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-radius-md border border-border-default bg-surface-card px-3 py-2 shadow-level-2">
      <p className="font-sarabun text-label font-medium text-text-primary">{item.name}</p>
      <p className="font-kanit text-label font-semibold text-primary-dark">{item.value}</p>
    </div>
  );
}

export default function CategoryPieChart({ data }: CategoryPieChartProps) {
  const t = useTranslations("stats");
  const locale = useLocale();
  const isTh = locale === "th";

  const chartData = data.map((item) => ({
    name: isTh ? item.nameTh : item.nameEn,
    value: item.value,
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="rounded-radius-lg border border-border-default bg-surface-card p-4 shadow-level-1 md:p-6">
      <h2 className="mb-6 font-kanit text-heading-3-mobile font-semibold text-text-primary md:text-heading-3">
        {t("datasetByCategory")}
      </h2>
      <div className="flex flex-col items-center gap-8 md:flex-row md:items-start">
        <div className="relative h-48 w-48 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={72}
                paddingAngle={2}
              >
                {chartData.map((_, index) => (
                  <Cell
                    key={chartData[index].name}
                    fill={CHART_COLORS.pie[index % CHART_COLORS.pie.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="font-kanit text-heading-3 font-bold text-text-primary">
              {total}+
            </span>
          </div>
        </div>
        <ul className="flex w-full flex-1 flex-col gap-3">
          {chartData.map((item, index) => {
            const percent = Math.round((item.value / total) * 100);
            return (
              <li
                key={item.name}
                className="flex items-center justify-between gap-2 font-sarabun text-label"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-3 w-3 shrink-0 rounded-radius-full"
                    style={{
                      backgroundColor:
                        CHART_COLORS.pie[index % CHART_COLORS.pie.length],
                    }}
                    aria-hidden
                  />
                  <span className="truncate text-text-secondary">{item.name}</span>
                </div>
                <span className="shrink-0 font-semibold text-text-primary">{percent}%</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
