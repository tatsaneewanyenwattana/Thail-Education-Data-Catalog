import type { StatsOverviewData } from "@/types/stats";

type StatsFooterTranslator = (
  key: string,
  values?: Record<string, string | number>
) => string;

const FORMAT_LABEL_KEYS: Record<string, string> = {
  csv: "formatCsv",
  excel: "formatExcel",
  json: "formatJson",
  xml: "formatXml",
};

export function getStatsOverviewFooters(
  overview: StatsOverviewData,
  t: StatsFooterTranslator
) {
  const datasetsFooter = getDatasetsFooter(overview, t);
  const agenciesFooter = getAgenciesFooter(overview, t);
  const downloadsFooter = getDownloadsFooter(overview, t);
  const categoriesFooter = getCategoriesFooter(overview, t);

  return {
    datasetsFooter,
    agenciesFooter,
    downloadsFooter,
    categoriesFooter,
  };
}

function getDatasetsFooter(
  overview: StatsOverviewData,
  t: StatsFooterTranslator
): string {
  if (overview.total_datasets === 0) {
    return t("datasetsTrendNone");
  }

  const current = overview.datasets_published_this_month;
  const previous = overview.datasets_published_last_month;
  const percent = overview.datasets_month_change_percent;

  if (previous === 0 && current > 0) {
    return t("datasetsTrendNew", { count: current });
  }

  if (percent === null || percent === undefined) {
    return t("datasetsTrendThisMonth", { count: current });
  }

  if (percent === 0) {
    return t("datasetsTrendFlat");
  }

  const sign = percent > 0 ? "+" : "";
  return t("datasetsTrendPercent", {
    sign,
    percent: Math.abs(percent).toLocaleString(),
  });
}

function getAgenciesFooter(
  overview: StatsOverviewData,
  t: StatsFooterTranslator
): string {
  const withDatasets = overview.agencies_with_published_datasets;

  if (withDatasets === 0) {
    return t("agenciesNoteEmpty");
  }

  return t("agenciesNote", {
    withDatasets,
    total: overview.total_agencies,
  });
}

function getDownloadsFooter(
  overview: StatsOverviewData,
  t: StatsFooterTranslator
): string {
  if (!overview.top_download_format || overview.top_download_format_percent === null) {
    return t("downloadsNoteEmpty");
  }

  const formatKey = FORMAT_LABEL_KEYS[overview.top_download_format] ?? "formatCsv";
  return t("downloadsNote", {
    format: t(formatKey),
    percent: overview.top_download_format_percent,
  });
}

function getCategoriesFooter(
  overview: StatsOverviewData,
  t: StatsFooterTranslator
): string {
  const total =
    overview.total_categories ??
    overview.total_categories_level1 + overview.total_categories_level2;

  if (total === 0) {
    return t("categoriesNoteEmpty");
  }

  const maxLevel = Object.keys(overview.categories_by_level ?? {})
    .map((level) => Number(level))
    .filter((level) => !Number.isNaN(level))
    .reduce((max, level) => Math.max(max, level), 1);

  return t("categoriesNote", { maxLevel });
}
