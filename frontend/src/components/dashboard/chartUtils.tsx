import type { StatsYearPoint } from "@/data/mockData";

export function formatCompactCount(value: number, locale: string): string {
  if (value >= 1_000_000) {
    const n = value / 1_000_000;
    const formatted =
      n >= 10
        ? Math.round(n).toString()
        : n.toFixed(1).replace(/\.0$/, "");
    return `${formatted}M`;
  }
  if (value >= 1000) {
    const k = value / 1000;
    const formatted =
      k >= 10
        ? Math.round(k).toString()
        : k.toFixed(1).replace(/\.0$/, "");
    return `${formatted}k`;
  }
  return value.toLocaleString(locale);
}

export function formatYearTick(year: string, locale: string): string {
  if (locale === "th") return year;
  const num = parseInt(year, 10);
  return Number.isNaN(num) ? year : String(num - 543);
}

export function studentsChartData(
  points: StatsYearPoint[],
  locale: string
): { year: string; count: number; countMillions: number }[] {
  return points.map((p) => ({
    year: formatYearTick(p.year, locale),
    count: p.count,
    countMillions: Math.round((p.count / 1_000_000) * 100) / 100,
  }));
}

export function teachersChartData(
  points: StatsYearPoint[],
  locale: string
): { year: string; count: number; countTenThousands: number }[] {
  return points.map((p) => ({
    year: formatYearTick(p.year, locale),
    count: p.count,
    countTenThousands: Math.round(p.count / 10_000),
  }));
}
