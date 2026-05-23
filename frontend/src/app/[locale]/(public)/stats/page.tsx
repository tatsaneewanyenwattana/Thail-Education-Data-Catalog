import { getTranslations } from "next-intl/server";
import CategoryPieChart from "@/components/dashboard/CategoryPieChart";
import SchoolChart from "@/components/dashboard/SchoolChart";
import StatsCard from "@/components/dashboard/StatsCard";
import StudentChart from "@/components/dashboard/StudentChart";
import TeacherChart from "@/components/dashboard/TeacherChart";
import TopDatasetList from "@/components/dashboard/TopDatasetList";
import { formatCompactCount } from "@/components/dashboard/chartUtils";
import { MOCK_STATS_DATA } from "@/data/mockData";

type StatsPageProps = {
  params: { locale: string };
};

export default async function StatsPage({ params }: StatsPageProps) {
  const t = await getTranslations("stats");
  const { locale } = params;
  const { overview } = MOCK_STATS_DATA;

  const totalDatasets = overview.totalDatasets.toLocaleString(locale);
  const totalAgencies = overview.totalAgencies.toLocaleString(locale);
  const totalDownloads = formatCompactCount(overview.totalDownloads, locale);
  const totalCategories = overview.totalCategories.toLocaleString(locale);

  return (
    <>
      <section className="border-b border-border-default/60 bg-surface-card px-4 py-spacing-6 md:px-spacing-10">
        <div className="mx-auto max-w-container-max">
          <h1 className="font-kanit text-heading-2 text-text-primary md:text-heading-1">
            {t("title")}
          </h1>
          <p className="mt-1 font-sarabun text-label text-text-muted">{t("subtitle")}</p>
        </div>
      </section>

      <section className="bg-surface-page px-4 py-spacing-6 md:px-spacing-10">
        <div className="mx-auto max-w-container-max space-y-spacing-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            <StatsCard
              label={t("totalDatasets")}
              value={totalDatasets}
              footer={t("datasetsTrend")}
              valueClassName="text-text-primary"
            />
            <StatsCard
              label={t("totalAgencies")}
              value={totalAgencies}
              footer={t("agenciesNote")}
              valueClassName="text-primary-dark"
            />
            <StatsCard
              label={t("totalDownloads")}
              value={totalDownloads}
              footer={t("downloadsNote")}
              valueClassName="text-primary"
            />
            <StatsCard
              label={t("totalCategories")}
              value={totalCategories}
              footer={t("categoriesNote")}
              valueClassName="text-status-draft"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <StudentChart data={MOCK_STATS_DATA.studentsByYear} />
            <TeacherChart data={MOCK_STATS_DATA.teachersByYear} />
          </div>

          <SchoolChart data={MOCK_STATS_DATA.schoolsByYear} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <CategoryPieChart data={MOCK_STATS_DATA.datasetByCategory} />
            <TopDatasetList items={MOCK_STATS_DATA.topDatasets} />
          </div>

          <p className="text-center font-sarabun text-caption text-text-muted">
            {t("mockNote")}
          </p>
        </div>
      </section>
    </>
  );
}
