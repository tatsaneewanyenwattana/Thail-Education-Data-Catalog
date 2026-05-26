import { getTranslations } from "next-intl/server";
import CategoryPieChart from "@/components/dashboard/CategoryPieChart";
import SchoolChart from "@/components/dashboard/SchoolChart";
import StatsPageOverview from "@/components/dashboard/StatsPageOverview";
import StudentChart from "@/components/dashboard/StudentChart";
import TeacherChart from "@/components/dashboard/TeacherChart";
import TopDatasetList from "@/components/dashboard/TopDatasetList";
import { MOCK_STATS_DATA } from "@/data/mockData";

type StatsPageProps = {
  params: { locale: string };
};

export default async function StatsPage(_props: StatsPageProps) {
  const t = await getTranslations("stats");

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
          <StatsPageOverview />

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
