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
import type { AgencyMonthlyDownload } from "@/types/stats";

type DownloadChartProps = {
  data: AgencyMonthlyDownload[];
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
    <div className="rounded-xl border border-border-default bg-surface-card px-3 py-2 shadow-level-2">
      <p className="font-sarabun text-caption text-text-muted">{label}</p>
      <p className="font-kanit text-label font-semibold text-text-primary">
        {payload[0].value.toLocaleString()}
      </p>
    </div>
  );
}

export default function DownloadChart({ data }: DownloadChartProps) {
  const t = useTranslations("agency.dashboard");
  const locale = useLocale();

  const maxCount = Math.max(...data.map((d) => d.count), 0);

  const chartData = data.map((point) => {
    const isTop = point.count >= maxCount * 0.8;
    return {
      month: locale === "th" ? point.month : point.monthEn,
      count: point.count,
      fill: isTop ? "#1693a5" : "#80deea",
    };
  });

  return (
    <section className="overflow-hidden rounded-2xl bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="font-kanit text-[15px] font-semibold text-text-primary">
          {t("downloadChart")}
        </h2>
        <p className="font-sarabun text-xs text-text-muted mt-0.5">
          {t("downloadChartSubtitle")}
        </p>
      </div>
      {chartData.length > 0 && maxCount > 0 ? (
        <div className="h-[260px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              barCategoryGap="25%"
            >
              <CartesianGrid
                stroke={CHART_COLORS.grid}
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="month"
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
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(22,147,165,0.06)" }} />
              <Bar
                dataKey="count"
                radius={[6, 6, 0, 0]}
                fill="#80deea"
                isAnimationActive={true}
              >
                {chartData.map((entry, index) => (
                  <rect key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-[200px] flex-col items-center justify-center">
          <svg className="mb-3 h-16 w-16 text-text-muted/30" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M19 9h-4V3H9v6H5l7 7 7-7ZM5 18v2h14v-2H5Z" />
          </svg>
          <p className="font-sarabun text-body-md font-medium text-text-muted">
            {t("noDownloadData")}
          </p>
          <p className="mt-1 font-sarabun text-caption text-text-muted/70">
            {t("noDownloadDataHint")}
          </p>
        </div>
      )}
    </section>
  );
}
