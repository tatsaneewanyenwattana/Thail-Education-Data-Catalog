type AgencyDashboardFooterData = {
  totalDatasets: number;
  publishedDatasets: number;
  draftDatasets: number;
  submittedDatasets: number;
  datasetsCreatedThisMonth: number;
  datasetsCreatedLastMonth: number;
  datasetsMonthChangePercent: number | null;
  downloadsThisMonth: number;
  topDownloadFormat: string | null;
  topDownloadFormatPercent: number | null;
};

type AgencyFooterTranslator = (
  key: string,
  values?: Record<string, string | number>
) => string;

const FORMAT_LABEL_KEYS: Record<string, string> = {
  csv: "formatCsv",
  excel: "formatExcel",
  json: "formatJson",
  xml: "formatXml",
};

export function getAgencyDashboardFooters(
  stats: AgencyDashboardFooterData,
  t: AgencyFooterTranslator
) {
  return {
    totalFooter: getTotalDatasetsFooter(stats, t),
    publishedFooter: getPublishedFooter(stats, t),
    draftFooter: getDraftFooter(stats, t),
    downloadsFooter: getDownloadsFooter(stats, t),
  };
}

function getTotalDatasetsFooter(
  stats: AgencyDashboardFooterData,
  t: AgencyFooterTranslator
): string {
  if (stats.totalDatasets === 0) {
    return t("totalTrendNone");
  }

  const current = stats.datasetsCreatedThisMonth;
  const previous = stats.datasetsCreatedLastMonth;
  const percent = stats.datasetsMonthChangePercent;

  if (previous === 0 && current > 0) {
    return t("totalTrendNew", { count: current });
  }

  if (percent === null || percent === undefined) {
    return t("totalTrendThisMonth", { count: current });
  }

  if (percent === 0) {
    return t("totalTrendFlat");
  }

  const sign = percent > 0 ? "+" : "";
  return t("totalTrendPercent", {
    sign,
    percent: Math.abs(percent).toLocaleString(),
  });
}

function getPublishedFooter(
  stats: AgencyDashboardFooterData,
  t: AgencyFooterTranslator
): string {
  if (stats.totalDatasets === 0) {
    return t("publishedShareNone");
  }

  const percent = Math.round(
    (stats.publishedDatasets / stats.totalDatasets) * 100
  );
  return t("publishedShare", { percent });
}

function getDraftFooter(
  stats: AgencyDashboardFooterData,
  t: AgencyFooterTranslator
): string {
  if (stats.submittedDatasets > 0) {
    return t("submittedPending", { count: stats.submittedDatasets });
  }

  if (stats.draftDatasets > 0) {
    return t("draftPending", { count: stats.draftDatasets });
  }

  return t("draftNone");
}

function getDownloadsFooter(
  stats: AgencyDashboardFooterData,
  t: AgencyFooterTranslator
): string {
  const monthCount = stats.downloadsThisMonth;

  if (stats.topDownloadFormat && stats.topDownloadFormatPercent !== null) {
    const formatKey =
      FORMAT_LABEL_KEYS[stats.topDownloadFormat] ?? "formatCsv";
    return t("downloadsThisMonthWithFormat", {
      count: monthCount,
      format: t(formatKey),
      percent: stats.topDownloadFormatPercent,
    });
  }

  if (monthCount === 0) {
    return t("downloadsThisMonthEmpty");
  }

  return t("downloadsThisMonth", { count: monthCount });
}
